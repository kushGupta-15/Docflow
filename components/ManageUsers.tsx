'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useCallback, useEffect, useState, useTransition } from "react"
import { Button } from "./ui/button"
import { usePathname } from "next/navigation"
import { getRoomUsers, removeUserFromRoom } from "@/actions/actions"
import { toast } from "sonner"
import useOwner from "@/lib/useOwner"
import { useUser } from "@clerk/nextjs"
import { UsersIcon, Trash2Icon } from "lucide-react"
import { DocumentRole } from "@/types/types"

interface Member {
  email: string
  role: DocumentRole
  invitedBy?: string
}

function ManageUsers() {
  const [isOpen, setIsOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [members, setMembers] = useState<Member[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const pathname = usePathname()
  const roomId = pathname.split('/').pop()
  const isOwner = useOwner()
  const { user } = useUser()
  const currentUserEmail = (user?.primaryEmailAddress?.emailAddress || user?.emailAddresses?.[0]?.emailAddress)?.trim().toLowerCase()

  const loadMembers = useCallback(async () => {
    if (!roomId) return
    setIsLoading(true)
    try {
      const result = await getRoomUsers(roomId)
      if (result.success && result.users) {
        setMembers(result.users)
      }
    } catch (err) {
      console.error("Failed to fetch room members:", err)
    } finally {
      setIsLoading(false)
    }
  }, [roomId])

  useEffect(() => {
    if (isOpen) {
      loadMembers()
    }
  }, [isOpen, loadMembers])

  const handleRemove = (targetEmail: string) => {
    if (!roomId) return

    startTransition(async () => {
      const result = await removeUserFromRoom(roomId, targetEmail)
      if (result.success) {
        toast.success(`Removed ${targetEmail} from document`)
        setMembers((prev) => prev.filter((m) => m.email.toLowerCase() !== targetEmail.toLowerCase()))
      } else {
        toast.error((result as any).error || "Failed to remove member")
      }
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" type="button" className="flex items-center gap-1.5">
          <UsersIcon className="w-4 h-4" />
          <span>Members</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UsersIcon className="w-5 h-5" />
            <span>Document Members</span>
          </DialogTitle>
          <DialogDescription>
            View everyone with access to this document and manage roles.
          </DialogDescription>
        </DialogHeader>

        <div className="py-2">
          {isLoading ? (
            <p className="text-sm text-gray-500 py-4 text-center">Loading collaborators...</p>
          ) : members.length === 0 ? (
            <p className="text-sm text-gray-500 py-4 text-center">No other members in this room.</p>
          ) : (
            <div className="divide-y divide-gray-100 max-h-72 overflow-y-auto">
              {members.map((member) => {
                const isMemberSelf = member.email.toLowerCase() === currentUserEmail
                const isMemberOwner = member.role === 'owner'

                return (
                  <div
                    key={member.email}
                    className="flex items-center justify-between py-2.5 px-1 hover:bg-gray-50 rounded"
                  >
                    <div className="flex flex-col min-w-0 pr-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-medium text-gray-900 truncate">
                          {member.email}
                        </span>
                        {isMemberSelf && (
                          <span className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded font-normal">
                            You
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-gray-400 capitalize">
                        {member.role}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-semibold capitalize ${
                          member.role === 'owner'
                            ? 'bg-purple-100 text-purple-700'
                            : member.role === 'editor'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {member.role}
                      </span>

                      {isOwner && !isMemberOwner && !isMemberSelf && (
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={isPending}
                          onClick={() => handleRemove(member.email)}
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                          title="Revoke access"
                        >
                          <Trash2Icon className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default ManageUsers
