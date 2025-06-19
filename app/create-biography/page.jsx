"use client"

import { Button } from '@/components/ui/button'
import React, { useState } from 'react'

import { HiMiniSquares2X2,HiLightBulb,HiClipboardDocumentCheck } from 'react-icons/hi2'

function CreateBiography() {

   const StepperOptions=[
    {
    id:1,
    name:'Category',
    icon:<HiMiniSquares2X2/>
   },
   {
    id:2,
    name:'Topic & Description',
    icon:<HiLightBulb/>
   },
   {
    id:3,
    name:'Options',
    icon:<HiClipboardDocumentCheck/>
   },
]
    const [activeIndex,setActiveIndex]=useState(0)
    const handleNext = () => {
      if (activeIndex < StepperOptions.length - 1) {
        setActiveIndex(activeIndex + 1)
      }
    }
  
    const handlePrevious = () => {
      if (activeIndex > 0) {
        setActiveIndex(activeIndex - 1)
      }
    }
  return (
    <div>
      {/* Stepper */}

        <div className='flex flex-col justify-center items-center'>
            <h2 className='text-4xl text-primary font-medium'>Create Auto Biography</h2>
            <div className='flex mt-10'>
                {StepperOptions.map((item,index)=>(
                    <div className='flex items-center'>
                        <div className='flex flex-col items-center w-[50px] md:w-[100px]'>
                             <div className={`bg-gray-200 p-3 rounded-full text-black
                             ${activeIndex>=index&& 'bg-primary'}`}>
                                 {item.icon}
                             </div>
                           
                                <h2 className='text-center hidden md:block md:text-sm'>{item.name}</h2>
                            </div>
                            {index != StepperOptions?.length-1 && <div className={`h-1 w-[50px] md:w-[100px] rounded-full lg:w-[170px] bg-gray-300  ${activeIndex-1>=index&& 'bg-primary'}`}></div>} 
                    </div>
                ))}
            </div>
        </div>

        
      <div className="px-10 md:px-20 lg:px-44 mt-10">
      {/* Component */}

      {/* Next Previous Button */}
      <div className='flex justify-between mt-8'>
        <Button onClick={handlePrevious} disabled={activeIndex === 0}>Previous</Button>
        {activeIndex<2 && <Button onClick={handleNext} disabled={activeIndex === StepperOptions.length - 1}>Next</Button>}
        {activeIndex==2 && <Button onClick={()=>setActiveIndex(activeIndex + 1 )}>Generate autobiography</Button>}
      </div>
      </div>
    </div>
  )
}

export default CreateBiography
