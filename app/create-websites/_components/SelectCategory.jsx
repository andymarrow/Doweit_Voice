import React, { useState, useContext, useEffect } from 'react';
import CategoryList from '../_shared/CategoryList';
import { UserInputContext } from '../_context/UserInputContext';

export default function SelectCategory() {
  const { userCourseInput, setUserCourseInput } = useContext(UserInputContext);
  const [selectedCategory, setSelectedCategory] = useState(userCourseInput?.category || null);
  const [selectedFrameworks, setSelectedFrameworks] = useState(userCourseInput?.frameworks || []);

  // Define frameworks for each category
  const frameworks = {
    'Web Development': ['HTML', 'CSS', 'JavaScript', 'Tailwind CSS'],
    'Mobile Application Development': ['Flutter', 'React Native', 'Java', 'Kotlin', 'Swift'],
    'Java GUI Application': ['Java with Swing', 'JavaFX', 'Python with Tkinter'],
    'Game Development': ['JavaScript', 'Java', 'Python', 'C++', 'GDScript with Godot Engine', 'JavaScript with Phaser.js'],
    'Data Analysis and Scripting': ['Python', 'R (specialized for statistical analysis)', 'C++']
  };

  // Handle category selection
  const handleCategoryClick = (categoryName) => {
    setSelectedCategory(categoryName);
    setSelectedFrameworks([]);

    // Update the context with both category name and clear frameworks
    setUserCourseInput(prev => ({
      ...prev,
      category: categoryName,
      frameworks: [] // Clear frameworks when a new category is selected
    }));
  };

  // Handle framework selection
  const handleFrameworkClick = (framework) => {
    let updatedFrameworks;

    if (selectedCategory === 'Web Development') {
      // Allow multiple selections for Web Development
      updatedFrameworks = selectedFrameworks.includes(framework)
        ? selectedFrameworks.filter(fw => fw !== framework)
        : [...selectedFrameworks, framework];
    } else {
      // Allow only one selection for other categories
      updatedFrameworks = [framework];
    }

    setSelectedFrameworks(updatedFrameworks);

    // Update the context with the selected frameworks
    setUserCourseInput(prev => ({
      ...prev,
      frameworks: updatedFrameworks
    }));
  };

  return (
    <>
      <div className='flex items-center justify-center font-bold text-2xl p-5'>
        <h2>Select Course Category</h2>
      </div>

      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 px-10 md:px-20'>
        {CategoryList.map((item, index) => (
          <div
            key={index}
            className={`relative group p-5 border-2 rounded-xl overflow-hidden cursor-pointer hover:shadow-lg transform transition duration-300 ${
              selectedCategory === item.name ? 'hover:shadow-lg border-blue-500' : 'border-gray-300'
            }`}
            onClick={() => handleCategoryClick(item.name)}
          >
            {/* Background Image */}
            <div
              className='absolute inset-0 bg-cover bg-center filter brightness-75 transition duration-300 group-hover:brightness-50'
              style={{ backgroundImage: `url(${item.icon})` }}
            />

            {/* Text Overlay */}
            <div className='relative z-10 flex flex-col items-center justify-center h-full text-center'>
              <h1 className={`text-2xl font-semibold mb-2 text-white`}>
                {item.name}
              </h1>
            </div>
          </div>
        ))}
      </div>

      {/* Display Frameworks Section if a category is selected */}
      {selectedCategory && (
        <div className='mt-10 px-10 md:px-20'>
          <h2 className='text-xl md:text-2xl font-bold text-center mb-5'>
            Select Frameworks for {selectedCategory}
          </h2>
          <div className='flex flex-wrap gap-4 justify-center'>
            {frameworks[selectedCategory].map((framework) => (
              <button
                key={framework}
                className={`py-2 px-4 rounded-lg border-2 ${
                  selectedFrameworks.includes(framework)
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-blue-100'
                } transition duration-300`}
                onClick={() => handleFrameworkClick(framework)}
              >
                {framework}
              </button>
            ))}
          </div>

          {/* Show selected frameworks */}
          {selectedFrameworks.length > 0 && (
            <div className='mt-5 text-center'>
              <h3 className='text-lg font-medium'>Selected Frameworks:</h3>
              <p className='mt-2'>
                {selectedFrameworks.join(', ')}
              </p>
            </div>
          )}
        </div>
      )}
    </>
  );
}
