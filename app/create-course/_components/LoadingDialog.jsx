import React from 'react'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
  } from "@/components/ui/alert-dialog"
import Image from 'next/image'

  
export default function LoadingDialog({loading}) {
  return (
            <AlertDialog open={loading}>
                {/* <AlertDialogTrigger>Open</AlertDialogTrigger> */}
                <AlertDialogContent>
                    <AlertDialogHeader>
                    {/* <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle> */}
                    <AlertDialogDescription>
                        <div className='flex flex-col items-center py-10'>
                            <Image src={`/loaderForCourse.gif`} width={100} height={100}/>
                            <h2>Please Wait .... Ai is Generating your Content</h2>
                        </div>
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    {/* <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction>Continue</AlertDialogAction>
                    </AlertDialogFooter> */}
                </AlertDialogContent>
        </AlertDialog>

  )
}
