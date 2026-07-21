# SkillBridge

**Learn anything. Teach everything.**

SkillBridge is a peer-to-peer skill exchange platform that connects people to trade what they know for what they want to learn — no money involved, just a direct skill-for-skill swap. Members list the skills they can teach and the skills they want to learn, get matched with like-minded people, and coordinate live sessions to learn from each other in real time.

## Features

- **Authentication** — email/password and Google OAuth, with secure password recovery
- **Guided onboarding** — new members set up their skills offered and skills wanted
- **Dashboard** — personalized overview and match suggestions
- **Browse People** — discover other members by the skills they teach or want to learn
- **Profiles** — bio, skills, and achievements
- **Skill swap requests** — send, accept, and manage swap requests with other members
- **Live sessions** — real-time sessions for actually swapping skills
- **Messaging** — direct chat between members
- **Community forum** — ask questions, share answers, and connect around shared interests
- **Notifications** — stay updated on requests, messages, and forum activity
- **Account settings** — manage profile and account preferences

## Tech Stack

- **Framework:** Next.js (App Router) + React + TypeScript
- **Styling:** Tailwind CSS
- **Backend:** Supabase (Postgres, Auth, Row Level Security)
- **Process management:** PM2
- **CI/CD:** GitHub Actions with SSH deploy to a VPS

## Getting Started

### Prerequisites

- Node.js 20+
- A [Supabase](https://supabase.com) project

### Setup

```bash
git clone https://github.com/SkillBridge-Xylem-Group/SkillBridge.git
cd SkillBridge
npm install
```

Create a `.env.local` file in the project root:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# App origin (used for auth redirects, CORS, etc.)
NEXT_PUBLIC_SITE_URL=http://localhost:3000
ALLOWED_ORIGINS=http://localhost:3000

# Feature-specific secrets
SWAP_CHANNEL_SECRET=
GIPHY_API_KEY=
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Other scripts

```bash
npm run build   # production build
npm run start   # run a production build locally
npm run lint    # lint the project
```

## Deployment

The app runs on a VPS behind nginx, managed with PM2, with two environments:

| Environment | Branch    | PM2 process               |
|-------------|-----------|----------------------------|
| Production  | `main`    | `skillbridge-production`   |
| Sandbox     | `develop` | `skillbridge-sandbox`      |

Pushing to `main` or `develop` triggers a GitHub Actions workflow that SSHes into the VPS, pulls the latest code, installs dependencies, builds, and restarts the matching PM2 process.

## Project Structure

```
app/                  Next.js App Router pages & API routes
  dashboard/          Authenticated app (browse people, forum, messages, profile, settings, swap requests, admin)
components/           Shared React components
lib/                  Supabase clients, auth helpers, business logic
deploy.sh             Deployment script run on the VPS
```

## Contributing

- Branch off `develop` for new work, open a PR back into `develop`.
- `develop` is periodically synced into `main` for production releases.
- Avoid force-pushing to `main`/`develop` — it rewrites history that the VPS's local git checkout depends on.
