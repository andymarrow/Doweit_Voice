'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const cardData = [
  {
    title: 'AUTOBY',
    description: 'Create autobigotapu of your heroes with a simple prompt.',
    link: '/create-biography', // Link for this card
  },
  {
    title: 'Courser',
    description: 'Generate a course on any topic using a simple prompt.',
    link: '/create-course', // Link for this card
},
{
  title: 'websiter',
  description: 'Generate a whole website using iterative prompts.',
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

function AddBiography() {
  const { user } = useUser();
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCard, setExpandedCard] = useState(null);

  const filteredData = cardData.filter(card => 
    card.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleButtonClick = (link) => {
    if (link) {
      router.push(link);
    }
  };

  return (
    <div>
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-3xl'>
            Hello,
            <span className='font-bold text-blue-500'> {user?.firstName}</span>
          </h2>
          <p className='text-sm text-gray-500'>
            Get creative with AI, have fun & earn from your creations
          </p>
        </div>
        <Button onClick={() => setShowModal(true)}>+ Get Creative</Button>
      </div>

      {/* Modal */}
      {showModal && (
        <div className='fixed inset-0 flex items-center justify-center z-50'>
          {/* Modal overlay with blur */}
          <div className='fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm'></div>

          {/* Modal content */}
          <div className='bg-white rounded-lg p-6 z-10 w-full max-w-lg'>
            <h2 className='text-2xl font-bold mb-4'>Search and Get Creative</h2>
            <input
              type='text'
              placeholder='Search for a title...'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className='w-full p-2 border rounded mb-4 focus:outline-none'
            />

            {/* Filtered List */}
            {filteredData.length > 0 ? (
              <div>
                {filteredData.map((card, index) => (
                  <div
                    key={index}
                    className='bg-gray-100 p-4 rounded-lg mb-4 cursor-pointer'
                    onClick={() => setExpandedCard(card.title === expandedCard ? null : card.title)}
                  >
                    <h3 className='text-lg font-semibold'>{card.title}</h3>
                    {expandedCard === card.title && (
                      <div className='mt-2'>
                        <p>{card.description}</p>
                        {card.link && (
                          <Button
                            className='mt-4'
                            onClick={() => handleButtonClick(card.link)}
                          >
                            + Get Creative
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p>No items match your search</p>
            )}

            {/* Close button */}
            <Button
              className='mt-4'
              onClick={() => setShowModal(false)}
            >
              Close
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default AddBiography;
