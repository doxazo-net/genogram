# Genogram

A modern, mobile-friendly web application for creating and editing genograms using the McGoldrick-Gerson standard notation.

## Features

- **McGoldrick-Gerson notation** — standard clinical genogram symbols and relationship line styles
- **SVG canvas** — smooth pan/zoom, drag-and-drop positioning
- **Touch-optimized** — full editing on mobile and tablet with adjustable spacing density
- **Autosave** — debounced saves to Supabase with offline resilience
- **Undo/Redo** — linear undo stack with keyboard shortcuts
- **PDF export** — print-ready output preserving visual layout
- **Secure** — Supabase Auth with Row Level Security

## Tech Stack

| Layer      | Technology                              |
| ---------- | --------------------------------------- |
| Frontend   | React 19, TypeScript, Vite              |
| State      | Zustand                                 |
| Canvas     | SVG (inline React components)           |
| Backend    | Supabase (PostgreSQL + Auth + Realtime) |
| Deployment | Docker + nginx                          |

## Getting Started

### Prerequisites

- Node.js 20+
- A [Supabase](https://supabase.com) project (free tier works)

### Setup

```bash
# Clone the repo
git clone https://github.com/YOUR_USERNAME/genogram.git
cd genogram

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your Supabase URL and anon key

# Run the Supabase migration
# (via Supabase dashboard > SQL Editor, paste supabase/migrations/001_initial_schema.sql)

# Start dev server
npm run dev
```

### Docker

```bash
# Build and run
docker compose up --build

# Or build standalone
docker build -t genogram-app .
docker run -p 3000:80 \
  -e VITE_SUPABASE_URL=https://your-project.supabase.co \
  -e VITE_SUPABASE_ANON_KEY=your-key \
  genogram-app
```

## Development

```bash
npm run dev       # Start dev server (hot reload)
npm run build     # Production build
npm run lint      # ESLint
npm run preview   # Preview production build locally
```

## Project Structure

```text
src/
├── components/   # React components (canvas, toolbar, dialogs, panels)
├── hooks/        # Custom React hooks (useAutosave, useUndoRedo, etc.)
├── models/       # TypeScript type definitions
├── services/     # Supabase client, PDF export, etc.
├── stores/       # Zustand state stores
├── styles/       # Global CSS
└── utils/        # Pure utility functions
```

## Documentation

- [Requirements](docs/requirements.md) — functional and non-functional requirements
- [Design Document](docs/plans/design.md) — architecture, data model, interaction design

## License

[MIT](LICENSE)
