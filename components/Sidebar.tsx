"use client";
import React, { useEffect, useState } from "react";
import NewButton from "./NewButton";
import { useCollection } from "react-firebase-hooks/firestore";
import { useUser } from "@clerk/nextjs";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { MenuIcon } from "lucide-react"
import { collectionGroup, query, where } from "firebase/firestore";
import { db } from "@/firebase";
import { DocumentData } from "firebase-admin/firestore";
import SidebarOptions from "@/components/SidebarOptions";
import { useClerk } from "@clerk/nextjs";

function SideBar() {
//   // Type definition for room document
  interface Roomdoc extends DocumentData {
    UserId: string;
    CreatedAt: string;
    role: "Owner" | "editor";
    roomId: string;
  }

  const [groupedData, setGroupedData] = useState<{
    owner: Roomdoc[];
    editor: Roomdoc[];
  }>({
    owner: [],
    editor: [],
  });

  const { isLoaded, isSignedIn, user } = useUser();


  const [data, loading, error] = useCollection(
    user &&
      query(
        collectionGroup(db, "rooms"),
        where("UserId", "==", user?.emailAddresses[0].toString())
      )
  );
//   console.log("ouput : ",user?.emailAddresses[0].emailAddress)
  useEffect(() => {
    if (!data) return;

    const groupData = data.docs.reduce<{
      owner: Roomdoc[];
      editor: Roomdoc[];
    }>(
      (acc, curr) => {
        const roomData = curr.data() as Roomdoc;
        if (roomData.role === "Owner") {
          acc.owner.push({ id: curr.id, ...roomData });
        } else {
          acc.editor.push({ id: curr.id, ...roomData });
        }
        return acc;
      },
      {
        owner: [],
        editor: [],
      }
    );

    setGroupedData(groupData);
  }, [data]);

  const menuOptions = (
    <>
      <NewButton />
      <div className="flex py-4 flex-col space-y-4 md:max-w-36">
        {loading ? (
          <div>Loading...</div>
        ) : error ? (
          <div>Error: {error.message}</div>
        ) : data?.docs.length === 0 ? (
          <div>
            <h2 className="text-gray-400 text-sm font-semibold">
              Document Not Found!
            </h2>
          </div>
        ) : (
          <>
            <h2 className="text-gray-500 text-bold text-sm">My Documents</h2>
            {groupedData.owner.map((doc) => (
              <SidebarOptions
                key={doc.id}
                href={`/doc/${doc.id}`}
                id={doc.id}
              />
            ))}
            {groupedData.editor.length > 0 && (
              <>
                <h2 className="text-gray-500 text-bold text-sm">
                  Shared with Me
                </h2>
                {groupedData.editor.map((doc) => (
                  <SidebarOptions
                    key={doc.id}
                    href={`/doc/${doc.id}`}
                    id={doc.id}
                  />
                ))}
              </>
            )}
          </>
        )}
      </div>
    </>
  );

  return (
    <div className="p-2 md:p-5 bg-gray-200 relative">
      <div className="md:hidden">
        <Sheet>
          <SheetTrigger>
            <MenuIcon className="p-2 hover:opacity-30 rounded-lg" size={40} />
          </SheetTrigger>
          <SheetContent side="left">
            <SheetHeader>
              <SheetTitle>Menu</SheetTitle>
              <div>{menuOptions}</div>
            </SheetHeader>
          </SheetContent>
        </Sheet>
      </div>
    <div className="hidden md:inline">{menuOptions}</div>
    </div>
  );
}

export default SideBar;