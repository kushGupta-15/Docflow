'use server';
import { adminDb } from "@/firebase-admin";
import { auth } from "@clerk/nextjs/server";
import { User } from "../types/types";
import { Merge } from "lucide-react";
import liveblocks from "@/lib/liveblocks";


  // this indicate that the this is a server action and it is very powerfull4


export async function createNewUser() {
    //if the user is not logged in we want the user to be sent to the login  page for that we use Auth form clek next.js
    await  auth.protect() // if the user is not looged in it will redirect to login
    const {sessionClaims} = await auth();
    const docCollectionRf = adminDb.collection("Documents");
    const docRef = await  docCollectionRf.add({
        title : "New Document"
    })
    await adminDb.collection("User").doc(sessionClaims?.email!).collection("rooms").doc(docRef.id).set({
       UserId : sessionClaims?.email!,
       role : "Owner",
       CreatedAt : new Date(),
       roomId : docRef.id,
    })

    

    return {docId : docRef.id}
    
}


export async function deleteDocument(roomId : string) {
  auth.protect();
  try{
    await adminDb.collection("documents").doc(roomId).delete();

    //deleting all the refrences of the room from the users entered rooms;
    const query = await adminDb.collectionGroup("rooms").where("roomId","==",roomId).get();

    const  batch = adminDb.batch();


    query.docs.forEach((doc)=> {
      batch.delete(doc.ref);
    })

    await batch.commit();

    await liveblocks.deleteRoom(roomId);

    return {success : true};

  }catch(error){
    console.log("error in the deleting the document : ",error);
    return { success: false };
  }

}


export async function inviteUserToDocument(roomId: string, email: string) {
  auth.protect();

  console.log("Invite the user to the document" , roomId,email);

  try{

    await adminDb
      .collection("User")
      .doc(email)
      .collection("rooms")
      .doc(roomId)
      .set({
        UserId: email,
        role : "editor",
        CreatedAt : new Date(),
        roomId,
      });

      return {success : true};

  }catch(error){
    console.log("error in inviting the user" , error);
    return {success : false};
  }
}

export async function removeUserFromDocument(roomId : string , email : string) {
  auth.protect();

  console.log("removeFromDocument" , roomId,email);

  try{  
        await adminDb.collection("User").doc(email).collection("rooms").doc(roomId).delete();
        return {success  : true} ;
  }catch(error){
    console.log("error in removing the user from the document" ,error)
    return {success : false};
  }
}