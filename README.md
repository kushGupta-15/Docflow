# 📘 DocFlow

A Notion-style collaborative document editor built with Next.js and TypeScript.  
Supports real-time editing, cloud storage, AI-powered summaries, and document-based Q&A.

---

## 🚀 Features

- Real-time collaboration using Liveblocks
- Cloud storage powered by Cloudflare
- AI document summary generation (multi-language support)
- Ask questions based on document content
- Rich text editing with modern UI
- Secure authentication

---

## 📦 Installation & Setup

```bash
# Clone the repository
git clone https://github.com/kushGupta-15/docflow.git
cd docflow

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY=
LIVEBLOCKS_PRIVATE_KEY=

NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Run development server
npm run dev
```