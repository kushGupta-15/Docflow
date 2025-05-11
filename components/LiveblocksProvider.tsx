'use client'
import React from 'react';
import { LiveblocksProvider } from "@liveblocks/react/suspense";

function LiveBlocksProvider({ children }: { children: React.ReactNode }) {
  // Check if the Liveblocks publishable key is set
  if (!process.env.NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY) {
    throw new Error("NEXT_PUBLIC_LIVEBLOCK_PUBLISHABLE_KEY is not set correctly");
  }

  // Render the LiveblocksProvider component with the necessary props
  return (
    <LiveblocksProvider
      authEndpoint={"/auth-endpoint"}
      throttle={16} // Throttle for smooth experience (16ms for ~60fps)
    >
      {children}
    </LiveblocksProvider>
  );
}

export default LiveBlocksProvider;