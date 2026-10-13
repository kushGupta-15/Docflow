import { useRoom, useSelf } from '@liveblocks/react/suspense'
import React, { useEffect, useState } from 'react'
import * as Y from 'yjs';
import { LiveblocksYjsProvider } from '@liveblocks/yjs';
import { Button } from './ui/button';
import { MoonIcon, SunIcon, LockIcon } from 'lucide-react';
import { BlockNoteView } from "@blocknote/shadcn";
import { BlockNoteEditor } from "@blocknote/core";
import { useCreateBlockNote } from "@blocknote/react";

import '@blocknote/core/fonts/inter.css'
import '@blocknote/shadcn/style.css'
import stringToColor from '@/lib/stringToColor';
import AIAssistant from './AIAssistant';
import { useDocRole } from '@/lib/useOwner';

type EditorProps = {
  doc: Y.Doc;
  provider: any;
  darkMode: boolean;
  canEdit?: boolean;
}


function BlockNote({doc, provider, darkMode, canEdit = true}: EditorProps) {
  const userInfo = useSelf((me) => me.info) //liveblocks hook

  const userName = userInfo?.name || userInfo?.email?.split('@')[0] || 'Anonymous';
  const userColor = stringToColor(userInfo?.email || 'anonymous');

  const editor: BlockNoteEditor = useCreateBlockNote({
    collaboration: {
      provider,

      fragment: doc.getXmlFragment('document-store'),

      user: {
        name: userName,
        color: userColor
      }
    }
  })
  return (
    <div className='relative max-w-6xl mx-auto'>
      <BlockNoteView
        className='min-h-screen'
        editor={editor}
        theme={darkMode ? 'dark' : 'light'}
        editable={canEdit}
      />
    </div>
  )
}


function Editor() {

  const room = useRoom() //access room info as we are inside the Doc
  const [doc, setDoc] = useState<Y.Doc>()
  const [provider, setProvider] = useState<LiveblocksYjsProvider>() //connect Yjs to Liveblocks
  const [darkMode, setDarkMode] = useState(false)
  const { canEdit } = useDocRole()

  useEffect(() => {
    const yDoc = new Y.Doc()
    const yProvider = new LiveblocksYjsProvider(room, yDoc)

    setDoc(yDoc)
    setProvider(yProvider)

    return () => {
      yDoc?.destroy()
      yProvider?.destroy()
    }
  }, [room])

  if (!doc || !provider) {
    return null
  }

  const style = `hover:text-white ${
    darkMode
      ? "text-gray-300 bg-gray-700 hover:bg-gray-100 hover:text-gray-700"
      : "text-gray-700 bg-gray-200 hover:bg-gray-300 hover:text-gray-700"
    }`

  return (
    <div className='max-w-6xl mx-auto'>
      {!canEdit && (
        <div className="flex items-center gap-2.5 p-3.5 mb-6 text-sm text-amber-900 bg-amber-50/90 border border-amber-200 rounded-xl shadow-xs">
          <LockIcon className="w-4 h-4 text-amber-700 shrink-0" />
          <span>
            <strong>Read-Only Mode:</strong> You have viewer permissions on this document. Text editing, block alterations, and slash commands are locked.
          </span>
        </div>
      )}

      <div className='flex items-center gap-2 justify-end mb-10'>
        {/* Gemini AI Assistant */}
        <AIAssistant doc={doc} />

        {/* dark mode */}
        <Button className={style} onClick={() => setDarkMode(!darkMode)}>
          {darkMode ? <SunIcon /> : <MoonIcon />}
        </Button>
      </div>
      {/* Blocknote */}
      <BlockNote doc={doc} provider={provider} darkMode={darkMode} canEdit={canEdit} />

    </div>
  )
}

export default Editor
