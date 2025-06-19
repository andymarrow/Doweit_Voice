"use client"
import React,{useState} from 'react'
import SideBar from './_components/SideBar'
import Header from './_components/Header'
import { UserCourseListContext } from '../create-course/_context/UserCourseListContext'

export default function DashboardLayout({children}) {
  
  const [userCourseList,setUserCourseList]=useState([]);
  const [isSidebarOpen, setIsSidebarOpen]=useState(false);
 
  return (
    <UserCourseListContext.Provider value={{userCourseList,setUserCourseList}}>
        <div>
            <div className='md:w-64 hidden md:block'>
                <SideBar />
            </div>

 {/* Sidebar for Mobile - controlled by state */}
          {isSidebarOpen && (
              <div className="fixed inset-0 bg-black bg-opacity-50 z-50 md:hidden" onClick={() => setIsSidebarOpen(false)}>
                <div className="w-64 bg-white h-full shadow-lg" onClick={(e) => e.stopPropagation()}>
                  <SideBar />
                </div>
              </div>
            )}

            <div className='md:ml-64 p-2'>
            <Header toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
            <div className='p-3'>
                    {children}
            </div>
           
        </div>
     
       </div>
    </UserCourseListContext.Provider>
  )
}
