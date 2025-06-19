import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import React, { useContext } from 'react'
import { Edit, FileText } from 'lucide-react' // Importing Lucide icons
import { UserInputContext } from '../_context/UserInputContext'


function NameDescription() {
    const {userCourseInput,setUserCourseInput}=useContext(UserInputContext);

    const handleInputChange=(fieldName,value)=>{
        setUserCourseInput(prev=>({
             ...prev,
             [fieldName]:value
        }))
    }
  return (
    <div className='mx-5 md:mx-20 lg:mx-44 p-10 bg-gradient-to-r from-blue-50 via-white to-blue-50 shadow-lg rounded-lg'>
    <h1 className='text-2xl font-bold text-center mb-8 text-gray-800'>Enginner Your Imagination</h1>

    {/* Input Topic */}
    <div className='mt-5'>
      <label className='block mb-2 text-lg font-medium text-gray-700 flex items-center gap-2'>
        <Edit className="w-5 h-5 text-blue-600" /> Enter the Name of the app you want to generate
        <span className='block text-sm text-gray-500'>(e.g., AKA Resturan, Andy Portfolio, ITOk Hospital)</span>
      </label>
      <Input 
        placeholder={'Enter your course topic'} 
        className='w-full p-4 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition'
        defaultValue={userCourseInput?.Name}
        onChange={(e)=>handleInputChange('Name',e.target.value)}
      />
    </div>

    {/* Text Area Description */}
    <div className='mt-8'>
      <label className='block mb-2 text-lg font-medium text-gray-700 flex items-center gap-2'>
        <FileText className="w-5 h-5 text-blue-600" /> Tell us more about your App ,Describe in detail(optional)
      </label>
      <Textarea 
        placeholder="Provide a brief description of your course"
        className='w-full p-4 h-40 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition'
        defaultValue={userCourseInput?.description}
        onChange={(e)=>handleInputChange('description',e.target.value)}
      />
    </div>
  </div>
  )
}

export default NameDescription
