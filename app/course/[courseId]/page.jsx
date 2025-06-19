"use client"
import Header from '@/app/_components/Header'
import ChapterList from '@/app/create-course/[courseId]/components/ChapterList'
import CourseBasicInfo from '@/app/create-course/[courseId]/components/CourseBasicInfo'
import CourseDetail from '@/app/create-course/[courseId]/components/CourseDetail'
import { db } from '@/configs/db'
import { CourseList } from '@/configs/schemaCourse'
import { eq } from 'drizzle-orm'
import React ,{useEffect,useState}from 'react'

function Course({params}) {

   const [course,setCourse]=useState(); 
   useEffect(()=>{
        params&&GetCourse();
   },[params]) 
  const GetCourse=async()=>{
    const result=await db.select().from(CourseList)
    .where(eq(CourseList?.courseId,params?.courseId))
    setCourse(result[0])
}

  return (
    <div>
        <Header />
        <div className="px-10 p-10 md:px-20 lg:px-44">
            <CourseBasicInfo course={course} edit={false}/>
            <CourseDetail course={course} edit={false}/>
            <ChapterList course={course} edit={false}/>
        </div>
      
    </div>
  )
}

export default Course
