# DocFlow - Collaborative Document Editor

A modern, real-time collaborative document editing application built with Next.js, inspired by Notion. Create, edit, and share documents with seamless real-time collaboration features.

## Features

- **Real-time Collaboration**: Multiple users can edit documents simultaneously with live cursor tracking
- **Rich Text Editor**: Powerful block-based editor with formatting capabilities
- **Document Management**: Create, edit, delete, and organize documents
- **User Invitations**: Share documents with collaborators via email
- **Role-based Access**: Owner and Editor permissions with different capabilities
- **Live Cursors**: See other users' cursor positions in real-time with color-coded indicators
- **Dark Mode**: Toggle between light and dark themes
- **Responsive Design**: Mobile-friendly interface with collapsible sidebar
- **Secure Authentication**: OAuth-based authentication with Clerk

## Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **React 18** - UI library with TypeScript
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn/ui** - Modern component library
- **Framer Motion** - Smooth animations

### Real-time Collaboration
- **Liveblocks** - Real-time collaboration platform
- **Yjs** - Conflict-free replicated data types (CRDT)
- **BlockNote** - Modern block-based rich text editor

### Backend & Database
- **Firebase/Firestore** - NoSQL database and backend services
- **Firebase Admin SDK** - Server-side operations
- **Clerk** - Authentication and user management

### Additional Libraries
- **Lucide React** - Beautiful icons
- **React Firebase Hooks** - Firebase integration hooks
- **Sonner** - Toast notifications

## Prerequisites

Before you begin, ensure you have:
- Node.js 18+ installed
- npm or yarn package manager
- Firebase project set up
- Clerk account for authentication
- Liveblocks account for real-time features

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd notion-clone
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   # Clerk Authentication
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
   CLERK_SECRET_KEY=sk_test_your_secret_here
   
   # Liveblocks Real-time Collaboration
   NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY=pk_dev_your_key_here
   LIVEBLOCKS_PRIVATE_KEY=sk_dev_your_secret_here
   
   # Application URL
   NEXT_PUBLIC_BASE_URL=http://localhost:3000
   ```

4. **Set up Firebase**
   
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Firestore Database
   - Download the service account key and save it as `service_key.json` in the root directory
   - Update the Firebase configuration in `firebase.ts` with your project details

5. **Configure Clerk**
   
   - Create a Clerk application at [Clerk Dashboard](https://dashboard.clerk.com/)
   - Configure OAuth providers (Google, GitHub, etc.)
   - Add your domain to allowed origins

6. **Set up Liveblocks**
   
   - Create a Liveblocks project at [Liveblocks Dashboard](https://liveblocks.io/dashboard)
   - Get your public and secret keys
   - Configure authentication endpoint

## Running the Application

1. **Development mode**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

2. **Production build**
   ```bash
   npm run build
   npm start
   ```

3. **Linting**
   ```bash
   npm run lint
   ```

## 📁 Project Structure

```
├── app/                          # Next.js App Router
│   ├── layout.tsx               # Root layout with providers
│   ├── page.tsx                 # Home page
│   ├── auth-endpoint/           # Liveblocks authentication
│   └── doc/[id]/                # Dynamic document pages
├── components/                   # React components
│   ├── Document.tsx             # Document container
│   ├── Editor.tsx               # Rich text editor
│   ├── SideBar.tsx              # Document navigation
│   ├── LiveBlocksProvider.tsx   # Real-time provider
│   └── ui/                      # UI components
├── actions/                      # Server actions
│   └── actions.ts               # Document CRUD operations
├── lib/                          # Utilities and hooks
├── firebase.ts                   # Firebase configuration
├── firebase-admin.ts            # Firebase admin setup
└── middleware.ts                # Authentication middleware
```

## 🔧 Configuration

### Firebase Setup
1. Create a Firestore database in production mode
2. Set up the following collections structure:
   ```
   documents/
     {docId}/
       - title: string
       - createdAt: timestamp
   
   users/
     {userEmail}/
       rooms/
         {roomId}/
           - userId: string
           - role: 'owner' | 'editor'
           - createdAt: timestamp
           - roomId: string
   ```

### Clerk Configuration
- Configure OAuth providers in Clerk dashboard
- Set up webhook endpoints if needed
- Configure session settings and security options

### Liveblocks Setup
- Create rooms for document collaboration
- Configure authentication endpoint at `/auth-endpoint`
- Set up presence and storage schemas



