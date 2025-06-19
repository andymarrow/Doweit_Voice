import React, { useState, useContext, useEffect } from 'react';
import { HiPlusCircle, HiMinusCircle } from 'react-icons/hi2';
import { UserInputContext } from '../_context/UserInputContext';

function Integrations() {
  const { userCourseInput, setUserCourseInput } = useContext(UserInputContext);

  const [integrations, setIntegrations] = useState(userCourseInput.integrations || ['']);
  const [envVariables, setEnvVariables] = useState(userCourseInput.keysRequired?.map(env => ({ key: env.environmentVariable, value: env.key })) || [{ key: '', value: '' }]);
  const [authentication, setAuthentication] = useState(userCourseInput.authentication?.requiresAuthentication ? 'yes' : 'no');
  const [provider, setProvider] = useState(userCourseInput.authentication?.provider || '');

  // Handle change for integration inputs
  const handleIntegrationChange = (index, value) => {
    const updatedIntegrations = [...integrations];
    updatedIntegrations[index] = value;
    setIntegrations(updatedIntegrations);
  };

  // Add a new integration input field
  const addIntegrationField = () => {
    setIntegrations([...integrations, '']);
  };

  // Remove an integration input field
  const removeIntegrationField = (index) => {
    const updatedIntegrations = integrations.filter((_, i) => i !== index);
    setIntegrations(updatedIntegrations);
  };

  // Handle change for environment variable inputs
  const handleEnvChange = (index, field, value) => {
    const updatedEnvVariables = [...envVariables];
    updatedEnvVariables[index][field] = value;
    setEnvVariables(updatedEnvVariables);
  };

  // Add a new environment variable input field
  const addEnvField = () => {
    setEnvVariables([...envVariables, { key: '', value: '' }]);
  };

  // Remove an environment variable input field
  const removeEnvField = (index) => {
    const updatedEnvVariables = envVariables.filter((_, i) => i !== index);
    setEnvVariables(updatedEnvVariables);
  };

  // Update context whenever relevant data changes
  useEffect(() => {
    setUserCourseInput((prevInput) => ({
      ...prevInput,
      integrations,
      keysRequired: envVariables.map((env) => ({
        environmentVariable: env.key,
        key: env.value,
      })),
      authentication: {
        requiresAuthentication: authentication === 'yes',
        provider: authentication === 'yes' ? provider : '',
      },
    }));
  }, [integrations, envVariables, authentication, provider, setUserCourseInput]);

  return (
    <div className='p-5 bg-gradient-to-r from-blue-100 to-purple-100 min-h-screen'>
      <h1 className='text-2xl font-bold text-gray-700 mb-6 text-center'>Integrations</h1>

      {/* Input for integrations */}
      <div className='mb-8'>
        <h2 className='text-xl font-semibold text-gray-600 mb-2'>Add Integrations</h2>
        {integrations.map((integration, index) => (
          <div key={index} className='flex items-center mb-4'>
            <input
              type='text'
              className='border border-gray-300 rounded-md p-3 w-full shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all'
              placeholder='Enter integration (e.g., Google Maps, YouTube, Clerk Authentication)'
              value={integration}
              onChange={(e) => handleIntegrationChange(index, e.target.value)}
            />
            {integrations.length > 1 && (
              <button
                type='button'
                onClick={() => removeIntegrationField(index)}
                className='ml-2 text-white bg-red-500 rounded-full p-3 hover:bg-red-600 transition duration-300'
              >
                <HiMinusCircle className='w-5 h-5' />
              </button>
            )}
            {integrations.length < 5 && (
              <button
                type='button'
                onClick={addIntegrationField}
                className='ml-2 text-white bg-blue-500 rounded-full p-3 hover:bg-blue-600 transition duration-300'
              >
                <HiPlusCircle className='w-5 h-5' />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Environment Variables Section */}
      <h2 className='text-xl font-semibold text-gray-600 mb-2'>Enter Keys Required for Integration (if needed)</h2>
      {envVariables.map((env, index) => (
        <div key={index} className='flex mb-4'>
          <input
            type='text'
            className='border border-gray-300 rounded-md p-3 w-1/2 mr-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all'
            placeholder='Environment Variable'
            value={env.key}
            onChange={(e) => handleEnvChange(index, 'key', e.target.value)}
          />
          <input
            type='text'
            className='border border-gray-300 rounded-md p-3 w-1/2 ml-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all'
            placeholder='Actual Key'
            value={env.value}
            onChange={(e) => handleEnvChange(index, 'value', e.target.value)}
          />
          {envVariables.length < 5 && (
            <button
              type='button'
              onClick={addEnvField}
              className='ml-2 text-white bg-blue-500 rounded-full p-3 hover:bg-blue-600 transition duration-300'
            >
              <HiPlusCircle className='w-5 h-5' />
            </button>
          )}
          {envVariables.length > 1 && (
            <button
              type='button'
              onClick={() => removeEnvField(index)}
              className='ml-2 text-white bg-red-500 rounded-full p-3 hover:bg-red-600 transition duration-300'
            >
              <HiMinusCircle className='w-5 h-5' />
            </button>
          )}
        </div>
      ))}

      {/* Authentication Section */}
      <div className='mt-6'>
        <h2 className='text-xl font-semibold text-gray-600 mb-2'>Authentication Required?</h2>
        <div className='flex items-center mb-4'>
          <label className='mr-2'>Yes</label>
          <input
            type='radio'
            value='yes'
            checked={authentication === 'yes'}
            onChange={() => setAuthentication('yes')}
          />
          <label className='ml-4 mr-2'>No</label>
          <input
            type='radio'
            value='no'
            checked={authentication === 'no'}
            onChange={() => setAuthentication('no')}
          />
        </div>

        {authentication === 'yes' && (
          <div className='mb-4'>
            <input
              type='text'
              className='border border-gray-300 rounded-md p-3 w-full shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all'
              placeholder='Provider (e.g., Clerk, Google OAuth)'
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default Integrations;