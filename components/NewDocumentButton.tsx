'use client'

import { useTransition } from 'react'
import { Button } from './ui/button'
import { useRouter } from 'next/navigation'
import { createNewDocument } from '@/actions/actions'
import { toast } from 'sonner'

function NewDocumentButton() {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleCreateNewDocument = () => {
    startTransition(async () => {
      try {
        console.log('Creating new document...');
        const {docId} = await createNewDocument()
        console.log('Document created, navigating to:', docId);
        toast.success("Document created successfully!")
        router.push(`/doc/${docId}`)
        // Force a refresh to ensure sidebar updates
        router.refresh()
      } catch (error: any) {
        console.error('Error creating document:', error);
        toast.error(error.message || "Failed to create document");
      }
    })
  }
  return (
    <Button onClick={handleCreateNewDocument} disabled={isPending}>
      {isPending ? "Creating..." : "New Document"}
    </Button>
  )
}

export default NewDocumentButton
