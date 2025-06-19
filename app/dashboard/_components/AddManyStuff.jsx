'use client'; // This makes it a Client Component

import { UserCourseListContext } from '@/app/create-course/_context/UserCourseListContext';
import { useRouter } from 'next/navigation';
import React, { useContext } from 'react';

export default function ADDManyStuff() {
    const router = useRouter();
    const { userCourseList } = useContext(UserCourseListContext); // Destructure userCourseList from context

    const cardData = [
        {
            title: 'AUTOBY',
            description: 'Create autobiography of your heroes with a simple prompt.',
            link: '/create-biography', // Link for this card
        },
        {
            title: 'Courser',
            description: 'Generate a course on any topic using a simple prompt and share that with the world.',
            link: '/create-course', // Link for this card
        },
        {
            title: 'Weber',
            description: 'Generate a Fully functional working website using just a prompt and providing small information (your one click away from being a software enginner).',
            link: '/create-websites', // Link for this card
        },
        {
            title: 'websiter',
            description: 'Generate a whole website using iterative prompts ,the more you interact with the ai the more you get better results',
            link: '/create-sites', // Link for this card
        },
        {
            title: 'LIFESTORY',
            description: 'Chronicle the life journey of someone close to you.',
        },
        {
            title: 'Doweit Voice',
            description: 'Marketplace for AI voice assistants and voice bots.',
            link: '/voice-agents', // Link for this card
        },
    ];

    const handleButtonClick = (link) => {
        // Check the number of courses the user has
        if (userCourseList.length >= 10) {
            router.push('/dashboard/upgrade'); // Redirect to upgrade if user has 10 or more courses
        } else {
            router.push(link); // Navigate to the specified link if less than 10 courses
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center bg-gray-100 dark:shadow-sm dark:shadow-blue-400 dark:bg-transparent
         rounded-lg mt-2 p-2">
            <h1 className="text-4xl font-bold mb-8">Add Many Stuff</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl">
                {cardData.map((card, index) => (
                    <div
                        key={index}
                        className="bg-white dark:bg-slate-900  shadow-md rounded-lg p-6 flex flex-col items-center justify-between text-center hover:shadow-xl transition-shadow duration-300"
                    >
                        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">{card.title}</h2>
                        <p className="text-gray-600 mb-6">{card.description}</p>
                        <button
                            onClick={() => handleButtonClick(card.link)}
                            className="bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600 transition-colors">
                            + Get Creative
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}