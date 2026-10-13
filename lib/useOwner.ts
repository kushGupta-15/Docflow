import { db } from "@/firebase";
import { useUser } from "@clerk/nextjs";
import { useRoom } from "@liveblocks/react/suspense";
import { collectionGroup, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useCollection } from "react-firebase-hooks/firestore";

function useOwner() {
  const { user } = useUser();
  const room = useRoom();
  const [isOwner, setIsOwner] = useState(false);
  const [usersInRoom] = useCollection(
    user && query(collectionGroup(db, "rooms"), where("roomId", "==", room.id))
  );

  useEffect(() => {
    if (!user || !usersInRoom) {
      setIsOwner(false);
      return;
    }

    const userEmail = user.emailAddresses[0]?.emailAddress;
    if (!userEmail) {
      setIsOwner(false);
      return;
    }

    if (usersInRoom.docs && usersInRoom.docs.length > 0) {
      const owners = usersInRoom.docs.filter(
        (doc) => doc.data().role === 'owner'
      );

      const hasOwnerRole = owners.some(
        (owner) => owner.data().userId === userEmail
      );

      setIsOwner(hasOwnerRole);
    } else {
      setIsOwner(false);
    }
  }, [usersInRoom, user]);

  return isOwner
}

export default useOwner;
