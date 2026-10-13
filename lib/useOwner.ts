import { db } from "@/firebase";
import { useUser } from "@clerk/nextjs";
import { useRoom } from "@liveblocks/react/suspense";
import { doc } from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import { useDocumentData } from "react-firebase-hooks/firestore";

function useOwner() {
  const { user } = useUser();
  const room = useRoom();
  const [isOwner, setIsOwner] = useState(false);

  const userEmail = (user?.primaryEmailAddress?.emailAddress || user?.emailAddresses?.[0]?.emailAddress)?.trim().toLowerCase();

  // 1. Direct lookup in users/{userEmail}/rooms/{roomId}
  const userRoomDocRef = useMemo(() => {
    return userEmail ? doc(db, "users", userEmail, "rooms", room.id) : null;
  }, [userEmail, room.id]);

  // 2. Direct lookup in documents/{roomId}
  const documentDocRef = useMemo(() => {
    return doc(db, "documents", room.id);
  }, [room.id]);

  const [userRoomData] = useDocumentData(userRoomDocRef);
  const [documentData] = useDocumentData(documentDocRef);

  useEffect(() => {
    if (!userEmail) {
      setIsOwner(false);
      return;
    }

    const isDocOwner =
      documentData?.ownerId?.trim().toLowerCase() === userEmail;

    const isRoomOwner =
      userRoomData?.role === "owner" ||
      (userRoomData?.userId?.trim().toLowerCase() === userEmail && userRoomData?.role === "owner");

    setIsOwner(Boolean(isDocOwner || isRoomOwner));
  }, [userEmail, documentData, userRoomData]);

  return isOwner;
}

export default useOwner;
