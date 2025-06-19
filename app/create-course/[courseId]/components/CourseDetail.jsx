import React, { useState } from 'react'
import { HiOutlineCheckCircle,HiOutlinePlayCircle,HiOutlineChartBar,HiOutlineClock,HiOutlineBookOpen } from 'react-icons/hi2'
import EditCoursePublicity from './EditCoursePublicity'

export default function CourseDetail({ course,refreshData ,edit=true}) {
  
  return (
    <div className='bg-white border border-gray-200 p-6 rounded-2xl shadow-lg mt-5 transition-transform transform hover:scale-105 duration-300'>
      <div className='grid grid-cols-2 md:grid-cols-4 gap-6'>
        
        {/* Skill Level */}
        <div className='flex gap-3 items-center hover:bg-gray-50 p-4 rounded-lg transition'>
          < HiOutlineChartBar className='text-5xl text-primary animate-pulse' />
          <div>
            <h2 className='text-sm font-semibold text-gray-600'>Skill Level</h2>
            <h2 className='font-bold text-xl text-gray-800'>{course?.level}</h2>
          </div>
        </div>
        
        {/* No of chapeters */}
        <div className='flex gap-3 items-center hover:bg-gray-50 p-4 rounded-lg transition'>
          < HiOutlineBookOpen className='text-5xl text-primary animate-pulse' />
          <div>
            <h2 className='text-sm font-semibold text-gray-600'>No Of Chapters</h2>
            <h2 className='font-bold text-xl text-gray-800'>{course?.courseOutput?.course?.noOfChapters}</h2>
          </div>
        </div>
        
        {/* Duration */}
        <div className='flex gap-3 items-center hover:bg-gray-50 p-4 rounded-lg transition'>
          < HiOutlineClock className='text-5xl text-primary animate-pulse' />
          <div>
            <h2 className='text-sm font-semibold text-gray-600'>Duration</h2>
            <h2 className='font-bold text-xl text-gray-800'>{course?.courseOutput?.course?.duration}</h2>
          </div>
        </div>
        
        {/* video included */}
        <div className='flex gap-3 items-center hover:bg-gray-50 p-4 rounded-lg transition'>
          < HiOutlinePlayCircle className='text-5xl text-primary animate-pulse' />
          <div>
            <h2 className='text-sm font-semibold text-gray-600'>Video Included?</h2>
            <h2 className='font-bold text-xl text-gray-800'>{course?.includeVideo}</h2>
          </div>
        </div>

         {/* Make Public or Not */}
        <div className='flex gap-3 items-center hover:bg-gray-50 p-4 rounded-lg transition'>
           <HiOutlineCheckCircle className='text-5xl text-primary animate-pulse' /> 
          <div>
            <h2 className='text-sm font-semibold text-gray-600'>Make Public {edit &&<EditCoursePublicity course={course} refreshData={()=>refreshData(true)}/>}</h2>
            <h2 className='font-bold text-xl text-gray-800'>
              {course?.makePublic ? "Yes" : "No"}
            </h2>
          </div>
        </div>

      </div>
    </div>
  )
}
