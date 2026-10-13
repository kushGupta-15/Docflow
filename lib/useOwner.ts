import { db } from "@/firebase";
import { useUser } from "@clerk/nextjs";
import { useRoom, useSelf } from "@liveblocks/react/suspense";
import { doc } from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import { useDocumentData } from "react-firebase-hooks/firestore";
import { DocumentRole } from "@/types/types";

export function useDocRole() {
  const { user } = useUser();
  const room = useRoom();
  const userInfo = useSelf((me) => me.info);

  const [role, setRole] = useState<DocumentRole | null>(null);

  const userEmail = (user?.primaryEmailAddress?.emailAddress || user?.emailAddresses?.[0]?.emailAddress)?.trim().toLowerCase();

  // 1. Direct lookup in users/{userEmail}/rooms/{roomId}
  const userRoomDocRef = useMemo(() => {
    return userEmail ? doc(db, "users", userEmail, "rooms", room.id) : null;
  }, [userEmail, room.id]);

  // 2. Direct lookup in documents/{roomId}
  const documentDocRef = useMemo(() => {
    return doc(db, "documents", room.id);
  }, [room.id]);

  // 3. Direct lookup in documents/{roomId}/users/{userEmail}
  const roomUserDocRef = useMemo(() => {
    return userEmail ? doc(db, "documents", room.id, "users", userEmail) : null;
  }, [room.id, userEmail]);

  const [userRoomData] = useDocumentData(userRoomDocRef);
  const [documentData] = useDocumentData(documentDocRef);
  const [roomUserData] = useDocumentData(roomUserDocRef);

  useEffect(() => {
    if (!userEmail) {
      setRole(null);
      return;
    }

    // 1. Check owner status
    const isDocOwner = documentData?.ownerId?.trim().toLowerCase() === userEmail;
    if (isDocOwner || userRoomData?.role === "owner" || roomUserData?.role === "owner" || userInfo?.role === "owner") {
      setRole("owner");
      return;
    }

    // 2. Check explicit viewer status from Liveblocks session or Firestore
    if (userInfo?.role === "viewer" || userRoomData?.role === "viewer" || roomUserData?.role === "viewer") {
      setRole("viewer");
      return;
    }

    // 3. Check explicit editor status
    if (userInfo?.role === "editor" || userRoomData?.role === "editor" || roomUserData?.role === "editor") {
      setRole("editor");
      return;
    }

    // Fallback: If userInfo role is set, use it
    if (userInfo?.role) {
      setRole(userInfo.role as DocumentRole);
    }
  }, [userEmail, documentData, userRoomData, roomUserData, userInfo]);

  const isOwner = role === "owner";
  const isViewer = role === "viewer" || userInfo?.role === "viewer";
  const canEdit = !isViewer && (isOwner || role === "editor" || userInfo?.role === "editor" || userInfo?.role === "owner");

  return { role, isOwner, isViewer, canEdit };
}

function useOwner() {
  const { isOwner } = useDocRole();
  return isOwner;
}

export default useOwner;
