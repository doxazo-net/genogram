# Genogram Web App — Requirements

## Overview

A modern, mobile-friendly web application for creating and editing genograms using the McGoldrick-Gerson standard notation. Supports CRUD operations, undo/redo, autosave, and PDF export.

## Functional Requirements

### FR-1: Genogram Management

- **FR-1.1**: Users can create, rename, and delete genograms
- **FR-1.2**: Each genogram is an independent document with its own canvas
- **FR-1.3**: Genogram list view shows all user's genograms with metadata (name, last modified, individual count)

### FR-2: Individual Management

- **FR-2.1**: Add individuals to the canvas by tapping/clicking a placement tool
- **FR-2.2**: Individuals rendered using McGoldrick-Gerson symbols:
  - Male: square
  - Female: circle
  - Unknown: diamond
  - Deceased: symbol with X overlay
  - Stillborn: small filled symbol
- **FR-2.3**: Edit individual properties: name, sex, dates, vital status, notes
- **FR-2.4**: Delete individuals (with confirmation; cascades to connected relationships)
- **FR-2.5**: Drag individuals to reposition on canvas
- **FR-2.6**: Multi-select individuals (shift-click or lasso)

### FR-3: Relationship Management

- **FR-3.1**: Partner relationships with McGoldrick-Gerson line styles:
  - Married: solid horizontal line
  - Divorced: solid line with double slash
  - Separated: solid line with single slash
  - Engaged: dashed horizontal line
  - Cohabiting: dashed horizontal line with doubled sections
- **FR-3.2**: Parent-child relationships:
  - Biological: solid vertical line
  - Adopted: dashed vertical line
  - Foster: dotted vertical line
  - Step: dashed-dot vertical line
- **FR-3.3**: Emotional relationship overlays:
  - Close: double green line
  - Very close/fused: triple green line
  - Distant: dotted line
  - Hostile: zigzag red line
  - Close-hostile: combined
  - Cutoff: line with break marks
- **FR-3.4**: Create relationships by selecting two individuals and choosing type
- **FR-3.5**: Edit and delete relationships

### FR-4: Canvas Interaction

- **FR-4.1**: Pan canvas via drag (with pan tool) or middle-mouse/two-finger drag
- **FR-4.2**: Zoom via scroll wheel or pinch gesture (min 25%, max 400%)
- **FR-4.3**: Fit-to-view button (auto-zoom to show all individuals)
- **FR-4.4**: Grid snap (optional, toggleable)
- **FR-4.5**: Minimap for large genograms (future enhancement)

### FR-5: Undo / Redo

- **FR-5.1**: Linear undo/redo stack
- **FR-5.2**: Keyboard shortcuts: Ctrl+Z (undo), Ctrl+Y or Ctrl+Shift+Z (redo)
- **FR-5.3**: Undo stack persisted per session (survives page refresh via autosave)
- **FR-5.4**: Batch operations (e.g., delete individual + its relationships) are a single undo step
- **FR-5.5**: Minimum 50 undo steps retained

### FR-6: Persistence & Autosave

- **FR-6.1**: Debounced autosave (~2 seconds after last edit)
- **FR-6.2**: Save indicator in UI (saved / saving / error states)
- **FR-6.3**: Data stored in Supabase PostgreSQL
- **FR-6.4**: Optimistic concurrency via version counter
- **FR-6.5**: Offline resilience: queue changes in IndexedDB if network unavailable, sync when back online

### FR-7: Authentication

- **FR-7.1**: Email/password registration and login
- **FR-7.2**: OAuth providers: Google, GitHub (minimum)
- **FR-7.3**: Password reset flow
- **FR-7.4**: Each user can only access their own genograms (RLS policies)

### FR-8: Export

- **FR-8.1**: PDF export preserving visual layout
- **FR-8.2**: Configurable page size (Letter, A4)
- **FR-8.3**: Option to include/exclude notes and annotations in export

### FR-9: Import

- **FR-9.1**: Import previously exported JSON genogram files
- **FR-9.2**: Validate JSON structure before import
- **FR-9.3**: Option to import as new genogram or merge into existing

## Non-Functional Requirements

### NFR-1: Mobile & Touch

- **NFR-1.1**: Fully functional on mobile browsers (iOS Safari, Chrome Android)
- **NFR-1.2**: Touch-optimized spacing with adjustable density (compact/comfortable/spacious)
- **NFR-1.3**: Touch gestures: tap to select, long-press for context menu, pinch to zoom, drag to pan/move
- **NFR-1.4**: Responsive toolbar that adapts to screen width
- **NFR-1.5**: Minimum touch target size: 44x44px (Apple HIG)

### NFR-2: Performance

- **NFR-2.1**: Smooth pan/zoom at 60fps for genograms up to 100 individuals
- **NFR-2.2**: Initial load under 3 seconds on 3G connection
- **NFR-2.3**: Autosave completes within 500ms for typical edits

### NFR-3: Accessibility

- **NFR-3.1**: Keyboard navigation for all interactive elements
- **NFR-3.2**: Semantic HTML and ARIA labels
- **NFR-3.3**: Minimum contrast ratio 4.5:1 (WCAG AA for text)
- **NFR-3.4**: Focus indicators visible on all interactive elements

### NFR-4: Security

- **NFR-4.1**: Supabase Row Level Security (RLS) on all tables
- **NFR-4.2**: HTTPS only
- **NFR-4.3**: Input sanitization for all user-provided text
- **NFR-4.4**: CSRF protection via Supabase auth tokens

### NFR-5: Deployment

- **NFR-5.1**: Docker containerized (multi-stage build)
- **NFR-5.2**: Configurable via environment variables
- **NFR-5.3**: Health check endpoint
- **NFR-5.4**: nginx reverse proxy for production

## Data Model

See [src/models/types.ts](../src/models/types.ts) for the TypeScript type definitions.

## Milestones

| Milestone | Version | Description |
|-----------|---------|-------------|
| Foundation | v0.1.0 | Project scaffold, SVG canvas, data model, CI/CD |
| Individuals | v0.2.0 | McGoldrick-Gerson symbols, CRUD for individuals |
| Relationships & Layout | v0.3.0 | All relationship types, auto-layout, manual adjust |
| Persistence & Auth | v0.4.0 | Supabase integration, auth, autosave, undo/redo |
| Touch & Mobile | v0.5.0 | Responsive UI, touch gestures, spacing controls |
| Export & Import | v0.6.0 | PDF export, JSON import/export |
| Polish & Release | v1.0.0 | Accessibility, theming, Docker prod config, docs |
