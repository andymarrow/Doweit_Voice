"use client";
import { db } from "@/configs/db";
import { Chapters, CourseList } from "@/configs/schemaCourse";
import { and, eq } from "drizzle-orm";
import React, { useEffect, useState, useRef } from "react";
import ChapterListCard from "./_components/ChapterListCard";
import ChapterContent from "./_components/ChapterContent";
import Header from "@/app/_components/Header";

function CourseStart({ params }) {
  const [course, setCourse] = useState();
  const [selectedChapter, setSelectedChapter] = useState();
  const [ChapterContents, setChapterContents] = useState();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const sidebarRef = useRef(null); // Reference to the sidebar

  useEffect(() => {
    GetCourse();
  }, []);

  const GetCourse = async () => {
    const result = await db
      .select()
      .from(CourseList)
      .where(eq(CourseList?.courseId, params?.courseId));
    console.log(result);
    setCourse(result[0]);
    GetSelectedChapterContent(0);
  };

  const GetSelectedChapterContent = async (chapterId) => {
    const result = await db
      .select()
      .from(Chapters)
      .where(
        and(eq(Chapters.chapterId, chapterId), eq(Chapters.courseId, course?.courseId))
      );
    setChapterContents(result[0]);
    console.log(result);
  };

  // Close sidebar when clicking outside of it
  useEffect(() => {
    function handleClickOutside(event) {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setIsSidebarOpen(false);
      }
    }

    if (isSidebarOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isSidebarOpen]);

  return (
    <div>
      {/* Pass toggle function to Header */}
      <Header
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        isSidebarOpen={isSidebarOpen}
      />

      <div className="flex">
        {/* Chapter List Sidebar */}
        <div
          ref={sidebarRef} // Attach reference to sidebar
          className={`fixed inset-y-0 left-0 bg-white w-64 h-full shadow-md transition-transform duration-300 md:relative md:block ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          } md:translate-x-0`}
        >
          <h2 className="font-medium text-center text-lg bg-primary p-3 text-white">
            {course?.courseOutput?.course?.name}
          </h2>
          <div className="p-3">
            {course?.courseOutput?.course?.chapters.map((chapter, index) => (
              <div
                key={index}
                className={`flex items-center p-2 rounded-lg cursor-pointer 
                ${selectedChapter === chapter ? "bg-purple-200" : "hover:bg-purple-50"}`}
                onClick={() => {
                  setSelectedChapter(chapter);
                  GetSelectedChapterContent(index);
                }}
              >
                <ChapterListCard chapter={chapter} index={index} />
                {selectedChapter === chapter && (
                  <div className="ml-2 w-2 h-2 bg-purple-600 rounded-full"></div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content Side */}
        <div className="flex-1 max-w-full w-full overflow-hidden">
          <ChapterContent chapter={selectedChapter} content={ChapterContents} />
        </div>
      </div>
    </div>
  );
}

export default CourseStart;
