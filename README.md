# ITP Cybersec — Operation Flagfall

**Operation Flagfall** is a cybersecurity Capture The Flag (CTF) platform developed for the ITP Cybersec community. It provides a central place for participants to explore challenges, submit flags, and track their progress during cybersecurity competitions.

🌐 **Live platform:** https://i-tp-cybersec.vercel.app  
🔗 **Backend API:** https://operation-flagfall-api.onrender.com

---

## Overview

The platform is built with a separate frontend and backend:

| Component | Technology | Deployment |
|---|---|---|
| Frontend | React + Vite | Vercel |
| Backend API | Django + Django REST Framework | Render |
| Database | PostgreSQL (Supabase) | Supabase |

The backend is the authority for authentication, challenge data, flag validation, and scoring. The frontend communicates with the backend API and does not contain challenge flags or validate submissions locally.

## Features

- Participant registration and login using JWT authentication
- Challenge listing and challenge detail pages
- Challenge categories:
  - Web Exploitation
  - Cryptography
  - Digital Forensics
  - Miscellaneous
- Flag submission with server-side validation
- Solve tracking and points awarded for correct submissions
- Participant progress and challenge statistics
- Django administration for managing challenges

## Architecture

```text
Participant
    |
    v
React + Vite frontend (Vercel)
    |
    | HTTPS / REST API + JWT
    v
Django REST API (Render)
    |
    | PostgreSQL connection
    v
Supabase PostgreSQL
```

Django is the single authentication authority. Supabase Auth is not used by the application. Challenge flags are stored as keyed hashes and checked by the backend; raw flags must never be exposed in frontend code or API responses.

## Getting Started

### Prerequisites

- Node.js (LTS recommended)
- npm
- Git

### 1. Clone the repository

```bash
git clone https://github.com/gb8462/iTP-Cybersec.git
cd iTP-Cybersec
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure the backend API URL

The frontend must point to a running Operation Flagfall backend.

If the project uses a Vite environment variable for the API base URL, create a `.env` file in the project root using the variable name expected by the source code. Do not commit secrets or private environment files.

The production backend is:

```text
https://operation-flagfall-api.onrender.com
```

### 4. Start the development server

```bash
npm run dev
```

Vite will print the local development URL in the terminal (commonly `http://localhost:5173`).

### 5. Create a production build

```bash
npm run build
```

To preview the production build locally:

```bash
npm run preview
```

## Related Repository

The Django backend is maintained separately:

- **Backend repository:** https://github.com/gb8462/iTP-Cybersec_Backend

Backend setup, environment variables, database configuration, and deployment instructions belong in that repository's README.

## Security Notes

- Never commit `.env` files, database credentials, Django secret keys, JWT secrets, or production flags.
- Do not put challenge flags in frontend source code, static assets, or client-visible API responses.
- Flag validation and score awarding must happen on the Django backend.
- Keep production secrets in the deployment provider's environment settings.
- Use HTTPS when communicating with the production API.

## Deployment

- Frontend: deployed through Vercel from this repository.
- Backend: deployed separately through Render.
- Database: hosted on Supabase PostgreSQL and accessed by Django.

## Project Status

Operation Flagfall is under active development. Features and competition workflows may evolve as the platform is tested and prepared for live events.

## Maintainers

**ITP Cybersec**  
GitHub: https://github.com/gb8462

---

*Built for the ITP Cybersec community.*
