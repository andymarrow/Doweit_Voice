import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { HiPencilSquare } from 'react-icons/hi2';
import { Button } from '@/components/ui/button';
import { db } from '@/configs/db';
import { CourseList } from '@/configs/schemaCourse';
import { eq } from 'drizzle-orm';

export default function EditCoursePublicity({ course,refreshData }) {
  // Set initial state to false if makePublic is undefined
  const [isPublic, setIsPublic] = useState(course?.makePublic ?? false);

  useEffect(() => {
    setIsPublic(course?.makePublic ?? false);
  }, [course]);

  const onUpdateHandler = async () => {
    console.log("Updating makePublic to:", isPublic);

    try {
      const result = await db.update(CourseList).set({
        makePublic: isPublic, // Update only the makePublic field
      }).where(eq(CourseList.id, course?.id)).returning({ id: CourseList.id });

      console.log(result);

      refreshData(true)

    } catch (error) {
      console.error("Error updating course publicity:", error);
    }
  };

  return (
    <Dialog>
      <DialogTrigger><HiPencilSquare /></DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Make Your Course Public or Private</DialogTitle>
          <DialogDescription>
            <div className='mt-3'>
              <label className='block mb-2'>Course Publicity</label>
              <div className='flex items-center'>
                <input
                  type="checkbox"
                  checked={isPublic}
                  onChange={() => setIsPublic(prev => !prev)}
                  className='mr-2'
                />
                <span>{isPublic ? "Make Public" : "Don't Make Public"}</span>
              </div>
            </div>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose>
            <Button onClick={onUpdateHandler}>Update</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}