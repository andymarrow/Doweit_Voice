import React from 'react';
import { HiOutlineClock,HiOutlineCheckCircle } from 'react-icons/hi2';
import EditChapters from './EditChapters';

export default function ChapterList({ course,refreshData,edit=true }) {
  return (
    <div className='mt-6 p-5 border rounded-lg shadow-md bg-white'>
      <h2 className='font-bold text-2xl text-gray-800'>Chapters</h2>
      <div className='mt-4'>
        {course?.courseOutput?.course?.chapters.map((chapter, index) => (
            <div className='border p-5 rounded-lg m-2'>
                <div key={index} className='flex gap-4 items-start mb-4 p-3 border-l-4 border-blue-600 hover:bg-gray-100 transition duration-200'>
                    <h3 className='bg-primary h-10 w-10 text-white rounded-full flex items-center justify-center text-lg font-semibold'>
                    {index + 1}
                    </h3>
                    <div>
                    <h3 className='text-lg font-semibold text-gray-900'>{chapter?.name} {edit && <EditChapters course={course} index={index} refreshData={()=>refreshData(true)}/>}</h3>
                    <p className='text-gray-700'>{chapter?.about}</p>
                    <p className='flex items-center text-primary'>
                        <HiOutlineClock className='mr-1' />
                        {chapter?.duration}
                    </p>
                    </div>
                    <HiOutlineCheckCircle className='text-4xl text-primary flex-none '/>
                </div>
            </div>
        ))}
      </div>
    </div>
  );
}