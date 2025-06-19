import React, { useContext } from 'react'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select"
import { Input } from '@/components/ui/input'
import { Video, Book, Layers, Clock } from "lucide-react"
import { UserInputContext } from '../_context/UserInputContext';

export default function SelectOption() {
    const {userCourseInput,setUserCourseInput}=useContext(UserInputContext);

    const handleInputChange=(fieldName,value)=>{
        setUserCourseInput(prev=>({
             ...prev,
             [fieldName]:value
        }))
    }
   
  return (
    <div className='p-10 md:px-20 lg:px-44 bg-gradient-to-r from-blue-100 via-white to-blue-100 rounded-lg shadow-xl'>
      <h2 className='text-3xl font-bold text-center mb-8 text-gray-800'>Course Details</h2>
      <div className='grid grid-cols-1 sm:grid-cols-2 gap-10'>
        
        {/* Difficulty Level */}
        <div className='flex flex-col'>
          <label className='flex items-center gap-2 text-lg font-medium text-gray-700'>
            <Layers className="w-5 h-5 text-blue-600" /> Difficulty Level
          </label>
          <Select 
             defaultValue={userCourseInput?.level}
          onValueChange={(value)=>handleInputChange('level',value)}>
            <SelectTrigger className='mt-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 transition'>
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Beginner">Beginner</SelectItem>
              <SelectItem value="Intermediate">Intermediate</SelectItem>
              <SelectItem value="Advanced">Advanced</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Course Duration */}
        <div className='flex flex-col'>
          <label className='flex items-center gap-2 text-lg font-medium text-gray-700'>
            <Clock className="w-5 h-5 text-blue-600" /> Course Duration
          </label>
          <Select 
               defaultValue={userCourseInput?.duration}
          onValueChange={(value)=>handleInputChange('duration',value)}>
            <SelectTrigger className='mt-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 transition'>
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30 Minutes">30 Minutes</SelectItem>
              <SelectItem value="1 Hour">1 Hour</SelectItem>
              <SelectItem value="2 Hour">2 Hours</SelectItem>
              <SelectItem value="More than 3 Hours">More than 3 Hours</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Add Video */}
        <div className='flex flex-col'>
          <label className='flex items-center gap-2 text-lg font-medium text-gray-700'>
            <Video className="w-5 h-5 text-blue-600" /> Add Video
          </label>
          <Select 
               defaultValue={userCourseInput?.displayVideo}
          onValueChange={(value)=>handleInputChange('displayVideo',value)}>
            <SelectTrigger className='mt-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 transition'>
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Yes">Yes</SelectItem>
              <SelectItem value="No">No</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* No of Chapters */}
        <div className='flex flex-col'>
          <label className='flex items-center gap-2 text-lg font-medium text-gray-700'>
            <Book className="w-5 h-5 text-blue-600" /> Number of Chapters
          </label>
          <Input 
            type="number" 
            placeholder="Enter number of chapters" 
            className='mt-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 transition'
            defaultValue={userCourseInput?.noOfChapters}
            onChange={(event)=>handleInputChange('noOfChapters',event.target.value)}
         />
        </div>
      </div>
    </div>
  )
}
