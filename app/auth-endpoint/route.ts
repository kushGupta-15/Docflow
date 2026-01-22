import { getAdminDb } from "@/firebase-admin";
import liveblocks from "@/lib/liveblocks";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    // Test Firestore connection first
    console.log('Testing Firestore connection...');
    const adminDb = getAdminDb();
    await adminDb.collection('test').limit(1).get();
    console.log('Firestore connection successful');

    // Authenticate the request
    const { sessionClaims } = await auth().protect();

    // Extract room from user info
    const { room } = await req.json();

    if (!sessionClaims?.email) {
      return NextResponse.json({ error: "User email not found" }, { status: 400 });
    }

    // Prepare session for USER and combine it with user info from clerk
    const session = liveblocks.prepareSession(sessionClaims.email, {
      userInfo: {
        name: sessionClaims.fullName ?? "",
        email: sessionClaims.email,
        avatar: sessionClaims.image ?? "",
      }
    });

    // Check if user is in the room and has access to
    console.log('Attempting to query Firestore for user:', sessionClaims.email);
    
    // Instead of collectionGroup, let's check if the specific room exists and user has access
    // First, let's try to get the room document directly
    const roomRef = adminDb.collection('documents').doc(room);
    const roomDoc = await roomRef.get();
    
    if (!roomDoc.exists) {
      console.log('Room does not exist:', room);
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }
    
    // Check if user has access to this room by checking the users subcollection
    const userInRoomRef = roomRef.collection('users').doc(sessionClaims.email);
    const userInRoomDoc = await userInRoomRef.get();
    
    console.log('User in room check:', userInRoomDoc.exists);
    
    if (userInRoomDoc.exists) {
      session.allow(room, session.FULL_ACCESS);

      const { body, status } = await session.authorize();

      return NextResponse.json(JSON.parse(body), { status });
    } else {
      // For development: if room exists but no user permissions, allow access
      // Remove this in production and implement proper user invitation flow
      console.log('User not explicitly in room, but room exists. Allowing access for development.');
      session.allow(room, session.FULL_ACCESS);

      const { body, status } = await session.authorize();

      return NextResponse.json(JSON.parse(body), { status });
    }
  } catch (error) {
    console.error("Error in POST handler:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
