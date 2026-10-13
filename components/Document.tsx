'use client'

import { FormEvent, useEffect, useMemo, useState, useTransition } from "react"
import { Input } from "./ui/input"
import { Button } from "./ui/button"
import { doc } from "firebase/firestore"
import { db } from "@/firebase"
import { useDocumentData } from "react-firebase-hooks/firestore"
import Editor from "./Editor"
import useOwner from "../lib/useOwner"
import DeleteDocument from "./DeleteDocument"
import InviteUser from "./InviteUser"
import ManageUsers from "./ManageUsers"
import Avatars from "./Avatars"
import { updateDocumentTitle } from "@/actions/actions"
import { toast } from "sonner"
import { useUser } from "@clerk/nextjs"

function Document({id}:  {id: string}) {
  const docRef = useMemo(() => doc(db, 'documents', id), [id])
  const [data, loading, error] = useDocumentData(docRef)

  const [input, setInput] = useState('')
  const [isUpdating, startTransition] = useTransition()

  const { user } = useUser()
  const isOwnerHook = useOwner()

  const currentUserEmail = (user?.primaryEmailAddress?.emailAddress || user?.emailAddresses?.[0]?.emailAddress)?.trim().toLowerCase()
  const isOwner = Boolean(
    isOwnerHook ||
    (data?.ownerId && currentUserEmail && data.ownerId.trim().toLowerCase() === currentUserEmail)
  )

  useEffect(() => {
    if (data?.title) {
      setInput(data.title)
    }
  }, [data])

  const updateTitle = (e: FormEvent) => {
    e.preventDefault()

    if (input.trim()) {
      startTransition(async () => {
        const res = await updateDocumentTitle(id, input.trim())
        if (res.success) {
          toast.success("Document title updated!")
        } else {
          toast.error(res.error || "Failed to update title")
        }
      })
    }
  }

  return (
    <div className="flex-1 h-full bg-white">
      <div className="flex flex-col sm:flex-row max-w-6xl mx-auto justify-between items-center gap-3 p-5">
        <form className="flex space-x-2 flex-1 w-full" onSubmit={updateTitle}>
          {/* Update title */}
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Document title"
          />

          <Button disabled={isUpdating} type="submit">
            {isUpdating ? 'Updating' : 'Update'}
          </Button>
        </form>

        {/* If owner, render invite and delete actions OUTSIDE the title form */}
        {isOwner && (
          <div className="flex items-center space-x-2 shrink-0">
            <InviteUser />
            <DeleteDocument />
          </div>
        )}
      </div>
      <div className="flex max-w-6xl mx-auto justify-between items-center px-5 pb-4">
        {/* Manage User */}
        <ManageUsers />
        {/* Live Avatars */}
        <Avatars />
      </div>

      <hr className="pb-10"/>

      {/* Collaborative Editor */}
      <Editor />

    </div>
  )
}

export default Document
