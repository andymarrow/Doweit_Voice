import React, { useContext } from 'react'
import CategoryList from '../_shared/CategoryList'
import { UserInputContext } from '../_context/UserInputContext'

export default function SelectCategory() {
  const {userCourseInput,setUserCourseInput}=useContext(UserInputContext)

  const handleCategoryChange = (category) => {
    setUserCourseInput(prev => ({
      ...prev,
      category: category
    }))
  }
  
  return (
    <>
      <div className='flex items-center justify-center font-bold text-2xl p-5'>
        <h2>Select Course Category</h2>
      </div>
      
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 px-10 md:px-20'>
        {CategoryList.map((item, index) => (
          <div 
            key={index} 
            className={`relative group p-5 border-2 rounded-xl overflow-hidden 
            cursor-pointer hover:shadow-lg transform transition duration-300 
            hover:scale-105 
            ${userCourseInput?.category === item.name ? 'border-blue-500 bg-blue-500 text-white shadow-xl' : 'border-gray-300'}`}
            onClick={() => handleCategoryChange(item.name)}
          >
            {/* Background Image */}
            <div 
              className='absolute inset-0 bg-cover bg-center filter brightness-75' 
              style={{ backgroundImage: `url(${item.icon})` }} 
            />
            
            {/* Text Overlay */}
            <div className='relative z-10 flex flex-col items-center justify-center h-full text-center'>
              <h1 className={`text-2xl font-semibold mb-2 transition ${userCourseInput?.category === item.name ? 'text-primary' : 'text-white'}`}>
                {item.name}
              </h1>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
