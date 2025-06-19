"use client"
import { db } from '@/configs/db'
import { CourseList } from '@/configs/schemaCourse'
import { useUser } from '@clerk/nextjs'
import { eq } from 'drizzle-orm'
import React, { useEffect, useState, useContext } from 'react'
import CourseCard from './CourseCard'
import { UserCourseListContext } from '@/app/create-course/_context/UserCourseListContext'
import { Button } from '@/components/ui/button'

export default function UserCourseList() {
  const [courseList, setCourseList] = useState([]);
  const [page, setPage] = useState(0);
  const [isLastPage, setIsLastPage] = useState(false);
  const ITEMS_PER_PAGE = 6; // Adjust the number of items per page as needed
  const { userCourseList, setUserCourseList } = useContext(UserCourseListContext)
  const { user } = useUser();

  useEffect(() => {
    user && getUserCourses();
  }, [user, page]);

  const getUserCourses = async () => {
    const result = await db.select()
      .from(CourseList)
      .where(eq(CourseList?.createdBy, user?.primaryEmailAddress?.emailAddress))
      .limit(ITEMS_PER_PAGE)
      .offset(page * ITEMS_PER_PAGE);

    setCourseList(result);
    setUserCourseList(result);
    setIsLastPage(result.length < ITEMS_PER_PAGE);
  }

  const handleNextPage = () => {
    if (!isLastPage) {
      setPage(prev => prev + 1);
    }
  };

  const handlePreviousPage = () => {
    if (page > 0) {
      setPage(prev => prev - 1);
    }
  };

  return (
    <div className="mt-10">
      <h2 className="font-extrabold text-primary text-xl">My AI Courses</h2>
      <h5 className="font-semibold text-gray-600 text-sm">All AI courses created by you</h5>
      
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-3">
        {courseList && courseList.length > 0 ? (
          courseList.map((course, index) => (
            <CourseCard course={course} key={index} refreshData={() => getUserCourses()} />
          ))
        ) : 
          [1, 2, 3, 4, 5, 6].map((item, index) => (
            <div key={index} className="w-full bg-primary animate-pulse rounded-lg h-[270px]"></div>
          ))
        }
      </div>
      
      <div className="flex justify-between mt-5">
        <Button 
          onClick={handlePreviousPage} 
          disabled={page === 0} 
          className={`px-4 py-2 ${page === 0 ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'} text-white rounded`}
        >
          Previous Page
        </Button>
        <Button 
          onClick={handleNextPage} 
          disabled={isLastPage} 
          className={`px-4 py-2 ${isLastPage ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'} text-white rounded`}
        >
          Next Page
        </Button>
      </div>
    </div>
  )
}
