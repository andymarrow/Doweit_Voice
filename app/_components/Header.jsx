import { Button } from '@/components/ui/button'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

import { HiOutlineMenuAlt2, HiOutlineX } from 'react-icons/hi';


export default function Header({ toggleSidebar, isSidebarOpen }) {
  return (
    <div className='m-2 flex justify-between p-3 shadow-md'>
         <div className="flex items-center gap-3">
        {/* Toggle Button for Small Screens */}
        <button className="md:hidden p-2 text-gray-700" onClick={toggleSidebar}>
          {isSidebarOpen ? <HiOutlineX size={24} /> : <HiOutlineMenuAlt2 size={24} />}
        </button>

        <Image src={'/logo.svg'} width={230} height={230} />
      </div>

        <Link href={'/dashboard'}><Button>Go Home</Button></Link>
   
        
    </div>
  )
}


