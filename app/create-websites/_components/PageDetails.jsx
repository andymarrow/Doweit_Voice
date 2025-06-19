import React, { useState, useEffect, useContext } from 'react';
import { UserInputContext } from '../_context/UserInputContext';

function PageDetails() {
  const { userCourseInput, setUserCourseInput } = useContext(UserInputContext);
  
  const [numPages, setNumPages] = useState(userCourseInput.pages || 0);
  const [pageDetails, setPageDetails] = useState(userCourseInput.pageDetails || []);

  // Update state when userCourseInput changes (e.g., when coming back to this component)
  useEffect(() => {
    setNumPages(userCourseInput.pages || 0);
    setPageDetails(userCourseInput.pageDetails || []);
  }, [userCourseInput]);

  // Handle the change in number of pages
  const handleNumPagesChange = (e) => {
    const value = parseInt(e.target.value) || 0;
    setNumPages(value);

    // Adjust the page details array length based on the selected number of pages
    const newPageDetails = Array(value).fill().map((_, index) => ({
      name: pageDetails[index]?.name || '',
      content: pageDetails[index]?.content || '',
      designPreferences: pageDetails[index]?.designPreferences || '',
      id: index
    }));
    setPageDetails(newPageDetails);

    // Update context with the number of pages and reset page details
    setUserCourseInput({
      ...userCourseInput,
      pages: value,
      pageDetails: newPageDetails
    });
  };

  // Handle change for each input field
  const handlePageDetailChange = (index, field, value) => {
    const updatedPageDetails = pageDetails.map((detail, idx) =>
      idx === index ? { ...detail, [field]: value } : detail
    );
    setPageDetails(updatedPageDetails);

    // Update the context with the updated page details
    setUserCourseInput({
      ...userCourseInput,
      pageDetails: updatedPageDetails
    });
  };

  return (
    <div className='p-5 bg-gradient-to-r from-blue-100 to-purple-100 min-h-screen'>
      <label className='text-2xl font-bold text-gray-700 mb-5 block text-center'>
        Number of Pages
      </label>
      <div className="items-center justify-center">
        <input
          type='number'
          min='0'
          className='border border-gray-300 rounded-md p-3 mb-8 w-full shadow-md focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all'
          placeholder='Enter the number of pages'
          value={numPages}
          onChange={handleNumPagesChange}
        />
      </div>

      {/* Display input fields based on the selected number of pages */}
      {numPages > 0 && (
        <div className='mt-8 space-y-8 max-w-4xl mx-auto'>
          {pageDetails.map((page, index) => (
            <div 
              key={index} 
              className='p-6 bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300'
            >
              <h2 className='text-xl font-semibold mb-4 text-purple-700'>
                Page {index + 1}
              </h2>
              
              {/* Input for the name of the page */}
              <input
                type='text'
                className='border border-gray-300 rounded-md p-3 mb-4 w-full shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all'
                placeholder='Enter the name of the page (e.g., Home, About Us, Contact)'
                value={page.name}
                onChange={(e) => handlePageDetailChange(index, 'name', e.target.value)}
              />

              {/* Input for the content description */}
              <textarea
                className='border border-gray-300 rounded-md p-3 mb-4 w-full shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all'
                placeholder='Describe in detail the content of this page'
                rows='3'
                value={page.content}
                onChange={(e) => handlePageDetailChange(index, 'content', e.target.value)}
              />

              {/* Input for design preferences */}
              <textarea
                className='border border-gray-300 rounded-md p-3 w-full shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all'
                placeholder='Design preferences (e.g., Clean, modern, minimalistic)'
                rows='3'
                value={page.designPreferences}
                onChange={(e) => handlePageDetailChange(index, 'designPreferences', e.target.value)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default PageDetails;
