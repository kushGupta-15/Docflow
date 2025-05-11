"use client"
import React from 'react'
import { useSelf,ClientSideSuspense } from '@liveblocks/react/suspense'
import { useOthers } from '@liveblocks/react'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
  } from "@/components/ui/tooltip"
  import { Avatar,AvatarFallback,AvatarImage } from './ui/avatar'

function Avatars() {
    const self = useSelf();
    const others = useOthers();
    console.log("others" , others)
    

    const all = [self, ...others];
    console.log("all",all);
  return (
    <ClientSideSuspense fallback={(<><div className='text-black'>Loading...</div></>)}>
    <div>
      <div className="flex gap-2 items-center"></div>
      <p className="font-light text-sm">User currently editing this page</p>
      <div className="flex -space-x-5">
        {all.map((other, index) => (
          <TooltipProvider key={other?.id + index}>
            <Tooltip>
              <TooltipTrigger>
                <Avatar className='border-2 hover:z-50'>
                  <AvatarImage src={other?.info.avatar} />
                  <AvatarFallback>{other?.info.name}</AvatarFallback>
                </Avatar>
              </TooltipTrigger>
              <TooltipContent>
                <p>{self?.id === other?.id ? "You" : other?.info.name}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}
      </div>
    </div>
    </ClientSideSuspense>
  );
}

export default Avatars