"use client"

import Image from 'next/image'
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React,{useContext} from 'react'
import { Progress } from "@/components/ui/progress"

import {HiOutlineHome,HiOutlineSquare3Stack3D,HiOutlineBars3CenterLeft,HiOutlineShieldCheck, HiOutlinePower} from "react-icons/hi2"
import { UserCourseListContext } from '@/app/create-course/_context/UserCourseListContext';

import { useClerk } from "@clerk/nextjs";

export default function SideBar() {
    const { userCourseList } = useContext(UserCourseListContext);
    const { signOut } = useClerk();
    const path = usePathname();

    const Menu = [
        {
            id: 1,
            name: 'Home',
            icon: <HiOutlineHome />,
            path: '/dashboard'
        },
        {
            id: 2,
            name: 'Explore Yours',
            icon: <HiOutlineSquare3Stack3D />,
            path: '/dashboard/explore'
        },
        {
            id: 5,
            name: 'Explore Others',
            icon: <HiOutlineBars3CenterLeft />,
            path: '/dashboard/exploreOthers'
        },
        {
            id: 3,
            name: 'Upgrade',
            icon: <HiOutlineShieldCheck />,
            path: '/dashboard/upgrade'
        },
        {
            id: 4,
            name: 'Logout',
            icon: <HiOutlinePower />,
            action: () => signOut()
        }
    ];

    return (
        <div className='fixed h-full md:w-64 p-5 shadow-md'>
            <div className='text-center'>
                <Link href={"/dashboard"}><Image src={'/logo.svg'} width={230} height={230} alt='Logo' /></Link>
            </div>

            <hr className='my-5' />

            <ul>
                {Menu.map((item, index) => (
                    item.path ? (
                        <Link key={item.id} href={item.path}>
                            <div className={`flex items-center gap-2 text-gray-600 p-3 cursor-pointer hover:bg-gray-100 hover:text-black rounded-lg ${item.path == path && 'bg-gray-100 text-black'}`}>
                                <div className='text-2xl'>{item.icon}</div>
                                <h2>{item.name}</h2>
                            </div>
                        </Link>
                    ) : (
                        <div key={item.id} onClick={item.action} className="flex items-center gap-2 text-gray-600 p-3 cursor-pointer hover:bg-gray-100 hover:text-black rounded-lg">
                            <div className='text-2xl'>{item.icon}</div>
                            <h2>{item.name}</h2>
                        </div>
                    )
                ))}
            </ul>

            <div className='absolute bottom-10 w-[80%]'>
                <Progress value={(userCourseList?.length / 10) * 100} />
                <h2 className='text-sm my-2 text-center'>{userCourseList?.length} out of 10 generations</h2>
                <h2 className='text-xs text-gray-500 text-center'>upgrade to pro plan for unlimited generations</h2>
            </div>
        </div>
    );
}
