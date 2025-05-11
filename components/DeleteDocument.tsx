"use client";
import React, { useTransition } from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
  } from "@/components/ui/dialog"
  import { useState } from 'react';
  import { Button } from './ui/button';
import { DialogClose } from '@radix-ui/react-dialog';
import { usePathname ,useRouter} from 'next/navigation';
import { deleteDocument } from '@/actions/actions';
import { toast } from "sonner";
  

function DeleteDocument() {
    const [isOpen, setIsOpen] = useState(false);
    const [isPending,startTransition] = useTransition();
    const pathname= usePathname();
    const router = useRouter();

    const handleDelete = async ()=>{
        const roomId = pathname.split("/")[2];
        if (!roomId){
            return ;
        };

        startTransition(async ()=>{
            const { success } = await deleteDocument(roomId);

            if(success){
                setIsOpen(false);
                router.replace("/");
                toast.success("Room Deleted Successfully");
            }
            else{
                toast.error("Failed to Delete Room");
            }
        })
    
    }
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <Button variant={"destructive"} asChild>
        {/*as child is used to wrap the button around the dialog trigger */}
        <DialogTrigger>Delete</DialogTrigger>
      </Button>
      <DialogContent>
        <DialogHeader>
        <DialogTitle>{`Are you sure you want to Delete ?`}</DialogTitle>
        <DialogDescription>
          {`This will delete the document and all its content.`}
        </DialogDescription>

        </DialogHeader>
        <DialogFooter className='sm:justify-end gap-2'>
          <Button
            variant={"destructive"}
            onClick={handleDelete}
            type="button"
            disabled={isPending}
          >
            {isPending ? "Deleting..." : "Delete"}
          </Button>
          <DialogClose asChild>
            <Button type='button' variant={"secondary"} >Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default DeleteDocument