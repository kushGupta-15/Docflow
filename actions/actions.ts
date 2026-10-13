'use server'

import { getAdminDb } from "@/firebase-admin"
import liveblocks from "@/lib/liveblocks"
import { auth } from "@clerk/nextjs/server"
import { DocumentRole } from "@/types/types"

export async function createNewDocument(initialTitle: string = 'New Doc') {
  auth().protect()

  const { sessionClaims } = await auth()
  const userEmail = sessionClaims?.email;
  if (!userEmail) {
    throw new Error('User email not found in session');
  }

  console.log('Creating document for user:', userEmail);

  const adminDb = getAdminDb();
  const documentCollectionRef = adminDb.collection('documents')

  const docRef = await documentCollectionRef.add({
    title: initialTitle,
    ownerId: userEmail,
    createdAt: new Date()
  })

  console.log('Document created with ID:', docRef.id);

  // Link room under user's profile
  await adminDb
    .collection('users')
    .doc(userEmail)
    .collection('rooms')
    .doc(docRef.id)
    .set({
      userId: userEmail,
      role: 'owner' as DocumentRole,
      createdAt: new Date(),
      roomId: docRef.id
    })

  // Also record membership under document for room-level queries
  await adminDb
    .collection('documents')
    .doc(docRef.id)
    .collection('users')
    .doc(userEmail)
    .set({
      email: userEmail,
      role: 'owner' as DocumentRole,
      createdAt: new Date()
    })

  console.log('Room references created for user:', userEmail);

  return { docId: docRef.id }
}

export async function deleteDocument(roomId: string) {
  auth().protect()

  const { sessionClaims } = await auth()
  const userEmail = sessionClaims?.email;
  if (!userEmail) {
    return { success: false, error: "Unauthorized: User not authenticated" }
  }

  if (!roomId || typeof roomId !== 'string') {
    return { success: false, error: "Invalid document ID" }
  }

  try {
    const adminDb = getAdminDb();

    // Verify document exists
    const roomRef = adminDb.collection('documents').doc(roomId);
    const roomDoc = await roomRef.get();
    if (!roomDoc.exists) {
      return { success: false, error: "Document not found" }
    }

    // Verify caller ownership
    const callerRoomDoc = await adminDb
      .collection('users')
      .doc(userEmail)
      .collection('rooms')
      .doc(roomId)
      .get();

    const isOwner = (callerRoomDoc.exists && callerRoomDoc.data()?.role === 'owner') ||
                    (roomDoc.data()?.ownerId === userEmail);

    if (!isOwner) {
      console.warn(`User ${userEmail} attempted unauthorized deletion of room ${roomId}`);
      return { success: false, error: "Forbidden: Only the document owner can delete this document" }
    }

    // Delete the document itself
    await roomRef.delete();

    // Batch delete room users in documents/{roomId}/users
    const docUsersSnapshot = await roomRef.collection('users').get();
    const batch = adminDb.batch();
    docUsersSnapshot.docs.forEach((doc: any) => {
      batch.delete(doc.ref);
    });

    // Delete room reference across all users
    const query = await adminDb.collectionGroup('rooms').where('roomId', '==', roomId).get();
    query.docs.forEach((doc: any) => {
      batch.delete(doc.ref);
    });

    await batch.commit();

    // Delete room in Liveblocks
    try {
      await liveblocks.deleteRoom(roomId);
    } catch (lbError) {
      console.warn("Liveblocks deleteRoom non-fatal error:", lbError);
    }

    return { success: true }
  } catch (error: any) {
    console.error("Error deleting document:", error);
    return { success: false, error: error.message || "Failed to delete document" }
  }
}

