'use client'

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { FormEvent, useState, useTransition } from "react"
import { Button } from "./ui/button"
import { usePathname, useRouter } from "next/navigation"
import { deleteDocument, inviteUserToRoom } from "@/actions/actions"
import { toast } from "sonner"
import { Input } from "./ui/input"


function InviteUser() {
  const [isOpen, setIsOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<'editor' | 'viewer'>('editor')

  const pathname = usePathname()
  const router = useRouter()

  const handleInvite = async (e: FormEvent) => {
    e.preventDefault()

    const roomId = pathname.split('/').pop()

    if (!roomId) return

    startTransition(async () => {
      const result = await inviteUserToRoom(roomId, email, role)

      if (result.success) {
        setIsOpen(false);
        setEmail('')
        toast.success(`User invited as ${role} successfully!`);
      } else {
        toast.error((result as any).error || "Failed to invite user!");
      }
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <Button asChild variant='outline'>
        <DialogTrigger>Invite</DialogTrigger>
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite Collaborator</DialogTitle>
          <DialogDescription>
            Invite another user to access this document via email.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleInvite} className="flex flex-col gap-3">
          <Input
            type="email"
            placeholder="Collaborator Email"
            className="w-full"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <span className="font-medium">Permission:</span>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as 'editor' | 'viewer')}
              className="border rounded p-1 text-sm bg-background"
            >
              <option value="editor">Editor (Can edit)</option>
              <option value="viewer">Viewer (Read only)</option>
            </select>
          </div>
          <Button type="submit" disabled={!email || isPending} className="mt-2">
            {isPending ? "Inviting..." : `Invite as ${role === 'editor' ? 'Editor' : 'Viewer'}`}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default InviteUser
