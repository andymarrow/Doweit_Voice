import ThemeToggle from '@/components/Themetoggle'
import { UserButton } from '@clerk/nextjs'

import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

import { HiOutlineMenuAlt3 } from "react-icons/hi"

export default function Header({ toggleSidebar }) {
  return (
    <div className='flex justify-between items-center p-2 shadow-md'>
      {/* Menu Button for Small Screens */}
      <button className="md:hidden text-2xl p-2" onClick={toggleSidebar}>
        <HiOutlineMenuAlt3 />
      </button>

      <Link href={"/dashboard"}>
        <Image src={'/onlylogo.svg'} width={220} height={220} alt="Logo" />
      </Link>

      <div className='flex flex-row space-x-2 items-center'>
        <ThemeToggle />

        <UserButton />
      </div>

    </div>
  )
}
