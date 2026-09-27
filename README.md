# CodeCollab

A real-time collaborative code editor. Multiple users can edit the same file simultaneously, see each other's cursors, and chat — all in the browser.

## Features

- **Conflict-free editing** — Yjs CRDT merges concurrent edits without overwrites
- **Live cursors & presence** — color-coded per user, updates in real time
- **Per-user undo** — Ctrl+Z only undoes your own changes
- **Multiple files per project** — create, switch, and edit files together
- **In-editor chat** — message teammates without leaving the editor
- **Code execution** — run JavaScript in a sandboxed Web Worker with timeout protection
- **Project invites** — share a 24-hour invite link to add members
- **Offline resilience** — changes sync automatically on reconnect

## Tech Stack

**Client** — React 19, CodeMirror 6, Yjs, Socket.io-client, Tailwind CSS, Vite

**Server** — Node.js, Express 5, Socket.io, Yjs, Mongoose, JWT (access + refresh tokens), bcrypt

**Database** — MongoDB (Atlas)

## Getting Started

### Prerequisites

- Node.js 18+
- A MongoDB Atlas cluster (or local MongoDB)

### 1. Clone & install

```bash
git clone <repo-url>
cd CodeCollab

cd server && npm install
cd ../client && npm install
```

### 2. Configure environment variables

**`server/.env`**
```env
PORT=5000
DB_URL=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/?appName=Cluster0
ACCESS_SECRET=your_access_secret
REFRESH_SECRET=your_refresh_secret
CLIENT_URL=http://localhost:5173
```

**`client/.env`**
```env
VITE_API_URL=http://localhost:5000
```

### 3. Run

```bash
# Terminal 1 — server
cd server && npm start

# Terminal 2 — client
cd client && npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## How Collaboration Works

Each project has a single Yjs document on the server containing all files as `Y.Text`. When a user edits, only the incremental CRDT update is sent over Socket.io — not the full document. Yjs merges updates from all clients without conflicts. The server persists the binary Yjs state to MongoDB every 2 seconds and reconstructs it on reconnect.

## Project Structure

```
CodeCollab/
├── client/src/
│   ├── pages/            # Login, Register, Dashboard, Project, Invite
│   ├── components/       # CodeEditor (CodeMirror + Yjs binding)
│   └── collab.js         # useProjectRoom() — shared Yjs + socket state
└── server/
    ├── socket/           # Real-time event handling
    ├── services/         # Auth, project, and collab logic
    ├── routes/           # REST API (users, projects)
    └── model/            # User, Project, Message schemas
```
