<div align="center">

# 📄 DocFlow

### Enterprise-Grade Collaborative Workspace & Document Editor

[![Next.js 14](https://img.shields.io/badge/Next.js-14.2.5-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React 18](https://img.shields.io/badge/React-18-blue?style=for-the-badge&logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Firebase](https://img.shields.io/badge/Firebase-Firestore-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com/)
[![Liveblocks](https://img.shields.io/badge/Liveblocks-Real--Time-red?style=for-the-badge&logo=liveblocks&logoColor=white)](https://liveblocks.io/)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini-2.5_Flash-8E75B2?style=for-the-badge&logo=google-gemini&logoColor=white)](https://ai.google.dev/)
[![Clerk Auth](https://img.shields.io/badge/Clerk-Authentication-6C47FF?style=for-the-badge&logo=clerk&logoColor=white)](https://clerk.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

<p align="center">
  A fast, secure, Notion-inspired collaborative document editor. Built with Next.js 14 App Router, Yjs CRDTs, Liveblocks multi-user presence, Cloud Firestore, Clerk authentication, and Google Gemini AI document intelligence.
</p>

[Explore Architecture](#-system-architecture) • [Key Features](#-key-features) • [Quick Start](#-getting-started) • [Security & RBAC](#-security--authorization) • [Deployment](#-deployment)

---

</div>

## 📖 Overview

**DocFlow** is a modern document editing environment engineered for seamless real-time teamwork. Combining the power of block-based rich text editing with conflict-free concurrent synchronization (CRDTs), live multi-cursor presence, and built-in AI document intelligence, DocFlow transforms traditional document authoring into an intuitive and interactive workspace.

---

## 🏛️ System Architecture

```mermaid
flowchart TD
    subgraph Client["Client Tier (Browser)"]
        UI["Next.js 14 App Router UI"]
        BlockNote["BlockNote Rich Text Editor (Yjs CRDT)"]
        Avatars["Liveblocks Presence & Avatars"]
        AIAssistant["Gemini AI Assistant Modal"]
    end

    subgraph AuthTier["Authentication & Identity"]
        Clerk["Clerk Authentication (OAuth / JWT)"]
    end

    subgraph AppServer["Next.js Server Tier"]
        ServerActions["Server Actions (actions.ts)"]
        AuthEndpoint["Auth Endpoint (/app/auth-endpoint)"]
        GeminiService["Gemini AI Gateway (geminiActions.ts)"]
    end

    subgraph RealTimeTier["Real-Time Engine"]
        LiveblocksCloud["Liveblocks Cloud (Rooms, Presence, Storage)"]
    end

    subgraph DatabaseTier["Database & Cloud Services"]
        Firestore["Google Cloud Firestore (Documents & Rooms)"]
        FirebaseAdmin["Firebase Admin SDK"]
        GeminiAPI["Google Gemini 2.5 Flash API"]
    end

    UI --> Clerk
    UI --> BlockNote
    UI --> Avatars
    UI --> AIAssistant

    BlockNote <-->|"Yjs WebSockets"| LiveblocksCloud
    Avatars <-->|"Presence WebSockets"| LiveblocksCloud

    UI -->|"Mutations & RPC"| ServerActions
    Avatars -->|"Authorize Room Token"| AuthEndpoint
    AIAssistant -->|"Process Document Text"| GeminiService

    AuthEndpoint -->|"Validate Role"| FirebaseAdmin
    AuthEndpoint -->|"Issue Session Token"| LiveblocksCloud

    ServerActions -->|"Privileged CRUD"| FirebaseAdmin
    FirebaseAdmin -->|"Read / Write Records"| Firestore
    UI <-->|"Realtime Snapshot Listeners"| Firestore

    GeminiService -->|"REST API Calls"| GeminiAPI
```

---

## ✨ Key Features

### 🚀 Workspace Dashboard & Scaffolding
- **Curated Template Gallery**: Kickstart new docs in one click with pre-formatted structures:
  - 📝 **Blank Document** — Minimalist open canvas.
  - 📋 **Meeting Notes** — Agendas, attendee logs, discussion notes, and action items.
  - 🗺️ **Project Roadmap** — Vision, key milestones, deliverables, and risk matrices.
  - 🏃 **Sprint Backlog** — Sprint goals, user stories, estimations, and blocker tracking.
  - 💡 **Brainstorming Canvas** — Problem framing, creative idea dumps, and voting criteria.
- **Recent Documents Grid**: Quick-access document cards featuring real-time room names, relative timestamps, and one-click role filtering (**All**, **Created by Me**, **Can Edit**, **Read Only**).

### 👥 Real-Time Collaboration & Member Management
- **Concurrent Block Editing**: Conflict-free collaborative text editing powered by **Liveblocks** and **Yjs** CRDTs.
- **Live Presence Avatars**: Floating avatar stack in the document header showing actively connected teammates with online status indicators and tooltips.
- **Collaborator Management Modal**: View all active members, inspect their roles, and revoke collaborator access with one click (owner-only).
- **Three-Tier Role-Based Access Control (RBAC)**:
  - 👑 **Owner**: Full administrative control, user invitations, role modifications, and permanent deletion.
  - ✏️ **Editor**: Full read and write capabilities across document content and titles.
  - 👁️ **Viewer**: Read-only observation access preventing unauthorized alterations.

### 🤖 Gemini AI Document Intelligence
- **Document Summarization**: Instantly generates an executive summary, core takeaways, and action items from live document content.
- **Grammar & Tone Refinement**: Polishes sentence structure, clarity, and professional style while preserving original meaning.
- **Multi-Language Translation**: Real-time translation supporting **11 languages** (*Spanish, French, German, Japanese, Chinese, Hindi, Portuguese, Italian, Russian, Arabic, Korean*).
- **One-Click Export**: Copy polished AI outputs directly to your clipboard or review suggestions side-by-side.

### 🛡️ Hardened Security Architecture
- **Broken Object Level Authorization (BOLA) Protection**: Server-side permission validation on all sensitive actions (`deleteDocument`, `inviteUserToRoom`, `removeUserFromRoom`, `updateDocumentTitle`).
- **Liveblocks Token Lockdown**: The `/app/auth-endpoint` verifies explicit membership in Cloud Firestore before issuing room access tokens.
- **Production-Grade Firestore Rules**: Granular database security rules enforcing document isolation and role boundaries.
- **Node 26 Compatibility**: Hardened server runtime with automated polyfills for legacy cryptographic libraries.

---

## 🛠️ Tech Stack

| Domain | Technology | Purpose |
| :--- | :--- | :--- |
| **Framework** | [Next.js 14](https://nextjs.org/) | App Router, Server Actions, React Server Components |
| **Language** | [TypeScript](https://www.typescriptlang.org/) | Type-safe development across client and server |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) & [Shadcn UI](https://ui.shadcn.com/) | Responsive, modern, and accessible design system |
| **Rich Text Editor** | [BlockNote](https://www.blocknotejs.org/) | Notion-like block-based editing |
| **Real-Time Sync** | [Liveblocks](https://liveblocks.io/) & [Yjs](https://yjs.dev/) | WebSockets, CRDTs, presence avatars, multi-cursor tracking |
| **Database** | [Google Cloud Firestore](https://firebase.google.com/docs/firestore) | Real-time NoSQL document & room metadata storage |
| **Admin Operations** | [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup) | Privileged server-side mutations and role validation |
| **Authentication** | [Clerk](https://clerk.com/) | OAuth login, session tokens, user profile management |
| **Artificial Intelligence** | [Google Gemini 2.5 Flash](https://ai.google.dev/) | In-editor summarization, grammar refinement, and translation |
| **Hosting & CI/CD** | [Vercel](https://vercel.com/) | Edge deployment, serverless functions, automatic Git previews |

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed:
- [Node.js](https://nodejs.org/) v18.0.0 or later (v20+ recommended)
- [npm](https://www.npmjs.com/), [yarn](https://yarnpkg.com/), or [pnpm](https://pnpm.io/)
- A [Clerk](https://clerk.com/) Account
- A [Liveblocks](https://liveblocks.io/) Account
- A [Firebase](https://console.firebase.google.com/) Project with Firestore enabled
- *(Optional)* A [Google AI Studio](https://aistudio.google.com/) API Key for Gemini AI

---

### Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/kushGupta-15/Docflow.git
   cd Docflow
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the root directory:
   ```env
   # Clerk Authentication
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_publishable_key
   CLERK_SECRET_KEY=sk_test_your_clerk_secret_key

   # Liveblocks Real-time Collaboration
   NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY=pk_dev_your_liveblocks_public_key
   LIVEBLOCKS_PRIVATE_KEY=sk_dev_your_liveblocks_private_key

   # Application URL
   NEXT_PUBLIC_BASE_URL=http://localhost:3000

   # Firebase Client Configuration
   NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id
   NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id

   # Firebase Admin Configuration (Server-side)
   FIREBASE_PROJECT_ID=your_project_id
   FIREBASE_CLIENT_EMAIL=your_service_account_email
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

   # Google Gemini AI (Optional - falls back to built-in simulation if unconfigured)
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

   > [!TIP]
   > For local development, you can place your downloaded Firebase Service Account JSON file as `service_key.json` in the root directory. It is automatically ignored by Git.

4. **Deploy Firestore Security Rules:**
   ```bash
   firebase deploy --only firestore:rules
   ```

5. **Start the local development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔒 Security & Authorization

DocFlow follows the principle of least privilege with layered defenses:

1. **Server Actions Authorization (`actions/actions.ts`)**:
   - `createNewDocument`: Requires an authenticated Clerk session; automatically creates owner metadata.
   - `updateDocumentTitle`: Verifies the requesting user holds an `owner` or `editor` role before modifying Firestore.
   - `inviteUserToRoom`: Strictly verifies that the inviter is the registered document `owner`.
   - `removeUserFromRoom`: Restricts collaborator revocation to document owners only; prevents owner self-removal.
   - `deleteDocument`: Restricts deletion exclusively to the document owner; cascades cleanup across collaborator subcollections.

2. **Liveblocks Token Gating (`/app/auth-endpoint/route.ts`)**:
   - Every connection to a Liveblocks room requires a signed session token.
   - The endpoint checks the user's room list (`/users/{email}/rooms/{roomId}`) or the document's users subcollection before admitting the user.
   - Grants `FULL_ACCESS` to owners and editors, while restricting viewers to read-only mode.

3. **Cloud Firestore Rules (`firestore.rules`)**:
   - Declaratively restricts access to valid room members.
   - Protects immutable timestamps and owner identifiers from tampering.

---

## 🌐 Deployment

### Deploying to Vercel

The fastest way to deploy DocFlow is with [Vercel](https://vercel.com/):

1. **Push your code to GitHub.**
2. **Import the repository into Vercel.**
3. **Configure the Environment Variables** in the Vercel Project Settings matching your `.env`.
4. **Deploy!**

Alternatively, deploy directly using the Vercel CLI:
```bash
npx vercel --prod
```

---

## 📄 License

Distributed under the MIT License. See [LICENSE](LICENSE) for more information.

---

<div align="center">
  <sub>Built with ❤️ by Kush Gupta</sub>
</div>
