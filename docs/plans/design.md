# Genogram App — Design Document

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    React + TypeScript                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐ │
│  │  Canvas   │  │ Toolbar  │  │ Panels   │  │ Dialogs │ │
│  │  (SVG)    │  │          │  │ (Props/  │  │         │ │
│  │           │  │          │  │  List)   │  │         │ │
│  └─────┬─────┘  └─────┬────┘  └────┬─────┘  └────┬────┘ │
│        │              │             │              │      │
│  ┌─────┴──────────────┴─────────────┴──────────────┴───┐ │
│  │                 Zustand Store                        │ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────────────┐   │ │
│  │  │ Genogram │  │ UI State │  │ Undo/Redo Stack  │   │ │
│  │  │  State   │  │          │  │                  │   │ │
│  │  └─────┬────┘  └──────────┘  └──────────────────┘   │ │
│  └────────┼────────────────────────────────────────────┘ │
│           │                                              │
│  ┌────────┴────────────────────────────────────────────┐ │
│  │              Persistence Layer                       │ │
│  │  ┌────────────┐  ┌─────────────┐  ┌──────────────┐  │ │
│  │  │ Supabase   │  │ IndexedDB   │  │  Autosave    │  │ │
│  │  │ Client     │  │ (offline)   │  │  Debouncer   │  │ │
│  │  └────────────┘  └─────────────┘  └──────────────┘  │ │
│  └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
                          │
                ┌─────────┴──────────┐
                │     Supabase       │
                │  ┌──────────────┐  │
                │  │  PostgreSQL  │  │
                │  │  (with RLS)  │  │
                │  ├──────────────┤  │
                │  │   Auth       │  │
                │  ├──────────────┤  │
                │  │  Realtime    │  │
                │  │  (future)    │  │
                │  └──────────────┘  │
                └────────────────────┘
```

## Component Architecture

### Canvas (`<GenogramCanvas />`)
- SVG-based rendering with `<g>` groups for layers
- Layers (bottom to top): grid, relationship lines, emotional overlays, individual symbols, selection highlights
- Pan/zoom via SVG `viewBox` manipulation
- Event delegation for performance (single handler on root SVG)

### Individual Symbols
- `<MaleSymbol />` — `<rect>` with optional X overlay
- `<FemaleSymbol />` — `<circle>` with optional X overlay
- `<UnknownSymbol />` — rotated `<rect>` (diamond) with optional X overlay
- `<IndividualLabel />` — `<text>` below symbol (name, dates)

### Relationship Lines
- `<PartnerLine />` — horizontal `<line>` or `<path>` with style variants
- `<ChildLine />` — vertical `<line>` or `<path>` from couple bar to child
- `<EmotionalLine />` — styled `<path>` between any two individuals

### State Management (Zustand)

```typescript
interface GenogramStore {
  // Data
  genogram: Genogram | null;

  // UI state
  tool: EditorTool;
  selection: Selection;
  spacing: SpacingDensity;
  viewport: Viewport;

  // Undo/redo
  undoStack: UndoAction[];
  redoStack: UndoAction[];

  // Persistence
  saveStatus: 'saved' | 'saving' | 'unsaved' | 'error';
  lastSavedAt: string | null;

