import { getAdminDb } from "@/firebase-admin";
import liveblocks from "@/lib/liveblocks";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate the user session
    const { sessionClaims } = await auth().protect();
    const rawEmail = sessionClaims?.email;

    if (!rawEmail) {
      return NextResponse.json({ error: "Unauthorized: User email not found" }, { status: 401 });
    }
    const userEmail = rawEmail.trim().toLowerCase();

    // 2. Extract requested room ID
    const body = await req.json();
    const room = body?.room;

    if (!room || typeof room !== "string") {
      return NextResponse.json({ error: "Bad Request: room ID is required" }, { status: 400 });
    }

    const adminDb = getAdminDb();

    // 3. Verify room exists
    const roomRef = adminDb.collection("documents").doc(room);
    const roomDoc = await roomRef.get();

    if (!roomDoc.exists) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    // 4. Verify user membership across both schemas (users collection & document subcollection)
    const [userRoomDoc, userInRoomDoc] = await Promise.all([
      adminDb.collection("users").doc(userEmail).collection("rooms").doc(room).get(),
      roomRef.collection("users").doc(userEmail).get(),
    ]);

    const isDocumentOwner = roomDoc.data()?.ownerId?.toLowerCase() === userEmail;

    let role: string | null = null;
    if (isDocumentOwner || userRoomDoc.data()?.role === "owner" || userInRoomDoc.data()?.role === "owner") {
      role = "owner";
    } else if (userInRoomDoc.exists) {
      role = userInRoomDoc.data()?.role || "editor";
    } else if (userRoomDoc.exists) {
      role = userRoomDoc.data()?.role || "editor";
    }

    // 5. Strictly enforce authorization: Reject unauthorized users
    if (!role) {
      console.warn(`Access denied for ${userEmail} to room ${room}`);
      return NextResponse.json(
        { error: "Forbidden: You do not have permission to access this document" },
        { status: 403 }
      );
    }

    // 6. Prepare session for user with clerk identity info
    const session = liveblocks.prepareSession(userEmail, {
      userInfo: {
        name: sessionClaims.fullName || userEmail.split("@")[0],
        email: userEmail,
        avatar: sessionClaims.image ?? "",
      },
    });

    // 7. Grant access level based on role
    if (role === "viewer") {
      session.allow(room, session.READ_ACCESS);
    } else {
      session.allow(room, session.FULL_ACCESS);
    }

    const { body: authBody, status } = await session.authorize();
    return NextResponse.json(JSON.parse(authBody), { status });
  } catch (error: any) {
    console.error("Error in Liveblocks auth endpoint:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

