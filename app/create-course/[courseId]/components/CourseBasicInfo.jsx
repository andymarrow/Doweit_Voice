import { Button } from '@/components/ui/button';
import Image from 'next/image';
import React, { useState, useEffect } from 'react';
import { HiOutlinePuzzlePiece } from 'react-icons/hi2';
import EditCourseBasicInfo from './EditCourseBasicInfo';
import { storage } from '@/configs/firebaseConfig';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { db } from '@/configs/db';
import { CourseList } from '@/configs/schemaCourse';
import { eq } from 'drizzle-orm';
import Link from 'next/link';

export default function CourseBasicInfo({ course, refreshData,edit=true }) {
    const [selectedFile, setSelectedFile] = useState(null);
    const [imageSrc, setImageSrc] = useState("/imagePlaceholder.jpg");

    useEffect(() => {
        // Update image source when course changes
        if (course?.courseBanner) {
            setImageSrc(course.courseBanner);
        }
    }, [course]);

    const onFileSelected = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setSelectedFile(URL.createObjectURL(file));
        const fileName = Date.now() + '.jpg';
        const storageRef = ref(storage, 'doweit-images/' + fileName);

        await uploadBytes(storageRef, file).then(async (snapshot) => {
            console.log("Uploaded the file");
            const downloadUrl = await getDownloadURL(storageRef);
            console.log(downloadUrl);
            await db.update(CourseList).set({
                courseBanner: downloadUrl,
            }).where(eq(CourseList.id, course?.id));
            // Update imageSrc with the new URL
            setImageSrc(downloadUrl);
        });
    };

    return (
        <div className='p-10 border rounded-xl shadow-lg mt-5 transition-transform transform hover:scale-105'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
                <div>
                    <h2 className='font-bold text-3xl text-gray-800 hover:text-blue-600 transition-colors duration-300'>
                        {course?.courseOutput?.course?.name} 
                        {edit&& <EditCourseBasicInfo course={course} refreshData={() => refreshData(true)} />}
                    </h2>
                    <p className='text-sm text-gray-500 mt-3'>{course?.courseOutput?.course?.description}</p>
                    <h3 className='font-medium mt-2 flex gap-2 items-center text-blue-600'>
                        <HiOutlinePuzzlePiece className='text-lg' />
                        {course?.category}
                    </h3>

                    {!edit && <Link href={'/course/'+course?.courseId+"/start"}>
                            <Button className="w-full mt-5 bg-blue-600 hover:bg-blue-700 text-white transition duration-300">Start</Button>
                    </Link>}
                </div>
                <div className='shadow-xl rounded-xl overflow-hidden'>
                    <label htmlFor="upload-image">
                        <Image 
                            src={selectedFile ? selectedFile : imageSrc} 
                            width={300} 
                            height={300} 
                            className='w-full rounded-xl object-cover transition-transform duration-300 hover:scale-105 cursor-pointer' 
                            alt={course?.courseOutput?.course?.name} 
                        />
                    </label>
                   {edit&&  <input type="file" id="upload-image" className="opacity-0" onChange={onFileSelected} />}
                </div>
            </div>
        </div>
    );
} 