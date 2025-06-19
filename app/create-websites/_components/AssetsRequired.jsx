import { storage } from '@/configs/firebaseConfig';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import React, { useState, useContext } from 'react';
import { HiPlusCircle, HiMinusCircle } from 'react-icons/hi2';
import { UserInputContext } from '../_context/UserInputContext';

function AssetsRequired() {
  const [assets, setAssets] = useState([{ name: '', type: '' }]);
  const [documentSrc, setDocumentSrc] = useState('');
  const [fileType, setFileType] = useState('');
  const [fileName, setFileName] = useState('');
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [requiresAssets, setRequiresAssets] = useState(false); // State to track if assets are required
  const { userCourseInput, setUserCourseInput } = useContext(UserInputContext);

  const handleAssetChange = (index, field, value) => {
    const updatedAssets = [...assets];
    updatedAssets[index][field] = value;
    setAssets(updatedAssets);

    // Update the context whenever an asset is changed
    const formattedAssets = updatedAssets.map((asset) => ({
      'asset-Name': asset.name,
      'asset-Type': asset.type,
    }));

    setUserCourseInput((prev) => ({
      ...prev,
      assets: formattedAssets,
    }));
  };

  const addAssetField = () => {
    setAssets([...assets, { name: '', type: '' }]);
  };

  const removeAssetField = (index) => {
    const updatedAssets = assets.filter((_, i) => i !== index);
    setAssets(updatedAssets);

    // Update the context when an asset field is removed
    const formattedAssets = updatedAssets.map((asset) => ({
      'asset-Name': asset.name,
      'asset-Type': asset.type,
    }));

    setUserCourseInput((prev) => ({
      ...prev,
      assets: formattedAssets,
    }));
  };

  const handleRequiresAssetsChange = (value) => {
    setRequiresAssets(value === 'yes');

    // Update the context with requiresAssets status
    setUserCourseInput((prev) => ({
      ...prev,
      requiresAssets: value === 'yes',
    }));
  };

  const onFileSelected = async (event) => {
    const file = event.target.files[0];
    if (file) {
      setDocumentSrc(URL.createObjectURL(file));
      setFileType(file.type);
      setFileName(file.name);

      const fileExtension = file.name.split('.').pop();
      const storageFileName = `${Date.now()}.${fileExtension}`;
      const storageRef = ref(storage, `Ai-File-Uploads/${storageFileName}`);

      try {
        await uploadBytes(storageRef, file);
        console.log('File upload completed:', storageFileName);

        try {
          const url = await getDownloadURL(storageRef);
          setDownloadUrl(url);
          console.log('Download URL:', url);

          // Save the uploaded file URL in the context
          setUserCourseInput((prev) => ({
            ...prev,
            ['Uploaded-File']: url,
          }));
        } catch (error) {
          console.log('Download URL not available for this file type:', error);
          setDownloadUrl(null);
        }
      } catch (error) {
        console.error('Error uploading file:', error);
      }
    } else {
      setDocumentSrc(null);
      setFileType('');
      setFileName('');
      setDownloadUrl(null);
    }
  };

  return (
    <div className='p-5 bg-gradient-to-r from-blue-100 to-purple-100 min-h-screen'>
      <h1 className='text-2xl font-bold text-gray-700 mb-6 text-center'>Assets Required</h1>

      <h2 className='text-xl font-semibold text-gray-600 mb-4 text-center'>You're almost finished!</h2>

      <div className='mb-4'>
        <h3 className='font-semibold text-gray-600 mb-2'>
          Do you need to upload any assets for this project?
        </h3>
        <div className='flex space-x-4'>
          <button
            className={`p-3 border rounded-md ${
              requiresAssets ? 'bg-blue-500 text-white' : 'bg-white text-gray-700 border-gray-300'
            }`}
            onClick={() => handleRequiresAssetsChange('yes')}
          >
            Yes
          </button>
          <button
            className={`p-3 border rounded-md ${
              !requiresAssets ? 'bg-blue-500 text-white' : 'bg-white text-gray-700 border-gray-300'
            }`}
            onClick={() => handleRequiresAssetsChange('no')}
          >
            No
          </button>
        </div>
      </div>
      <div className='mb-6'>
            <h3 className='font-semibold text-gray-600 mb-2'>
              If you have any src documents or workflow documents to help the AI understand what you want better, please drop it below: file type can be anything video, Image, PDF, Docx, PPT, Excel.
            </h3>
            <input
              type='file'
              id='srcOrworkFlowDocument'
              className='border border-gray-300 rounded-md p-3 w-full shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all'
              onChange={onFileSelected}
            />
            {documentSrc && (
              <div className='mt-4'>
                {fileType.startsWith('image/') ? (
                  <img src={documentSrc} alt='Selected file preview' className='w-full h-auto rounded-md shadow-sm' />
                ) : fileType.startsWith('video/') ? (
                  <video controls src={documentSrc} className='w-full h-auto rounded-md shadow-sm' />
                ) : fileType === 'application/pdf' ? (
                  <iframe src={documentSrc} title='PDF preview' className='w-full h-64 rounded-md shadow-sm'></iframe>
                ) : (
                  <div className='p-3 border border-gray-300 rounded-md shadow-sm'>
                    <p className='mb-2'>Preview not available for this file type.</p>
                    <a href={documentSrc} download={fileName} className='text-blue-500 hover:underline'>
                      Download {fileName}
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>
      {requiresAssets && (
        <>
          

          <h3 className='font-semibold text-gray-600 mb-2'>
            If you have any images or videos you want to include from your local device, just enter the name here and the type of file. The AI will ask for the actual files later:
          </h3>

          {assets.map((asset, index) => (
            <div key={index} className='flex mb-4 items-center'>
              <input
                type='text'
                className='border border-gray-300 rounded-md p-3 w-1/2 mr-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all'
                placeholder='Asset Name'
                value={asset.name}
                onChange={(e) => handleAssetChange(index, 'name', e.target.value)}
              />
              <select
                className='border border-gray-300 rounded-md p-3 w-1/4 ml-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all'
                value={asset.type}
                onChange={(e) => handleAssetChange(index, 'type', e.target.value)}
              >
                <option value=''>Select Type</option>
                <option value='image'>Image</option>
                <option value='video'>Video</option>
                <option value='audio'>Audio</option>
                <option value='3D objects'>3D Objects</option>
                <option value='panorama 360s'>Panorama 360s</option>
              </select>
              {assets.length > 1 && (
                <button
                  type='button'
                  onClick={() => removeAssetField(index)}
                  className='ml-2 text-white bg-red-500 rounded-full p-2 hover:bg-red-600 transition duration-300'
                >
                  <HiMinusCircle className='w-5 h-5' />
                </button>
              )}
              <button
                type='button'
                onClick={addAssetField}
                className='ml-2 text-white bg-blue-500 rounded-full p-2 hover:bg-blue-600 transition duration-300'
              >
                <HiPlusCircle className='w-5 h-5' />
              </button>
            </div>
          ))}
        </>
      )}
    </div>
  );
}

export default AssetsRequired;
