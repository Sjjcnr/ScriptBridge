# ScriptBridge

ScriptBridge is a marketplace platform that connects clients who need **real, human handwritten content** with skilled **physical writers**. Think of it as Fiverr — but exclusively for handwritten work. Writers offer their penmanship as a professional service, and clients hire them for letters, invitations, journals, notes, assignments, and more.

The platform is built on a **mandatory physical handoff model** — every single order requires the client to personally hand over a notebook or writing material to the writer before any work begins. 

## Features
- **Browse & Search:** Discover verified physical writers in your city.
- **Roles:** Separate client and writer accounts with a unified login system.
- **Physical Handoff Tracking:** An order status progression specifically designed around real-world physical handoffs (Draft -> Pending Handoff -> In Progress -> Ready for Return -> Completed).
- **In-Person Payment:** Payment occurs natively offline via Cash or UPI during the final return meeting.

## Tech Stack
- **Frontend:** Next.js 14, Tailwind CSS v4, Framer Motion, shadcn/ui
- **Backend:** Express, Node.js (with TypeScript)
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth with custom PostgreSQL Triggers for automatic user profile generation based on signup roles.

## Running Locally

### 1. Database Setup
Make sure you have a Supabase project created.
Link the Supabase project and apply migrations:
```bash
# In the `server` directory
npm run migrate
```

### 2. Frontend
```bash
cd frontend
npm install
npm run dev
# The frontend will start on http://localhost:3000 (or 3001 if 3000 is occupied).
```

### 3. Backend Server
```bash
cd server
npm install
npm run dev
# The server will start on http://localhost:3002
```

## Deployment
- The **frontend** is designed to be easily deployed on Vercel. 
- The **backend** should be deployed on a platform like Render or Railway.
- **Database** is hosted on Supabase.
