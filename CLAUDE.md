# CLAUDE.md

## >> ON SESSION START / RESUME: read SESSION-STATE.md FIRST (if present) <<

`SESSION-STATE.md` (repo root; gitignored, machine-local) is the orchestrate session
checkpoint - read it before doing anything when asked to resume / pick up work. It holds
only non-derivable intent + pointers (status banner, next actions); reboot-durable
derivables (in-flight PRs via `gh pr list`, worktrees via `git worktree list`) are
reconstructed on demand, not mirrored. Absent on a fresh checkout; created on the first
orchestrate session.

## Project Overview

Genogram is a modern, mobile-friendly web app for creating and editing clinical genograms using McGoldrick-Gerson standard notation. Built with React + TypeScript + Vite, backed by Supabase.

## Build & Run

```bash
npm install          # Install dependencies
npm run dev          # Dev server with hot reload
npm run build        # Production build (tsc + vite)
npm run lint         # ESLint check
npm run preview      # Preview production build
```

No automated test suite yet. Manual testing via `npm run dev`.

## Architecture

- **Frontend**: React 19 + TypeScript + Vite SPA
- **Canvas**: SVG-based rendering with React components for symbols and lines
- **State**: Zustand store with undo/redo stack and autosave debouncer
- **Backend**: Supabase (PostgreSQL + Auth + Row Level Security)
- **Deployment**: Docker multi-stage build (node builder -> nginx server)

**Key directories:**
- `src/models/types.ts` — Core data model (Individual, Relationship, Genogram)
- `src/components/` — React components (canvas, toolbar, dialogs)
- `src/hooks/` — Custom hooks (autosave, undo/redo, touch gestures)
- `src/stores/` — Zustand state stores
- `src/services/` — Supabase client, PDF export
- `supabase/migrations/` — Database schema

## Conventions

- All types in `src/models/types.ts`
- McGoldrick-Gerson notation: male=square, female=circle, unknown=diamond
- Relationship types: partner, child, emotional
- Touch targets minimum 44x44px
- Spacing density: compact | comfortable | spacious
- Autosave debounced at 2 seconds
- Undo stack minimum 50 entries

## Design References

- [Requirements](docs/requirements.md)
- [Design Document](docs/plans/design.md)
- [Supabase Schema](supabase/migrations/001_initial_schema.sql)