export async function inviteUserToRoom(
  roomId: string,
  email: string,
  role: DocumentRole = 'editor'
) {
  auth().protect()

  const { sessionClaims } = await auth()
  const callerEmail = sessionClaims?.email;
  if (!callerEmail) {
    return { success: false, error: "Unauthorized: User not authenticated" }
  }

  if (!roomId || typeof roomId !== 'string') {
    return { success: false, error: "Invalid document ID" }
  }

  const targetEmail = email?.trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!targetEmail || !emailRegex.test(targetEmail)) {
    return { success: false, error: "Please enter a valid email address" }
  }

  if (role !== 'editor' && role !== 'viewer') {
    return { success: false, error: "Invalid role. Role must be 'editor' or 'viewer'" }
  }

  try {
    const adminDb = getAdminDb();

    // 1. Verify that document exists
    const roomRef = adminDb.collection('documents').doc(roomId);
    const roomDoc = await roomRef.get();
    if (!roomDoc.exists) {
      return { success: false, error: "Document not found" }
    }

    // 2. Verify caller is owner of the document
    const callerRoomDoc = await adminDb
      .collection('users')
      .doc(callerEmail)
      .collection('rooms')
      .doc(roomId)
      .get();

    const isOwner = (callerRoomDoc.exists && callerRoomDoc.data()?.role === 'owner') ||
                    (roomDoc.data()?.ownerId === callerEmail);

    if (!isOwner) {
      console.warn(`User ${callerEmail} attempted unauthorized invitation to room ${roomId}`);
      return { success: false, error: "Forbidden: Only the document owner can invite collaborators" }
    }

    // 3. Attach room to invited user in users collection
    await adminDb
      .collection('users')
      .doc(targetEmail)
      .collection('rooms')
      .doc(roomId)
      .set({
        userId: targetEmail,
        role,
        createdAt: new Date(),
        roomId,
        invitedBy: callerEmail
      });

    // 4. Attach user to document's users subcollection
    await roomRef.collection('users').doc(targetEmail).set({
      email: targetEmail,
      role,
      createdAt: new Date(),
      invitedBy: callerEmail
    });

    return { success: true }
  } catch (error: any) {
    console.error("Error inviting user to room:", error);
    return { success: false, error: error.message || "Failed to invite user" }
  }
}

export async function removeUserFromRoom(roomId: string, targetEmail: string) {
  auth().protect();

  const { sessionClaims } = await auth();
  const callerEmail = sessionClaims?.email;
  if (!callerEmail) {
    return { success: false, error: "Unauthorized" };
  }

  if (!roomId || !targetEmail) {
    return { success: false, error: "Invalid document ID or email" };
  }

  const normalizedTargetEmail = targetEmail.trim().toLowerCase();

  try {
    const adminDb = getAdminDb();

    // 1. Verify caller is owner of the room
    const roomRef = adminDb.collection('documents').doc(roomId);
    const roomDoc = await roomRef.get();
    if (!roomDoc.exists) {
      return { success: false, error: "Document not found" };
    }

    const callerRoomDoc = await adminDb
      .collection('users')
      .doc(callerEmail)
      .collection('rooms')
      .doc(roomId)
      .get();

    const isOwner = (callerRoomDoc.exists && callerRoomDoc.data()?.role === 'owner') ||
                    (roomDoc.data()?.ownerId === callerEmail);

    if (!isOwner) {
      return { success: false, error: "Forbidden: Only the owner can remove members" };
    }

    if (callerEmail.toLowerCase() === normalizedTargetEmail) {
      return { success: false, error: "The document owner cannot be removed" };
    }

    // 2. Remove from users/{targetEmail}/rooms/{roomId}
    await adminDb
      .collection('users')
      .doc(normalizedTargetEmail)
      .collection('rooms')
      .doc(roomId)
      .delete();

    // 3. Remove from documents/{roomId}/users/{targetEmail}
    await roomRef.collection('users').doc(normalizedTargetEmail).delete();

    return { success: true };
  } catch (error: any) {
    console.error("Error removing user from room:", error);
    return { success: false, error: error.message || "Failed to remove user" };
  }
}

export async function getRoomUsers(roomId: string) {
  auth().protect();

  const { sessionClaims } = await auth();
  const callerEmail = sessionClaims?.email;
  if (!callerEmail) {
    return { success: false, users: [], error: "Unauthorized" };
  }

  if (!roomId) {
    return { success: false, users: [], error: "Room ID required" };
  }

  try {
    const adminDb = getAdminDb();
    const roomRef = adminDb.collection('documents').doc(roomId);
    const roomDoc = await roomRef.get();

    if (!roomDoc.exists) {
      return { success: false, users: [], error: "Document not found" };
    }

    // Fetch members from documents/{roomId}/users
    const usersSnapshot = await roomRef.collection('users').get();
    const users: Array<{
      email: string;
      role: DocumentRole;
      invitedBy?: string;
    }> = [];

    // Also include document owner if not explicitly in subcollection
    const ownerId = roomDoc.data()?.ownerId;
    let ownerIncluded = false;

    usersSnapshot.docs.forEach((doc: any) => {
      const data = doc.data();
      if (data.email === ownerId) ownerIncluded = true;
      users.push({
        email: data.email || doc.id,
        role: data.role || 'editor',
        invitedBy: data.invitedBy,
      });
    });

    if (!ownerIncluded && ownerId) {
      users.unshift({
        email: ownerId,
        role: 'owner',
      });
    }

    return { success: true, users };
  } catch (error: any) {
    console.error("Error fetching room users:", error);
    return { success: false, users: [], error: error.message };
  }
}

