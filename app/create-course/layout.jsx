"use client"
import React, { useState } from 'react'
import Header from '../dashboard/_components/Header'
import { UserInputContext } from './_context/UserInputContext'

function CreateCourselayout({children}) {
  const [userCourseInput,setUserCourseInput]=useState([]);
  return (
    <div>
      <UserInputContext.Provider value={{userCourseInput,setUserCourseInput}}>
        <>
          <Header />
          <div className='p-3 mt-3'>
                {children}
          </div>
        </>
      </UserInputContext.Provider>
    </div>
  )
}

export default CreateCourselayout
