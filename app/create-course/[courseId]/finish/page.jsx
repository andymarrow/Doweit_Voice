"use client"

import { db } from '@/configs/db';
import { CourseList } from '@/configs/schemaCourse';
import { useUser } from '@clerk/nextjs';
import { and, eq } from 'drizzle-orm';
import { useRouter } from 'next/navigation';
import React,{useState,useEffect} from 'react'
import CourseBasicInfo from '../components/CourseBasicInfo';

import { HiOutlineClipboardDocumentCheck } from 'react-icons/hi2';

export default function FinishScreen({params}) {
  const {user}=useUser();
  const [course,setCourse]=useState([])
  const router=useRouter();
  useEffect(()=>{
    params&&GetCourse();
  },[params,user])

  const GetCourse=async()=>{
      const result=await db.select().from(CourseList)
      .where(and(eq(CourseList.courseId,params?.courseId),eq(CourseList?.createdBy,user?.primaryEmailAddress?.emailAddress)))
    setCourse(result[0]);
    console.log(result);
    }
    return (
            <div className="px-10 md:px-20 lg:px-44 my-7">
                <h2 className="text-center font-bold text-2xl my-3 text-primary">Wehuuuu!! Your Course Is Ready</h2>
                <CourseBasicInfo course={course} refreshData={()=>console.log()} edit={false}/>
                <h2 className="font-bold text-2xl my-3 text-primary">Your Course Url :- share the link with your friends</h2>
                <h2 className="text-center items-center text-black border p-2 rounded-md shadow-md flex gap-5">{process.env.NEXT_PUBLIC_HOST_NAME}/course/view/{course?.courseId} <HiOutlineClipboardDocumentCheck 
                className="h-5 w-5 cursor-pointer"
                onClick={async()=>await navigator.clipboard.writeText(process.env.NEXT_PUBLIC_HOST_NAME+"/course/view/"+course?.courseId )}
                /></h2>
                    
            </div>
  )
}
