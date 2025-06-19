import React from 'react'
import Header from '../dashboard/_components/Header'

function CreateCourselayout({children}) {
  return (
    <div>
      <Header />
      <div className='p-3 mt-3'>
            {children}
      </div>
    
    </div>
  )
}

export default CreateCourselayout
