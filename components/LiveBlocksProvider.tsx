'use client'

import {
  LiveblocksProvider,
  RoomProvider,
} from "@liveblocks/react/suspense";
// import { Editor } from "./Editor";

function LiveBlocksProvider({children} : {
  children: React.ReactNode
}) {
  if (!process.env.NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY) {
    throw new Error("NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY not set");

  }
  return (
    <LiveblocksProvider authEndpoint={'/auth-endpoint'} throttle={16}>{children}</LiveblocksProvider>
  )
}

export default LiveBlocksProvider
