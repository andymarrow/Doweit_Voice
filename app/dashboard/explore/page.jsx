import React from 'react'
import UserCourseList from '../_components/UserCourseList'

export default function page() {
  return (
    <div>
            Explore
            {/* show list of Course which has been set to public by the course generator */}
            <UserCourseList/>
    </div>
  )
}
