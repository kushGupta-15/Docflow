# DocFlow - Collaborative Document Editor & Workspace

A modern, real-time collaborative document editing application and workspace built with Next.js 14, inspired by Notion. Create, edit, collaborate, and leverage Google Gemini AI to summarize, polish, and translate your documents in real time.

---

## ✨ Features

### 🚀 Workspace Dashboard & Templates
- **Interactive Template Gallery**: Instant document scaffolding with pre-built templates:
  - 📝 **Blank Document** - Start fresh with an open canvas.
  - 📋 **Meeting Notes** - Structured agendas, discussion points, action items, and attendee tracking.
  - 🗺️ **Project Roadmap** - Vision milestones, quarterly goals, deliverables, and risk logs.
  - 🏃 **Sprint Backlog** - Sprint goals, user stories, task estimations, and blocker management.
  - 💡 **Brainstorming Canvas** - Problem framing, creative idea dumps, and voting criteria.
- **Recent Documents Grid**: Quick-access document list with real-time room cards, timestamp formatting, and instant role filtering (**All**, **Owner**, **Editor**, **Viewer**).

### 👥 Real-Time Collaboration & Member Management
- **Live Cursors & Typing**: Real-time collaborative block editing powered by Liveblocks and Yjs CRDTs.
- **Presence Avatar Stack**: Dynamic avatar rings showing actively connected users viewing and editing the document in real time.
- **Collaborator Management**: Interactive member dialog displaying all invited users, roles, and timestamps.
- **Role-Based Access Control (RBAC)**:
  - 👑 **Owner**: Full administrative control, ability to invite users, modify permissions, remove collaborators, and permanently delete the document.
  - ✏️ **Editor**: Full read and write editing capabilities in the document workspace.
  - 👁️ **Viewer**: Read-only observation access to prevent unauthorized content modifications.

### 🤖 Gemini AI Document Intelligence
- **Document Summarization**: Extracts key takeaways, highlights, and structural summaries from active document content using Google Gemini.
- **Grammar & Tone Refinement**: Analyzes document clarity, polishes sentence structure, and enhances professional phrasing.
- **Multi-Language Translation**: Translates text across 11 languages (Spanish, French, German, Japanese, Chinese, Hindi, Portuguese, Italian, Russian, Arabic, and Korean).
- **One-Click Clipboard Export**: Copy AI results directly to clipboard or review suggestions side-by-side.
- **Zero-Dependency Native Integration**: Direct REST API integration with graceful mock fallbacks when API keys are unconfigured.

### 🛡️ Production-Grade Security
- **BOLA Vulnerability Prevention**: Server-side authorization checks on all document mutation actions (`deleteDocument`, `inviteUserToRoom`, `removeUserFromRoom`).
- **Liveblocks Auth Hardening**: Locked-down room token endpoint (`/auth-endpoint`) validating explicit user room membership before granting room tokens.
- **Firestore Security Rules**: Declarative security rules (`firestore.rules`) enforcing document ownership and collaborator subcollection isolation.
- **Zero Hardcoded Secrets**: Fully environment-variable-driven Firebase and AI configuration.

---

## 🛠️ Tech Stack

### Frontend & UI
- **Next.js 14** (App Router, Server Actions)
- **React 18** & **TypeScript**
- **Tailwind CSS** - Utility-first styling
- **Shadcn/ui & Radix UI** - Accessible UI components
- **Lucide React** - Modern iconography
- **Sonner** - Toast notifications

### Real-Time & Rich Text
- **Liveblocks** - Real-time presence, storage, and room coordination
- **Yjs** - Conflict-free Replicated Data Types (CRDT) for concurrent editing
- **BlockNote** - Notion-style block-based rich text editor

### Backend & Cloud Services
- **Firebase / Cloud Firestore** - Cloud database for room metadata and user permissions
- **Firebase Admin SDK** - Privileged server-side mutations and role validation
- **Clerk** - Authentication, user session management, and OAuth
- **Google Gemini API** (`gemini-2.5-flash`) - AI summarization, refinement, and translation

---

## 📋 Prerequisites

