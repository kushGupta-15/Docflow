'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { useCollection } from 'react-firebase-hooks/firestore'
import { collection, query, doc } from 'firebase/firestore'
import { db } from '@/firebase'
import { createNewDocument } from '@/actions/actions'
import { useDocumentData } from 'react-firebase-hooks/firestore'
import Link from 'next/link'
import {
  FileTextIcon,
  CalendarIcon,
  CompassIcon,
  ListTodoIcon,
  LightbulbIcon,
  SearchIcon,
  PlusIcon,
  ClockIcon,
  SparklesIcon,
  FolderOpenIcon
} from 'lucide-react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { toast } from 'sonner'

interface Template {
  id: string
  title: string
  description: string
  icon: any
  badgeColor: string
}

const TEMPLATES: Template[] = [
  {
    id: 'blank',
    title: 'Blank Document',
    description: 'Start fresh with a blank collaborative page.',
    icon: FileTextIcon,
    badgeColor: 'bg-gray-100 text-gray-700',
  },
  {
    id: 'meeting',
    title: '📝 Meeting Notes',
    description: 'Track agenda, participants, discussion points, and action items.',
    icon: CalendarIcon,
    badgeColor: 'bg-blue-100 text-blue-700',
  },
  {
    id: 'roadmap',
    title: '🚀 Project Roadmap',
    description: 'Map quarterly milestones, target deliverables, and dependencies.',
    icon: CompassIcon,
    badgeColor: 'bg-purple-100 text-purple-700',
  },
  {
    id: 'sprint',
    title: '📋 Sprint Backlog',
    description: 'Plan user stories, task assignments, and sprint estimates.',
    icon: ListTodoIcon,
    badgeColor: 'bg-emerald-100 text-emerald-700',
  },
  {
    id: 'brainstorm',
    title: '💡 Brainstorming Canvas',
    description: 'Organize problem statements, ideation clusters, and next steps.',
    icon: LightbulbIcon,
    badgeColor: 'bg-amber-100 text-amber-700',
  },
]

function DocumentCard({ roomId, role }: { roomId: string; role: string }) {
  const [data, loading] = useDocumentData(doc(db, 'documents', roomId))

  const title = data?.title || 'Untitled Document'

  return (
    <Link
      href={`/doc/${roomId}`}
      className="group block p-4 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md hover:border-gray-300 transition-all"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-gray-50 group-hover:bg-purple-50 rounded-lg text-gray-500 group-hover:text-purple-600 transition-colors">
            <FileTextIcon className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 group-hover:text-purple-700 transition-colors line-clamp-1 text-sm sm:text-base">
              {loading ? 'Loading title...' : title}
            </h4>
            <span
              className={`inline-block mt-0.5 text-xs px-2 py-0.5 rounded-full font-medium capitalize ${
                role === 'owner'
                  ? 'bg-purple-100 text-purple-700'
                  : role === 'editor'
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-blue-100 text-blue-700'
              }`}
            >
              {role}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
        <span className="flex items-center gap-1 font-mono text-[11px] truncate max-w-[150px]">
          ID: {roomId.slice(0, 8)}...
        </span>
        <span className="text-purple-600 font-medium group-hover:underline">
          Open &rarr;
        </span>
      </div>
    </Link>
  )
}