  // Actions (all return UndoAction for the undo stack)
  addIndividual: (individual: Omit<Individual, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateIndividual: (id: string, changes: Partial<Individual>) => void;
  deleteIndividual: (id: string) => void;
  moveIndividual: (id: string, x: number, y: number) => void;

  addRelationship: (relationship: Omit<Relationship, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateRelationship: (id: string, changes: Partial<Relationship>) => void;
  deleteRelationship: (id: string) => void;

  undo: () => void;
  redo: () => void;

  setTool: (tool: EditorTool) => void;
  setSelection: (selection: Selection) => void;
  setSpacing: (density: SpacingDensity) => void;
  setViewport: (viewport: Viewport) => void;
}
```

### Persistence Strategy

1. **Autosave debouncer**: After any state mutation, a 2-second debounce timer starts. On fire, the current genogram state is serialized and sent to Supabase.
2. **Optimistic concurrency**: Each save includes the `version` counter. If the server version is ahead (conflict), the user is prompted.
3. **Offline queue**: If Supabase is unreachable, changes are queued in IndexedDB. On reconnection, queued changes are replayed in order.
4. **Save indicator**: UI shows "Saved", "Saving...", or "Offline — changes queued".

### Touch Interaction Model

| Gesture | Action |
|---------|--------|
| Tap | Select individual/relationship |
| Long press | Context menu (edit, delete, add relationship) |
| Drag on individual | Move individual |
| Drag on empty space | Pan canvas (in select mode) |
| Pinch | Zoom in/out |
| Two-finger drag | Pan canvas |
| Double tap | Edit individual properties |

### Spacing Density

The `SpacingDensity` setting controls:
- SVG symbol sizes (compact: 30px, comfortable: 44px, spacious: 60px)
- Gap between symbols
- Touch target padding (invisible hit area around symbols)
- Label font size
- Toolbar button sizes

## Database Schema (Supabase)

```sql
-- Users managed by Supabase Auth

create table genograms (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  description text,
  viewport_pan_x real not null default 0,
  viewport_pan_y real not null default 0,
  viewport_zoom real not null default 1,
  version integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table individuals (
  id uuid primary key default gen_random_uuid(),
  genogram_id uuid references genograms(id) on delete cascade not null,
  sex text not null check (sex in ('male', 'female', 'unknown')),
  vital_status text not null default 'alive' check (vital_status in ('alive', 'deceased', 'stillborn')),
  first_name text not null default '',
  last_name text not null default '',
  maiden_name text,
  nickname text,
  date_of_birth date,
  date_of_death date,
  notes text,
  x real not null default 0,
  y real not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table partner_relationships (
  id uuid primary key default gen_random_uuid(),
  genogram_id uuid references genograms(id) on delete cascade not null,
  partner_a uuid references individuals(id) on delete cascade not null,
  partner_b uuid references individuals(id) on delete cascade not null,
  relationship_type text not null check (relationship_type in (
    'married', 'divorced', 'separated', 'engaged', 'cohabiting', 'widowed'
  )),
  marriage_date date,
  separation_date date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table child_relationships (
  id uuid primary key default gen_random_uuid(),
  genogram_id uuid references genograms(id) on delete cascade not null,
  parent_relationship_id uuid references partner_relationships(id) on delete cascade not null,
  child_id uuid references individuals(id) on delete cascade not null,
  relationship_type text not null default 'biological' check (relationship_type in (
    'biological', 'adopted', 'foster', 'step'
  )),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table emotional_relationships (
  id uuid primary key default gen_random_uuid(),
  genogram_id uuid references genograms(id) on delete cascade not null,
  person_a uuid references individuals(id) on delete cascade not null,
  person_b uuid references individuals(id) on delete cascade not null,
  relationship_type text not null check (relationship_type in (
    'close', 'very_close', 'distant', 'hostile', 'close_hostile', 'cutoff', 'focused_on'
  )),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Row Level Security
alter table genograms enable row level security;
alter table individuals enable row level security;
alter table partner_relationships enable row level security;
alter table child_relationships enable row level security;
alter table emotional_relationships enable row level security;

-- Policies: users can only access their own genograms
create policy "Users can CRUD own genograms"
  on genograms for all
  using (auth.uid() = owner_id);

create policy "Users can CRUD individuals in own genograms"
  on individuals for all
  using (genogram_id in (select id from genograms where owner_id = auth.uid()));

create policy "Users can CRUD partner relationships in own genograms"
  on partner_relationships for all
  using (genogram_id in (select id from genograms where owner_id = auth.uid()));

create policy "Users can CRUD child relationships in own genograms"
  on child_relationships for all
  using (genogram_id in (select id from genograms where owner_id = auth.uid()));

create policy "Users can CRUD emotional relationships in own genograms"
  on emotional_relationships for all
  using (genogram_id in (select id from genograms where owner_id = auth.uid()));

-- Indexes
create index idx_individuals_genogram on individuals(genogram_id);
create index idx_partner_rel_genogram on partner_relationships(genogram_id);
create index idx_child_rel_genogram on child_relationships(genogram_id);
create index idx_emotional_rel_genogram on emotional_relationships(genogram_id);
create index idx_genograms_owner on genograms(owner_id);
```

## PDF Export Strategy

1. Clone the SVG canvas DOM
2. Strip interactive elements (selection highlights, grid, cursors)
3. Apply print-specific styles (black lines, white background)
4. Use a library (e.g., `jspdf` + `svg2pdf.js`) to render SVG into PDF
5. Support configurable page sizes (Letter, A4)
6. Handle pagination for large genograms that span multiple pages

## Future Considerations (Post-v1.0)

- Real-time collaboration via Supabase Realtime + CRDTs
- GEDCOM import/export
- SVG and PNG export
- Shareable read-only links
- Template genograms (start from pre-built structures)
- Print-optimized CSS
- Additional annotation layers (medical, psychological)
- Localization (i18n)
