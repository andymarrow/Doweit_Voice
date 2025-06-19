import React, { useEffect, useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogClose
} from "@/components/ui/dialog";
import { HiPencilSquare } from 'react-icons/hi2';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { db } from '@/configs/db';
import { ProjectList } from '@/configs/schemaCourse';
import { eq } from 'drizzle-orm';

export default function EditPageDetailUpdateInfo({ projectId, projectOutput, pageKey, pageDescription, onUpdate }) {
    const [name, setName] = useState(pageKey);
    const [description, setDescription] = useState(pageDescription);

    const handleUpdate = async () => {
        try {
            // Create a deep copy of projectOutput to avoid direct mutation
            const updatedOutput = JSON.parse(JSON.stringify(projectOutput));
    
            // Assume name is 'game.py' and you have a project key
            const projectKey = 'space-shooter-game'; // Use the correct project key
    
            // Check if the project key exists
            if (!updatedOutput[projectKey]) {
                console.error(`Project key ${projectKey} does not exist in projectOutput`);
                return;
            }
    
            // Access the 'src' object of the specific project
            const projectSrc = updatedOutput[projectKey].src;
    
            // Check if the 'game.py' file exists in 'src'
            if (!projectSrc || !projectSrc.hasOwnProperty('game.py')) {
                console.error(`Key game.py does not exist in projectOutput[${projectKey}].src`);
                return;
            }
    
            // Update the description at the key
            projectSrc['game.py'] = description; // Update with the new description
    
            // Perform the database update
            await db
                .update(ProjectList)
                .set({ projectOutput: updatedOutput }) // Use the modified projectOutput directly
                .where(eq(ProjectList.projectId, projectId));
    
            // Update the state in the parent component
            if (onUpdate) {
                onUpdate(updatedOutput); // Pass the updated output if needed
            }
            console.log('Update successful');
        } catch (error) {
            console.error('Error updating project details:', error);
        }
    };
    
    
    

    return (
        <Dialog>
            <DialogTrigger>
                <HiPencilSquare />
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit File Name & Description</DialogTitle>
                    <DialogDescription>
                        <div className='mt-3'>
                            <label>File Name</label>
                            <Input 
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>
                        <div>
                            <label>File Description</label>
                            <Textarea 
                                className="h-40" 
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </div>
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button onClick={handleUpdate}>Update</Button>
                    <DialogClose>
                        <Button>Close</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}