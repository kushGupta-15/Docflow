import { adminDb } from "@/firebase-admin";
import liveblocks from "@/lib/liveblocks";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";


export async function POST(req : NextRequest) {
    await auth.protect();
    const {sessionClaims} = await auth();
    const {room} = await req.json()
    
    const session = liveblocks.prepareSession(sessionClaims?.email!,{
        userInfo : {
            name : sessionClaims?.Full_name! as string,
            email : sessionClaims?.email!,
            avatar : sessionClaims?.image!
        }
    });

    const usersInroom = await adminDb.collectionGroup("rooms").where("UserId","==",sessionClaims?.email!).get();
    
    const userInroom =  usersInroom.docs.find((doc)=>doc.id === room);

    if(userInroom?.exists){
       session.allow(room,session.FULL_ACCESS);
       const {body,status} = await session.authorize();
        console.log("You are authorised")
       return new Response(body,{status})
    }
    else{
        return NextResponse.json(
            {message : "You are not in the room"},
            {status : 403},
        );
    }



}