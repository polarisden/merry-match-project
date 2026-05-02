# Merry Match

Web application built with Vue 3 and Vite.

## Backend

The API for Merry Match is in a separate Java backend repository:

- **GitHub:** [github.com/polarisden/merry-mathch-BE](https://github.com/polarisden/merry-mathch-BE)
- **Clone:** `https://github.com/polarisden/merry-mathch-BE.git`

After the backend is running locally (or deployed), set `VITE_API_BASE_URL` in this project’s `.env` to match that API’s base URL.

---

## Demo accounts for visitors and HR

Use the accounts below to sign in and try features by role (for demos or staging environments).

### User

| | |
| --- | --- |
| **Email** | `demo.user@merrymatch.com` |
| **Password** | `12345678` |

### Admin

| | |
| --- | --- |
| **Email** | `admin@merrymatch.com` |
| **Password** | `12345678` |

> **Note:** These accounts are for demonstration or testing only. Do not reuse these passwords in production.

---

## For developers

### Prerequisites

- Node.js (LTS recommended)
- npm or a compatible package manager

### Install and run

```bash
npm install
npm run dev
```

Open the URL shown in the terminal (typically `http://localhost:5173`).

### Other scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview the production build locally |

### Environment variables

If the app talks to a backend, Supabase, or payments, configure a `.env` file with variables such as `VITE_API_BASE_URL`, `VITE_SUPABASE_URL`, and `VITE_SUPABASE_ANON_KEY` as required. Search the codebase for `import.meta.env` to see what is referenced.

---

### Tech stack

Vue 3, Vite, Vue Router, Pinia, Tailwind CSS, Axios, Supabase client (when configured).
