import { useUser } from '@clerk/nextjs'
import { useRoom } from '@liveblocks/react/suspense';
import { collectionGroup, query, where } from 'firebase/firestore';
import { useEffect, useState } from 'react'
import { useCollection } from 'react-firebase-hooks/firestore';
import { db } from '@/firebase';


function useOwner() {
 const {user} = useUser();
 const room = useRoom();
 const[isowner,setIsOwner] = useState(false);
 const [userInRooms] = useCollection(
    user && query(collectionGroup(db,"rooms"),where("roomId","==",room.id))
 )
 console.log("ownerrr",user);
 userInRooms?.docs.forEach((doc) => console.log("datadatdaa",doc.data()));
 
 useEffect(()=>{
   if(userInRooms?.docs && userInRooms.docs.length > 0){
      const owners = userInRooms.docs.filter((doc)=> doc.data().role==="Owner");
     
      if (
        owners.some(
          (owner) => owner.data().UserId === user?.emailAddresses[0]?.toString()
        )
      ) {
        setIsOwner(true);
     
      }
   };

 },[userInRooms,user]);

 return isowner;
}

export default useOwner