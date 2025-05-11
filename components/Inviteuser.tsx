"use client";
import React, { FormEvent, useTransition } from 'react'
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
import { usePathname } from 'next/navigation';
import {inviteUserToDocument } from '@/actions/actions';
import { toast } from "sonner";
import { Input } from './ui/input';

  

function Inviteuser() {
    const [isOpen, setIsOpen] = useState(false);
    const [isPending,startTransition] = useTransition();
    const [email,setEmail] = useState("");
    const pathname= usePathname();

    const handleInvite = async (e:FormEvent)=>{
        e.preventDefault();

        const roomId = pathname.split("/")[2];
        if (!roomId) return;

        startTransition(async ()=>{
            const { success } = await inviteUserToDocument( roomId , email);
 
            if(success){
                setIsOpen(false);
                setEmail('')
                toast.success("User Invited Successfully");
            }else{
                toast.error("Failed to Invite User");
            }
        })
    
    }
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <Button variant={"outline"} asChild>
        {/*as child is used to wrap the button around the dialog trigger */}
        <DialogTrigger>Invite</DialogTrigger>
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite a user to collaborate</DialogTitle>
          <DialogDescription>
            Enter the email of the user to invite!!
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleInvite} className="flex flex-col gap-2">
          <Input
            type="email"
            placeholder="Email"
            onChange={(e) => setEmail(e.target.value)}
            value={email}
            className="w-full"
          />
          <Button type="submit" disabled={!email || isPending}>
            {isPending ? "Inviting..." : "Invite"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default Inviteuser