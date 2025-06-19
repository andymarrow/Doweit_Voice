"use client"
import React, { useEffect, useState } from 'react'
import { db } from '@/configs/db'
import { CourseList } from '@/configs/schemaCourse'
import { eq } from 'drizzle-orm'
import CourseCard from '../_components/CourseCard'
import { Button } from '@/components/ui/button'

export default function Page() {
  const [courseList, setCourseList] = useState([]);
  const [page, setPage] = useState(0);
  const [isLastPage, setIsLastPage] = useState(false);
  const ITEMS_PER_PAGE = 9;

  useEffect(() => {
    GetAllCourse();
  }, [page]);

  const GetAllCourse = async () => {
    const result = await db
      .select()
      .from(CourseList)
      .where(eq(CourseList.makePublic, true))
      .limit(ITEMS_PER_PAGE)
      .offset(page * ITEMS_PER_PAGE);

    setCourseList(result);
    // Check if the retrieved result is less than the ITEMS_PER_PAGE to determine if it's the last page
    setIsLastPage(result.length < ITEMS_PER_PAGE);
  };

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
    <div className="p-5">
      <h2 className="font-bold text-3xl mb-3">Explore Others' Work</h2>
      <p className="text-primary mb-5">Explore more projects built with AI by other users</p>
    
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {courseList.map((course, index) => (
          <CourseCard key={index} course={course} displayUser={true} />
        ))}
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
