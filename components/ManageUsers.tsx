"use client";
import React, {  useTransition } from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
 
  } from "@/components/ui/dialog"
  import { useState } from 'react';
  import { Button } from './ui/button';

import {removeUserFromDocument } from '@/actions/actions';
import { toast } from "sonner";
import { useUser } from '@clerk/nextjs';
import useOwner from '@/lib/useOwner';
import { useRoom } from '@liveblocks/react';
import { useCollection } from 'react-firebase-hooks/firestore';
import { collectionGroup, query, where } from 'firebase/firestore';
import { db } from '@/firebase';


function ManageUsers() {
    const {user} = useUser();
    const isOwner = useOwner();
    const room = useRoom();

    const [isOpen, setIsOpen] = useState(false);
    const [isPending,startTransition] = useTransition();

    const [userInRooms] = useCollection(
        user && query(collectionGroup(db,"rooms"),where("roomId","==",room.id))
     )
    

    const handleDelete =  (userId : string) =>{
        startTransition(async ()=>{
            if(!user) return ;

            const { success }: { success: boolean} =
              await removeUserFromDocument(room.id, userId);

            if(success){
                toast.success("User removed from room successfully");
            }else{
                toast.error("Failed to remove user from room");
            }
        })
    
    }
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <Button variant={"outline"} asChild>
        {/*as child is used to wrap the button around the dialog trigger */}
        <DialogTrigger>Users ({userInRooms?.docs.length})</DialogTrigger>
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Users with the Access</DialogTitle>
          <DialogDescription>
            Below is the lsit of users who have access to this document
          </DialogDescription>
        </DialogHeader>
        <hr className='my-2'/>

        <div className='flex flex-col space-y-2'>
            {userInRooms?.docs.map((doc,index)=> (
                <div key={index} className='flex justify-between items-center'>
                    <p className='font-light'>{doc.data().UserId === user?.emailAddresses[0].toString() ? `You (${doc.data().UserId})` : doc.data().UserId}</p>

                    <div className='flex items-center gap-2'>
                        <Button variant={"outline"}>{doc.data().role}</Button>
                        {isOwner && (
                          <>
                            { doc.data().role!=="Owner" && <Button variant={"destructive"} onClick={()=> handleDelete(doc.data().serId)}  disabled={isPending} size={"sm"}>
                                {isPending ? "Removing..." : "X"}
                            </Button>}
                            </>
                        )}

                    </div>
                </div>

            ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ManageUsers