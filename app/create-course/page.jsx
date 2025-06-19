"use client"

import { Button } from '@/components/ui/button'
import React, { useContext, useEffect, useState } from 'react'
import SelectCategory from './_components/SelectCategory'
import { HiMiniSquares2X2,HiLightBulb,HiClipboardDocumentCheck } from 'react-icons/hi2'
import TopicDescription from './_components/TopicDescription'
import SelectOption from './_components/SelectOption'
import { UserInputContext } from './_context/UserInputContext'
import { GenerateCourseLayout_AI } from '@/configs/AiModelForCourseCreation'
import LoadingDialog from './_components/LoadingDialog'
import { useUser } from '@clerk/nextjs'
import uuid4 from 'uuid4'
import { db } from '@/configs/db'
import { CourseList } from '@/configs/schemaCourse'
import { useRouter } from 'next/navigation'

function CreateBiography() {
  const {userCourseInput,setUserCourseInput}=useContext(UserInputContext)

   const StepperOptions=[
    {
    id:1,
    name:'Category',
    icon:<HiMiniSquares2X2/>
   },
   {
    id:2,
    name:'Topic & Description',
    icon:<HiLightBulb/>
   },
   {
    id:3,
    name:'Options',
    icon:<HiClipboardDocumentCheck/>
   },
]
    const {user}=useUser();
    const router = useRouter();
    const [loading,setLoading] = useState(false);
    const [activeIndex,setActiveIndex]=useState(0)
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

    useEffect(()=>{
      console.log(userCourseInput);
    },[userCourseInput])

    // used to check next button enable or diable status

    const checkStatus=()=>{
      if (userCourseInput?.length==0){
        return true;
      }
      if(activeIndex==0&&(userCourseInput?.category?.length==0 ||userCourseInput?.category==undefined )){
        return true;
      }
      if(activeIndex==1&&(userCourseInput?.topic==0 || userCourseInput?.topic==undefined)){
        return true;
      }
      if(activeIndex==1&&(userCourseInput?.description==0 || userCourseInput?.description==undefined)){
        return true;
      }
      else if(activeIndex==2&&(userCourseInput?.level==undefined || userCourseInput?.duration==undefined || userCourseInput?.displayVideo==undefined || userCourseInput?.noOfChapters==undefined)){
        return true;
      }
      return false;
    }

    const GenerateCourseLayout=async()=>{
        setLoading(true);
        const BASIC_PROMPT='Generate A Course Tutorial on Following Detail With field as Course Name,Description,Along with Chapter Name,about,Duration:'
        const USER_INPUT_PROMPT='Category: '+userCourseInput?.category+', Topic : '+userCourseInput?.topic+' , Level: '+userCourseInput?.level+' ,Duration: '+userCourseInput?.duration+', NoOfChapters: '+userCourseInput?.noOfChapters+' , in JSON format'
        const FINAL_PROMPT=BASIC_PROMPT+USER_INPUT_PROMPT;
        console.log(FINAL_PROMPT);

        const result= await GenerateCourseLayout_AI.sendMessage(FINAL_PROMPT);
        console.log(result.response?.text());
        console.log(JSON.parse(result.response?.text()));
        setLoading(false);
        SaveCourseLayoutInDb(JSON.parse(result.response?.text()));
      }

    const SaveCourseLayoutInDb=async(courseLayout)=>{
      var id = uuid4(); //course id
      setLoading(true);
      const result=await db.insert(CourseList).values({
          courseId:id,
          name:userCourseInput?.topic,
          level:userCourseInput?.level,
          category:userCourseInput?.category,
          courseOutput:courseLayout,
          createdBy:user?.primaryEmailAddress?.emailAddress,
          userName:user?.fullName,
          userProfileImage:user?.imageUrl
      })
      console.log("finish")

      setLoading(false);
            router.replace('/create-course/'+id) //cause we dont want the user to get back we replacing the url
    }
  return (
    <div>
      {/* Stepper */}

        <div className='flex flex-col justify-center items-center'>
            <h2 className='text-4xl text-primary font-medium'>Create A Course</h2>
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
                activeIndex==1? <TopicDescription/>:
                 <SelectOption/>  }
      {/* Next Previous Button */}
      <div className='flex justify-between mt-8'>
        <Button onClick={handlePrevious} disabled={activeIndex === 0}>Previous</Button>
        {activeIndex<2 && <Button onClick={handleNext} disabled={checkStatus()}>Next</Button>}
        {activeIndex==2 && <Button onClick={()=> GenerateCourseLayout()} disabled={checkStatus()}>Generate A Course</Button>}
      </div>
      </div>
      <LoadingDialog loading={loading}/>
    </div>
  )
}

export default CreateBiography