Before getting started, make sure you have:
- **Node.js**: v18.0.0 or higher (v20+ recommended)
- **npm** or **yarn** / **pnpm**
- A **Clerk** account ([clerk.com](https://clerk.com))
- A **Liveblocks** account ([liveblocks.io](https://liveblocks.io))
- A **Firebase** project with Firestore enabled ([console.firebase.google.com](https://console.firebase.google.com))
- *(Optional)* A **Google Gemini API Key** ([aistudio.google.com](https://aistudio.google.com))

---

## ⚙️ Environment Configuration

Create a `.env` (or `.env.local`) file in the root directory and configure the following variables:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_key_here
CLERK_SECRET_KEY=sk_test_your_clerk_secret_here

# Liveblocks Real-Time Collaboration
NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY=pk_dev_your_liveblocks_key_here
LIVEBLOCKS_PRIVATE_KEY=sk_dev_your_liveblocks_private_key_here

# Firebase Client Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Application URL
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Google Gemini AI (Optional - falls back to built-in simulation if unconfigured)
GEMINI_API_KEY=your_gemini_api_key_here
```

### Firebase Service Account Setup
Download your Firebase Admin SDK service account key from **Project Settings > Service Accounts** in the Firebase Console and place it in the root directory as `service_key.json`:
```
service_key.json
```

---

## 🚀 Getting Started

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd Docflow
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Deploy Firestore Security Rules (Optional but recommended):**
   ```bash
   firebase deploy --only firestore:rules
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) (or the assigned port) in your browser.

5. **Build for production:**
   ```bash
   npm run build
   npm start
   ```

---

## 📁 Project Structure

```
├── actions/
│   ├── actions.ts             # Server actions (document CRUD, member invite & removal)
│   └── geminiActions.ts       # Gemini AI actions (summarization, refinement, translation)
├── app/
│   ├── auth-endpoint/         # Secured Liveblocks session authentication endpoint
│   ├── doc/
│   │   └── [id]/              # Collaborative document workspace page
│   ├── layout.tsx             # Root application layout with Clerk and UI providers
│   ├── page.tsx               # Workspace Dashboard entry point
│   └── globals.css            # Tailwind styles and theme definitions
├── components/
│   ├── AIAssistant.tsx        # Gemini AI modal dialog (Summarize, Polish, Translate)
│   ├── Avatars.tsx            # Live collaborator presence avatar stack
│   ├── Dashboard.tsx          # Workspace dashboard with template gallery & doc grid
│   ├── DeleteDocument.tsx     # Owner-only document deletion modal
│   ├── Document.tsx           # Document header & live editor container
│   ├── Editor.tsx             # BlockNote collaborative rich-text editor
│   ├── InviteUser.tsx         # Collaborator invitation modal with role selection
│   ├── ManageUsers.tsx        # Manage members & revoke collaborator access dialog
│   ├── LiveBlocksProvider.tsx # Liveblocks room provider & context wrapper
│   └── SideBar.tsx            # Navigation sidebar with personal and shared documents
├── firestore.rules            # Production Cloud Firestore Security Rules
├── firebase.ts                # Client-side Firebase initialization (env-based)
├── firebase-admin.ts          # Server-side Firebase Admin SDK initialization
├── types/
│   └── types.ts               # User, room, and custom type definitions
└── README.md                  # Project documentation
```

---

## 🔒 Security Architecture

1. **Broken Object Level Authorization (BOLA) Protection**:
   - `deleteDocument` verifies that the requesting user's email matches the document's `ownerId` in Firestore before deleting.
   - `inviteUserToRoom` verifies that the inviter is the document owner before creating membership records.
   - `removeUserFromRoom` verifies that only the document owner can revoke member access, and prevents removing the owner.

2. **Liveblocks Session Authorization**:
   - `/app/auth-endpoint/route.ts` queries the user's room list (`/users/{email}/rooms/{roomId}`) before authorizing connection.
   - Denies room access immediately if the user is neither the owner nor an invited collaborator.
   - Sets appropriate Liveblocks room permissions based on role (`FULL_ACCESS` for owner/editor, read-only for viewer).

3. **Firestore Security Rules (`firestore.rules`)**:
   - Enforces authentication for all database reads and writes.
   - Restricts document deletion exclusively to `ownerId`.
   - Restricts member modification subcollections to authorized owners.

---

## 📄 License

This project is licensed under the MIT License.