function Dashboard() {
  const { user } = useUser()
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'owner' | 'editor' | 'viewer'>('all')
  const [isCreating, startCreating] = useTransition()

  const userEmail = (user?.primaryEmailAddress?.emailAddress || user?.emailAddresses?.[0]?.emailAddress)?.trim().toLowerCase()
  const firstName = user?.firstName || userEmail?.split('@')[0] || 'User'

  const [roomsSnapshot, loadingRooms] = useCollection(
    userEmail ? query(collection(db, 'users', userEmail, 'rooms')) : null
  )

  const handleCreateFromTemplate = (templateTitle: string) => {
    startCreating(async () => {
      try {
        const { docId } = await createNewDocument(templateTitle)
        toast.success(`Created "${templateTitle}"!`)
        router.push(`/doc/${docId}`)
      } catch (err: any) {
        console.error('Failed to create document:', err)
        toast.error('Could not create document. Please try again.')
      }
    })
  }

  const roomItems = roomsSnapshot?.docs.map((d) => ({
    id: d.id,
    roomId: d.data().roomId || d.id,
    role: d.data().role || 'editor',
  })) || []

  const filteredRooms = roomItems.filter((item) => {
    if (filter !== 'all' && item.role !== filter) return false
    return true
  })

  return (
    <div className="max-w-6xl mx-auto py-4 px-2 sm:px-4 space-y-8">
      {/* Welcome Hero Banner */}
      <div className="bg-gradient-to-r from-purple-700 via-indigo-700 to-blue-700 text-white rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-white/90 text-xs font-semibold backdrop-blur-sm">
              <SparklesIcon className="w-3.5 h-3.5" />
              <span>DocFlow Workspace</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {firstName} 👋
            </h1>
            <p className="text-sm sm:text-base text-purple-100 max-w-xl">
              Create, collaborate, and refine your ideas in real-time with block editing, live cursors, and Gemini AI.
            </p>
          </div>

          <Button
            onClick={() => handleCreateFromTemplate('New Doc')}
            disabled={isCreating}
            className="bg-white text-purple-900 hover:bg-purple-50 font-semibold shadow-md self-start md:self-center"
          >
            <PlusIcon className="w-4 h-4 mr-1.5" />
            {isCreating ? 'Creating...' : 'New Document'}
          </Button>
        </div>
      </div>

      {/* Template Picker Gallery */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Start with a Template</h2>
            <p className="text-xs text-gray-500">Pick a pre-formatted structure or start from scratch</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {TEMPLATES.map((tmpl) => {
            const Icon = tmpl.icon
            return (
              <button
                key={tmpl.id}
                disabled={isCreating}
                onClick={() => handleCreateFromTemplate(tmpl.title)}
                className="flex flex-col text-left p-4 bg-white border border-gray-200 rounded-xl hover:border-purple-300 hover:shadow-md transition-all group disabled:opacity-60"
              >
                <div className="flex items-center justify-between w-full mb-3">
                  <div className="p-2.5 rounded-lg bg-gray-50 group-hover:bg-purple-50 group-hover:text-purple-600 transition-colors">
                    <Icon className="w-5 h-5 text-gray-700 group-hover:text-purple-600" />
                  </div>
                  <span className="text-xs text-gray-400 group-hover:text-purple-600 font-semibold">
                    Use &rarr;
                  </span>
                </div>
                <h3 className="font-semibold text-sm text-gray-900 group-hover:text-purple-700 transition-colors mb-1">
                  {tmpl.title}
                </h3>
                <p className="text-xs text-gray-500 line-clamp-2">
                  {tmpl.description}
                </p>
              </button>
            )
          })}
        </div>
      </section>

      {/* Recent Documents Grid */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ClockIcon className="w-5 h-5 text-gray-500" />
            <h2 className="text-lg font-bold text-gray-900">Recent Documents</h2>
            <span className="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full font-semibold">
              {filteredRooms.length}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Filter Buttons */}
            <div className="inline-flex rounded-lg border border-gray-200 bg-white p-0.5 text-xs">
              {(['all', 'owner', 'editor', 'viewer'] as const).map((opt) => (
                <button
                  key={opt}
                  onClick={() => setFilter(opt)}
                  className={`px-2.5 py-1 rounded-md font-medium capitalize transition-colors ${
                    filter === opt
                      ? 'bg-purple-600 text-white'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        </div>

        {loadingRooms ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 animate-pulse rounded-xl" />
            ))}
          </div>
        ) : filteredRooms.length === 0 ? (
          <div className="p-8 bg-white border border-dashed border-gray-300 rounded-xl text-center space-y-3">
            <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
              <FolderOpenIcon className="w-6 h-6" />
            </div>
            <div>
              <p className="font-semibold text-gray-800 text-sm">No documents found</p>
              <p className="text-xs text-gray-500 mt-0.5">
                {filter !== 'all'
                  ? `You don't have any documents with the "${filter}" role yet.`
                  : 'Get started by creating your first document above.'}
              </p>
            </div>
            <Button
              size="sm"
              onClick={() => handleCreateFromTemplate('New Doc')}
              disabled={isCreating}
              className="mt-2"
            >
              <PlusIcon className="w-4 h-4 mr-1" />
              Create Document
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRooms.map((item) => (
              <DocumentCard key={item.id} roomId={item.roomId} role={item.role} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

export default Dashboard
