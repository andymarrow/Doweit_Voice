"use client"
import { db } from '@/configs/db';
import { Chapters, CourseList } from '@/configs/schemaCourse';
import { useUser } from '@clerk/nextjs'
import { and, eq } from 'drizzle-orm';
import React, { useEffect, useState } from 'react'
import CourseBasicInfo from './components/CourseBasicInfo';
import CourseDetail from './components/CourseDetail';
import ChapterList from './components/ChapterList';
import { Button } from '@/components/ui/button';
import { GenerateChapterContent_AI } from '@/configs/AiModelForCourseCreation';
import LoadingDialog from '../_components/LoadingDialog';
import Service from '@/configs/Service';
import { useRouter } from 'next/navigation';

export default function CourseLayout({params}) {
  
  const {user}=useUser();
  const [loading,setLoading]=useState(false);
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

    const GenerateChapterContent = async () => {
      setLoading(true);
      const chapters = course?.courseOutput?.course?.chapters;
      
      // Iterate through chapters using a for loop for proper async handling
      for (let index = 0; index < chapters.length; index++) {
        const chapter = chapters[index];
        const PROMPT = `Explain the concept in Detail on Topic: ${course?.name}, Chapter: ${chapter?.name}, in JSON Format with list of array with fields as title, description in detail, Code Example (Code field in <precode> format) if applicable`;
        console.log(PROMPT);
        
        try {
          let videoIds = []; // Initialize videoIds here
         
          // Fetch video IDs from the service
          const resp = await Service.getVideos(course?.name + ':' + chapter?.name);
          console.log(resp);
      
          // Extract video IDs correctly
          videoIds = resp.map(video => {
              // Check if the video.id is an object and extract playlistId or videoId accordingly
              if (video.id && video.id.kind === 'youtube#playlist') {
                  return video.id.playlistId; // Use playlistId if it's a playlist
              } else if (video.id && video.id.kind === 'youtube#video') {
                  return video.id.videoId; // Use videoId if it's a video
              }
              return null; // In case of unexpected structure
          }).filter(id => id !== null); // Filter out null values
      
          console.log(videoIds); // Log all video IDs
      
          //generating the course contents based on the users final editing 
          const result = await GenerateChapterContent_AI.sendMessage(PROMPT);
          console.log(result.response?.text());
          const content = JSON.parse(result.response?.text());
      
          // Save the chapters content in the database
          const insertResult = await db.insert(Chapters).values({
              chapterId: index,
              courseId: course?.courseId,
              content: content,
              videoIds: videoIds
          });
          console.log('Insert Result:', insertResult);
      
      } catch (e) {
          console.error('Database insertion error:', e);
      }
      }
      
      setLoading(false);
      router.replace('/create-course/' + course?.courseId + "/finish");
    };


  return (
    <div className='mt-10 px-7 md:px-20 lg:px-44'>
      <h2 className='font-bold text-center text-2xl'>Course Layout</h2> 
    
    <LoadingDialog loading={loading} />
      {/* basic info */}
          <CourseBasicInfo course={course} refreshData={()=>GetCourse()}/>
      {/* course detail */}
          <CourseDetail course={course} refreshData={()=>GetCourse()}/>
      {/* chapters */}
          <ChapterList course={course} refreshData={()=>GetCourse()}/>
          
          <div className="flex justify-center">
              <Button className="m-5 text-center" onClick={GenerateChapterContent}> Generate Course Detail</Button>
          </div>
              
    </div>
  )
}
