import React, { useEffect, useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "@/components/ui/dialog"
import { HiPencilSquare } from 'react-icons/hi2'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { DialogClose } from '@radix-ui/react-dialog'
import { Button } from '@/components/ui/button'
import { db } from '@/configs/db'
import { CourseList } from '@/configs/schemaCourse'
import { eq } from 'drizzle-orm'

export default function EditCourseBasicInfo({course,params,refreshData}) {
  
    const [name,setName]=useState();
    const [description,setDescription]=useState();

    useEffect(()=>{
        setName(course?.courseOutput?.course?.name);
        setDescription(course?.courseOutput?.course?.description);
    },[course])

    const onUpdateHandler=async()=>{
        course.courseOutput.course.name=name;
        course.courseOutput.course.description=description;
        const result=await db.update(CourseList).set({
            courseOutput:course?.courseOutput
        }).where(eq(CourseList?.id,course?.id)).returning({id:CourseList.id});

        refreshData(true);
        // the course list return thing was added here so that we will returnt the update list id
        // console.log(result)
    }

    return (
    <Dialog>
        <DialogTrigger><HiPencilSquare/></DialogTrigger>
        <DialogContent>
            <DialogHeader>
            <DialogTitle>Edit Course Title & Description</DialogTitle>
            <DialogDescription>
                <div className='mt-3'>
                    <label>Course title</label>
                    <Input defaultValue={course?.courseOutput?.course?.name}
                        onChange={(event)=>setName(event?.target.value)}
                    />
                </div>
                <div>
                    <label>Course Description</label>
                    <Textarea className="h-40" defaultValue={course?.courseOutput?.course?.description}
                         onChange={(event)=>setDescription(event?.target.value)}
                    />
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

  )
}
