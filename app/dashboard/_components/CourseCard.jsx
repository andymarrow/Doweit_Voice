import Image from 'next/image'
import React from 'react'
import { HiOutlineBookOpen,HiMiniEllipsisVertical } from 'react-icons/hi2'
import DropDownOption from './DropDownOption'
import { db } from '@/configs/db'
import { CourseList } from '@/configs/schemaCourse'
import { eq } from 'drizzle-orm'
import Link from 'next/link'


export default function CourseCard({course,refreshData,displayUser=false}) {
    
    const handleOnDelete = async () => {
        try {
            const resp = await db.delete(CourseList)
                .where(eq(CourseList.courseId, course?.courseId)) // Use courseId for deletion
                .returning({ id: CourseList.id });

            if (resp) {
                refreshData(); // Refresh the list after deletion
            }
        } catch (error) {
            console.error('Error deleting course:', error);
        }
    };
  
    return (
    <div className="shadow-sm rounded-lg flex flex-col border p-2 hover:border-primary cursor-pointer">
        <Link href={'/course/'+course?.courseId}>
            <Image src={course?.courseBanner} width ={300} height={200} className="w-full h-[200px] object-cover rounded-lg" />
        </Link>
        <div className="p-2">
            <h2 className="text-center font-medium text-lg flex items-center justify-between">{course?.courseOutput?.course?.name}{!displayUser && <DropDownOption handleOnDelete={()=>handleOnDelete()}><HiMiniEllipsisVertical className="text-xl"/></DropDownOption>}</h2>
            
            <p className="text-sm text-gray-400 my-1">{course?.category}</p>
        </div>
        <div className="p-1 text-primary flex items-center justify-between ">
            <h2 className="flex gap-2 items-center text-sm"><HiOutlineBookOpen/>{course?.courseOutput?.course?.noOfChapters} Chapters</h2>
            <h2 className="text-sm">{course?.level} Level</h2>
        </div>
        <div className='flex items-center mt-2'>
           {displayUser && <Image src={course?.userProfileImage} width={35} height={35} className='rounded-full shadow-sm'/>
          }
          {displayUser &&<h2 className='text-black p-2 text-sm'>{course?.userName}</h2> }
        </div>
    </div>
  )
}
