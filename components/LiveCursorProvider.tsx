"use client";

import {
  useMyPresence,
  useOthers,
  useRoom,
  ClientSideSuspense,
} from "@liveblocks/react/suspense";
import React, { PointerEvent } from "react";
import FollowPointer from "./FollowPointer";
import LoadingSpinner from "./LoadingSpinner";

function LiveCursorProvider({ children }: { children: React.ReactNode }) {
  const room = useRoom(); // Ensure the room is connected
  const [myPresence, updatePresence] = useMyPresence();
  const others = useOthers();

  // Ensure room is ready (though useRoom from suspense already handles this)
  if (!room) return <p>Loading room...</p>;

  // Update cursor position if changed
  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const newCursor = { x: e.pageX, y: e.pageY };
    if (
      !myPresence.cursor ||
      myPresence.cursor.x !== newCursor.x ||
      myPresence.cursor.y !== newCursor.y
    ) {
      updatePresence({ cursor: newCursor });
    }
  };

  // Remove cursor when leaving
  const onPointerLeave = () => {
    updatePresence({ cursor: null });
  };

  return (
    <div onPointerMove={onPointerMove} onPointerLeave={onPointerLeave}>
      {others
        .filter((other) => other.presence?.cursor !== null)
        .map(({ presence, connectionId, info }) => (
          <FollowPointer
            key={connectionId}
            info={info}
            x={presence.cursor!.x}
            y={presence.cursor!.y}
          />
        ))}
      <ClientSideSuspense fallback={<LoadingSpinner />}>{children}</ClientSideSuspense>
    </div>
  );
}

export default function ParentComponent({
  children,
}: {
  children: React.ReactNode;
}) {
  return <LiveCursorProvider>{children}</LiveCursorProvider>;
}