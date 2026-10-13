'use client'

import { useState, useTransition } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { SparklesIcon, CopyIcon, CheckIcon, LanguagesIcon, BookOpenIcon, Wand2Icon } from 'lucide-react'
import { summarizeDocument, refineGrammar, translateDocument } from '@/actions/geminiActions'
import { toast } from 'sonner'
import * as Y from 'yjs'

interface AIAssistantProps {
  doc?: Y.Doc
}

const LANGUAGES = [
  'Spanish',
  'French',
  'German',
  'Japanese',
  'Chinese (Mandarin)',
  'Hindi',
  'Italian',
  'Portuguese',
  'Korean',
  'Russian',
  'Arabic',
]

function AIAssistant({ doc }: AIAssistantProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'summarize' | 'refine' | 'translate'>('summarize')
  const [selectedLanguage, setSelectedLanguage] = useState('Spanish')
  const [result, setResult] = useState<string>('')
  const [copied, setCopied] = useState(false)
  const [isPending, startTransition] = useTransition()

  // Extract text from Yjs XML Fragment or doc
  const getDocumentText = (): string => {
    if (!doc) return ''
    try {
      const fragment = doc.getXmlFragment('document-store')
      // Extract string representation
      const str = fragment.toString()
      // Strip XML/HTML tags for plain text prompt
      return str.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim() || 'Sample Document: Collaborative workspace document.'
    } catch {
      return 'Sample Document: Collaborative workspace document.'
    }
  }

  const handleAction = () => {
    const text = getDocumentText()
    if (!text) {
      toast.error('The document is empty. Add some text first!')
      return
    }

    startTransition(async () => {
      setResult('')
      let res

      if (activeTab === 'summarize') {
        res = await summarizeDocument(text)
      } else if (activeTab === 'refine') {
        res = await refineGrammar(text)
      } else if (activeTab === 'translate') {
        res = await translateDocument(text, selectedLanguage)
      }

      if (res?.success && res.result) {
        setResult(res.result)
        toast.success(res.isMock ? 'Demo AI response generated!' : 'Gemini AI generated response!')
      } else {
        toast.error(res?.error || 'Failed to process AI request')
      }
    })
  }

  const handleCopy = () => {
    if (!result) return
    navigator.clipboard.writeText(result)
    setCopied(true)
    toast.success('Copied to clipboard!')
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <Button
        asChild
        variant="outline"
        size="sm"
        className="flex items-center gap-1.5 border-purple-300 text-purple-700 hover:bg-purple-50 hover:text-purple-800"
      >
        <DialogTrigger>
          <SparklesIcon className="w-4 h-4 text-purple-600 animate-pulse" />
          <span>Gemini AI</span>
        </DialogTrigger>
      </Button>

      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <SparklesIcon className="w-5 h-5 text-purple-600" />
            <span>Gemini AI Document Intelligence</span>
          </DialogTitle>
          <DialogDescription>
            Summarize, refine grammar, or translate your document content with Google Gemini.
          </DialogDescription>
        </DialogHeader>

        {/* Tab Controls */}
        <div className="flex border-b border-gray-200 mt-2">
          <button
            onClick={() => { setActiveTab('summarize'); setResult(''); }}
            className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              activeTab === 'summarize'
                ? 'border-purple-600 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <BookOpenIcon className="w-4 h-4" />
            <span>Summarize</span>
          </button>

          <button
            onClick={() => { setActiveTab('refine'); setResult(''); }}
            className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              activeTab === 'refine'
                ? 'border-purple-600 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Wand2Icon className="w-4 h-4" />
            <span>Refine Grammar</span>
          </button>

          <button
            onClick={() => { setActiveTab('translate'); setResult(''); }}
            className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              activeTab === 'translate'
                ? 'border-purple-600 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <LanguagesIcon className="w-4 h-4" />
            <span>Translate</span>
          </button>
        </div>

        {/* Tab Action Area */}
        <div className="py-3 space-y-3">
          {activeTab === 'translate' && (
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-gray-600 uppercase">Target Language:</label>
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="border rounded p-1.5 text-sm bg-background"
              >
                {LANGUAGES.map((lang) => (
                  <option key={lang} value={lang}>
                    {lang}
                  </option>
                ))}
              </select>
            </div>
          )}

          <Button
            onClick={handleAction}
            disabled={isPending}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white flex items-center justify-center gap-2"
          >
            <SparklesIcon className="w-4 h-4" />
            {isPending
              ? 'Gemini is thinking...'
              : activeTab === 'summarize'
              ? 'Generate Summary'
              : activeTab === 'refine'
              ? 'Refine Document Writing'
              : `Translate to ${selectedLanguage}`}
          </Button>

          {/* AI Result Box */}
          {result && (
            <div className="relative mt-3 p-3.5 bg-gray-50 border border-gray-200 rounded-md max-h-60 overflow-y-auto">
              <div className="flex justify-between items-center pb-2 mb-2 border-b border-gray-200">
                <span className="text-xs font-bold uppercase tracking-wider text-purple-700">
                  Gemini Result
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopy}
                  className="h-7 px-2 text-xs flex items-center gap-1"
                >
                  {copied ? <CheckIcon className="w-3.5 h-3.5 text-green-600" /> : <CopyIcon className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </Button>
              </div>
              <div className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
                {result}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default AIAssistant
