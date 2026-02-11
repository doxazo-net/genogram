// ============================================================================
// Genogram Data Model
// McGoldrick-Gerson standard notation
// ============================================================================

/** Biological sex determines the McGoldrick-Gerson symbol shape */
export type Sex = 'male' | 'female' | 'unknown';

/** Vital status of an individual */
export type VitalStatus = 'alive' | 'deceased' | 'stillborn';

/**
 * An individual in the genogram.
 * Rendered as a square (male), circle (female), or diamond (unknown).
 */
export interface Individual {
  id: string;
  sex: Sex;
  vitalStatus: VitalStatus;

  // Identity
  firstName: string;
  lastName: string;
  maidenName?: string;
  nickname?: string;

  // Dates
  dateOfBirth?: string; // ISO 8601 date
  dateOfDeath?: string; // ISO 8601 date

  // Annotations
  notes?: string;
  conditions?: string[]; // Medical/psychological conditions (future use)

  // Canvas position (SVG coordinates)
  x: number;
  y: number;

  // Metadata
  createdAt: string; // ISO 8601 datetime
  updatedAt: string; // ISO 8601 datetime
}

// ============================================================================
// Relationships
// ============================================================================

/** Structural relationship between two partners */
export type PartnerRelationshipType =
  | 'married'
  | 'divorced'
  | 'separated'
  | 'engaged'
  | 'cohabiting'
  | 'widowed';

/** How a child is connected to parent(s) */
export type ChildRelationshipType =
  | 'biological'
  | 'adopted'
  | 'foster'
  | 'step';

/** McGoldrick-Gerson emotional relationship overlays */
export type EmotionalRelationshipType =
  | 'close'
  | 'very_close' // fused
  | 'distant'
  | 'hostile'
  | 'close_hostile' // fused-hostile
  | 'cutoff'
  | 'focused_on'; // over-focused

/**
 * A partner (couple) relationship.
 * Rendered as a horizontal line between two individuals,
 * with style variations per McGoldrick-Gerson notation.
 */
export interface PartnerRelationship {
  id: string;
  type: 'partner';
  partnerA: string; // Individual ID
  partnerB: string; // Individual ID
  relationshipType: PartnerRelationshipType;
  marriageDate?: string; // ISO 8601
  separationDate?: string; // ISO 8601
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * A parent-child relationship.
 * Rendered as a vertical line from the couple line down to the child.
 */
export interface ChildRelationship {
  id: string;
  type: 'child';
  parentRelationshipId: string; // PartnerRelationship ID (the couple)
  childId: string; // Individual ID
  relationshipType: ChildRelationshipType;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * An emotional relationship overlay between any two individuals.
 * Rendered as styled lines (wavy, zigzag, dashed, etc.) per notation.
 */
export interface EmotionalRelationship {
  id: string;
  type: 'emotional';
  personA: string; // Individual ID
  personB: string; // Individual ID
  relationshipType: EmotionalRelationshipType;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

/** Union of all relationship types */
export type Relationship =
  | PartnerRelationship
  | ChildRelationship
  | EmotionalRelationship;

// ============================================================================
// Genogram (top-level document)
// ============================================================================

/**
 * A complete genogram document. This is the unit of persistence.
 */
export interface Genogram {
  id: string;
  name: string;
  description?: string;
  ownerId: string; // Supabase auth user ID

  individuals: Individual[];
  relationships: Relationship[];

  // Canvas state
  viewport: Viewport;

  // Metadata
  createdAt: string;
  updatedAt: string;
  version: number; // Optimistic concurrency control
}

/** Canvas viewport state for pan/zoom persistence */
export interface Viewport {
  panX: number;
  panY: number;
  zoom: number;
}

// ============================================================================
// Undo / Redo
// ============================================================================

/** Types of mutations that can be undone */
export type ActionType =
  | 'ADD_INDIVIDUAL'
  | 'UPDATE_INDIVIDUAL'
  | 'DELETE_INDIVIDUAL'
  | 'MOVE_INDIVIDUAL'
  | 'ADD_RELATIONSHIP'
  | 'UPDATE_RELATIONSHIP'
  | 'DELETE_RELATIONSHIP'
  | 'BATCH'; // Groups multiple actions into one undo step

/**
 * A single undoable action. Stores both forward and reverse deltas
 * so undo and redo are symmetric operations.
 */
export interface UndoAction {
  id: string;
  type: ActionType;
  timestamp: string;
  description: string; // Human-readable label for the undo menu
  forward: unknown; // Data to apply on redo
  reverse: unknown; // Data to apply on undo
  children?: UndoAction[]; // For BATCH type
}

// ============================================================================
// UI State
// ============================================================================

/** What tool/mode the user is currently in */
export type EditorTool =
  | 'select' // Default: click to select, drag to move
  | 'pan' // Drag to pan the canvas
  | 'add_individual' // Click to place a new individual
  | 'add_relationship'; // Click two individuals to connect them

/** Items currently selected on the canvas */
export interface Selection {
  individualIds: string[];
  relationshipIds: string[];
}

/** Touch spacing density level */
export type SpacingDensity = 'compact' | 'comfortable' | 'spacious';
