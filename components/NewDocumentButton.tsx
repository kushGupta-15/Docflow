'use client'

import { useTransition } from 'react'
import { Button } from './ui/button'
import { useRouter } from 'next/navigation'
import { createNewDocument } from '@/actions/actions'

function NewDocumentButton() {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleCreateNewDocument = () => {
    startTransition(async () => {
      try {
        console.log('Creating new document...');
        const {docId} = await createNewDocument()
        console.log('Document created, navigating to:', docId);
        router.push(`/doc/${docId}`)
        // Force a refresh to ensure sidebar updates
        router.refresh()
      } catch (error) {
        console.error('Error creating document:', error);
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
