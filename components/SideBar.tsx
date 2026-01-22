'use client'

import { MenuIcon } from "lucide-react"
import NewDocumentButton from "./NewDocumentButton"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { useCollection } from 'react-firebase-hooks/firestore'
import { useUser } from "@clerk/nextjs"
import { collectionGroup, DocumentData, query, where, collection } from "firebase/firestore"
import { db } from "@/firebase"
import { useEffect, useState } from "react"
import SideBarOption from "./SideBarOption"

interface RoomDocument extends DocumentData {
  createdAt: string;
  role: 'owner' | 'editor';
  roomId: string;
  userId: string;

}

function SideBar() {
  const {user} = useUser() //from clerk
  const [groupedData, setGroupedData] = useState<{
    owner: RoomDocument[];
    editor: RoomDocument[];
  }>({
    owner: [],
    editor: [],
  })

  // Try a more direct approach - query the user's rooms collection directly
  const [data, loading, error] = useCollection(
    user && user.emailAddresses[0]?.emailAddress ?
      query(
        collection(db, 'users', user.emailAddresses[0].emailAddress, 'rooms')
      ) : null
  )

  // Debug logging
  useEffect(() => {
    console.log('Sidebar data:', data?.docs.length, 'documents');
    console.log('Loading:', loading);
    console.log('Error:', error);
    if (data) {
      console.log('Raw data:', data.docs.map(doc => ({ id: doc.id, data: doc.data() })));
    }
  }, [data, loading, error])

  useEffect(() => {
    if (!data) return

    const grouped = data.docs.reduce<{ //accumulator function
      owner: RoomDocument[];
      editor: RoomDocument[];
    }>(
      (acc, curr) => {
        const roomData = curr.data() as RoomDocument;

        if (roomData.role === 'owner') {
          acc.owner.push({
            id: curr.id,
            ...roomData,
          });
        } else {
          acc.editor.push({
            id: curr.id,
            ...roomData,
          });
        }

        return acc
      }, {
        owner: [],
        editor: [],
      }
    )

    setGroupedData(grouped)

  }, [data])



  const menuOptions = (
    <>
      <NewDocumentButton/>
      {/* My documents */}
      <div className="flex py-4 flex-col space-y-4 md:max-w-36">
        {loading && (
          <p className="text-gray-500 text-sm">Loading documents...</p>
        )}
        
        {error && (
          <p className="text-red-500 text-sm">Error loading documents: {error.message}</p>
        )}
        
        {!loading && !error && groupedData.owner.length === 0 ? (
          <h2 className="text-gray-500 font-semibold text-sm">
            No documents found
          </h2>
          ) : (
            <>
              <h2 className="text-gray-500 font-semibold text-sm">
                My Documents ({groupedData.owner.length})
              </h2>
              {groupedData.owner.map((doc) => (
                // <p key={doc.id}>{doc.roomId}</p>
                <SideBarOption key={doc.id} id={doc.roomId} href={`/doc/${doc.roomId}`}/>
              ))}
            </>
          )
        }

        {/* Shared with me */}
        {groupedData.editor.length > 0 && (
          <>
            <h2 className="text-gray-500 font-semibold text-sm">
              Shared with me
            </h2>
            {groupedData.editor.map((doc) => (
              <SideBarOption key={doc.id} id={doc.roomId} href={`/doc/${doc.roomId}`} />
            ))}
          </>
        )}


        {/* List */}

        {/* Shared with me */}
        {/* List */}
      </div>

    </>
  )
  return (
    <div className="p-2 md:p-5 bg-gray-200 relative">
      <div className="md:hidden">
        <Sheet>
          <SheetTrigger>
            <MenuIcon className=""/>
          </SheetTrigger>
          <SheetContent side='left'>
            <SheetHeader>
              <SheetTitle>Menu</SheetTitle>
              <div>
                {menuOptions}
              </div>
            </SheetHeader>
          </SheetContent>
        </Sheet>
      </div>

      <div className="hidden md:inline">
        {menuOptions}
      </div>
    </div>
  )
}

export default SideBar
