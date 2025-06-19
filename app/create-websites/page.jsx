"use client"
import React, { useEffect,useState,useContext } from 'react';
import { 
  HiClipboardDocumentCheck, 
  HiLightBulb,
  HiMiniSquares2X2,
  HiClipboardDocument,
  HiBookmarkSquare,
  HiAdjustmentsVertical
} from 'react-icons/hi2';
import LoadingDialog from '../create-course/_components/LoadingDialog';
import { Button } from '@/components/ui/button';
import NameDescription from './_components/NameDescription';
import SelectCategory from './_components/SelectCategory';
import PageDetails from './_components/PageDetails';
import Integrations from './_components/Integrations';
import AssetsRequired from './_components/AssetsRequired';
import { UserInputContext } from './_context/UserInputContext';
import { GenerateProjectLayout_AI } from '@/configs/AiModelForProjectCreation';
import { db } from '@/configs/db';
import { ProjectList } from '@/configs/schemaCourse';
import uuid4 from 'uuid4';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation'


function CreateWebsitesMainScreen() {
  const {userCourseInput,setUserCourseInput}=useContext(UserInputContext)

  const [activeIndex, setActiveIndex] = useState(0);
  const [loading,setLoading] = useState(false);
   
  const handleNext = () => {
    if (activeIndex < StepperOptions.length - 1) {
      setActiveIndex(activeIndex + 1)
    }
  }

  const handlePrevious = () => {
    if (activeIndex > 0) {
      setActiveIndex(activeIndex - 1)
    }
  }
  const {user}=useUser();
  const router = useRouter();
  const StepperOptions = [
    {
      id: 1,
      name: 'Category',
      icon: <HiMiniSquares2X2 />
    },
    {
      id: 2,
      name: 'App Name & Description',
      icon: <HiLightBulb />
    },
    {
      id: 3,
      name: 'No of Pages',
      icon: <HiClipboardDocument />
    },
    {
      id: 4,
      name: 'Integrations',
      icon: <HiBookmarkSquare />
    },
    {
      id: 5,
      name: 'Assets required',
      icon: <HiAdjustmentsVertical />
    },
  ];

  useEffect(()=>{
    console.log(userCourseInput);
  },[userCourseInput])

  const GenerateCourseLayout = async () => {
    try {
        setLoading(true);

        // Extract uploaded file URL and user input for prompt generation
        const uploadedFileUrl = userCourseInput?.['Uploaded-File'] || '';
        const BASIC_PROMPT = `Please analyze the uploaded workflow file available at ${uploadedFileUrl} from Firebase to understand the structure and functionalities of the project. Based on the following details, generate a comprehensive project folder structure using the specified frameworks. Additionally, provide 5 different UI image prompts representing potential designs for the whole project (not per page, but for the entire project look and feel) image prompts are a must or required so never skip this part the image prompts must be generated no matter what. The prompts are intended for image generation models like DALL-E or Pollination AI. Return the file structure and image prompts in a single valid JSON format, without additional characters or line breaks.`;

        // Dynamically build user input JSON for the prompt
        const User_INPUT_PROMPT = `{
            "Name": "${userCourseInput?.Name || ''}",
            "description": "${userCourseInput?.description || ''}",
            "category": "${userCourseInput?.category || ''}",
            "frameworks": ${JSON.stringify(userCourseInput?.frameworks) || '[]'},
            "Uploaded-File": "${uploadedFileUrl}",
            "pages": ${userCourseInput?.pages || 0},
            "pageDetails": [
                ${userCourseInput?.pageDetails.map(page => `{
                    "pageName": "${page.name || ''}",
                    "content": "${page.content || ''}",
                    "designPreferences": "${page.designPreferences || ''}"
                }`).join(',') || ''}
            ],
            "Integrations": ${JSON.stringify(userCourseInput?.integrations) || '[]'},
            "Authentication": {
                "requiresAuthentication": ${userCourseInput?.authentication?.requiresAuthentication || false},
                "provider": "${userCourseInput?.authentication?.provider || ''}"
            },
            "requiresAssets": ${userCourseInput?.requiresAssets || false},
            "UploadAssets": ${JSON.stringify(userCourseInput?.assets) || '[]'},
            "keysRequired": ${JSON.stringify(userCourseInput?.keysRequired) || '[]'}
        }`;

        // Final combined prompt for AI
        const FINAL_PROMPT = BASIC_PROMPT + User_INPUT_PROMPT;
        console.log('Generated Prompt:', FINAL_PROMPT);
        console.log('Generated Prompt:', JSON.stringify(FINAL_PROMPT, null, 2)); // Pretty print prompt for easier debugging

        // Call the AI service to generate the project layout
        const result = await GenerateProjectLayout_AI.sendMessage(FINAL_PROMPT);
        
        // Handle the AI response and ensure it is valid JSON
        const responseText = await result.response?.text();
        if (!responseText) throw new Error('No response from AI service.');

        const parsedJson = JSON.parse(responseText);
        console.log('AI Response:', parsedJson);

        // Save the generated course layout in the database
        await SaveCourseLayoutInDb(parsedJson);
    } catch (error) {
        console.error('Error generating course layout:', error);
    } finally {
        setLoading(false);
    }
};


const SaveCourseLayoutInDb = async (projectLayout) => {
  var id = uuid4(); // Course ID
  setLoading(true);

  const result = await db.insert(ProjectList).values({
    projectId: id,
    name: userCourseInput?.Name,
    description: userCourseInput?.description,
    category: userCourseInput?.category || '', // Added category
    technologies: JSON.stringify(userCourseInput?.frameworks || []), // Added technologies as JSON
    noOfPages: userCourseInput?.pages || 0, // Added number of pages
    pageContent: JSON.stringify(userCourseInput?.pageDetails.map(page => ({
      pageName: page.name || '',
      content: page.content || '',
      designPreferences: page.designPreferences || '',
    }))), // Added page content as JSON
    integrations: JSON.stringify(userCourseInput?.integrations || []), // Added integrations as JSON
    authentication: JSON.stringify({
      requiresAuthentication: userCourseInput?.authentication?.requiresAuthentication || false,
      provider: userCourseInput?.authentication?.provider || ''
    }), // Added authentication details as JSON
    keysRequired: JSON.stringify(userCourseInput?.keysRequired || []), // Added keys required as JSON
    includedFile: userCourseInput?.['Uploaded-File'] || null, // Added included file URL
    assetsRequired: userCourseInput?.requiresAssets || false, // Added assets required flag
    assets: JSON.stringify(userCourseInput?.assets || []), // Added assets as JSON
    projectOutput: projectLayout, // Project output from AI
    makePublic: userCourseInput?.makePublic || false, // Visibility flag
    createdBy: user?.primaryEmailAddress?.emailAddress, // User ID of the creator
    userName: user?.fullName, // Username of the creator
    userProfileImage: user?.imageUrl // Profile image URL of the creator
  });

  console.log("Finish saving project layout in database");
  setLoading(false);
  router.replace('/create-websites/'+id)
 
}

  return (
    <div>
      <div className='flex flex-col justify-center items-center'>
        <h2 className='text-4xl text-primary font-medium'>Create Anything Like A Pro</h2>
        <div className='flex mt-10'>
                {StepperOptions.map((item,index)=>(
                    <div className='flex items-center'>
                        <div className='flex flex-col items-center w-[50px] md:w-[100px]'>
                             <div className={`bg-gray-200 p-3 rounded-full text-black
                             ${activeIndex>=index&& 'bg-primary'}`}>
                                 {item.icon}
                             </div>
                           
                                <h2 className='text-center hidden md:block md:text-sm'>{item.name}</h2>
                            </div>
                            {index != StepperOptions?.length-1 && <div className={`h-1 w-[50px] md:w-[100px] rounded-full lg:w-[170px] bg-gray-300  ${activeIndex-1>=index&& 'bg-primary'}`}></div>} 
                    </div>
                ))}
        </div>
      </div>


      <div className="px-10 md:px-20 lg:px-44 mt-10">
      {/* Component */}
      {activeIndex==0? <SelectCategory/>: 
                activeIndex==1? <NameDescription/>:
                      activeIndex==2? <PageDetails/>:
                          activeIndex==3? <Integrations/>:
                      <AssetsRequired/>}
      {/* Next Previous Button */}
      <div className='flex justify-between mt-8'>
        <Button onClick={handlePrevious} disabled={activeIndex === 0}>Previous</Button>
        {activeIndex<4 && <Button onClick={handleNext} >Next</Button>}
        {activeIndex==4 && <Button onClick={()=> GenerateCourseLayout()} >Generate Content</Button>}
     
     </div>
      </div>
      <LoadingDialog loading={loading}/>
    </div>
  );
}

export default CreateWebsitesMainScreen;
