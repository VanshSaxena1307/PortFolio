/**
 * V-CITY Core Domain Types
 */

export type AppMode = 'landing' | 'portal-transition' | 'city-entry' | 'city' | 'recruiter' | 'echo' | 'case-study';

export type PortalPhase =
  | 'idle'
  | 'turbulence'
  | 'whiteout'
  | 'city-reveal'
  | 'campus-spawn';

export type DistrictType =
  | 'campus'
  | 'tech'
  | 'research'
  | 'arena'
  | 'echo'
  | 'core'
  | 'ai-lab'
  | 'backend-foundry'
  | 'frontend-plaza'
  | 'systems-depot';

export type DistrictId = 'campus' | 'tech' | 'research' | 'arena' | 'echo';

export type BuildingArchetype =
  | 'office-tower'
  | 'midrise-commercial'
  | 'university-building'
  | 'research-lab'
  | 'arena-structure'
  | 'residential-tower'
  | 'industrial-service'
  | 'lowrise-storefront'
  | 'bank'
  | 'weather-station'
  | 'training-facility'
  | 'academic-hall'
  | 'construction-site'
  | 'developer-facility'
  | 'identity-monolith'
  | 'corporate-tech';

export interface Vector3D {
  x: number;
  y: number;
  z: number;
}

export interface BuildingVolume {
  id?: string;
  relativeOffset: Vector3D; // offset relative to building origin (x, y=elevation off ground, z)
  size: Vector3D; // width, height, depth
  color?: string;
  accentColor?: string;
  style?: 'standard' | 'glass-curtain' | 'stepped-wing' | 'skybridge' | 'entrance-portico' | 'podium' | 'bunker';
  windowPattern?: 'grid' | 'ribbon' | 'scattered' | 'atrium-glow' | 'commit-matrix' | 'terminal-slots' | 'bank-tall';
}

export type EntranceStyle =
  | 'bank-portico'
  | 'canopy-glass'
  | 'grand-atrium'
  | 'security-checkpoint'
  | 'parade-gate'
  | 'recessed-vestibule'
  | 'construction-bay'
  | 'none';

export type RoofEquipmentType =
  | 'radar-station'
  | 'construction-crane'
  | 'hvac-mechanical'
  | 'spire-beacon'
  | 'atrium-skylight'
  | 'weather-sensor'
  | 'antenna-array'
  | 'helipad'
  | 'architectural-void'
  | 'mech-unit'
  | 'dome'
  | 'terrace';

export interface ContextualFigure {
  id: string;
  role:
    | 'office-worker'
    | 'bank-guard'
    | 'customer'
    | 'researcher'
    | 'spectator'
    | 'cadet'
    | 'construction-worker'
    | 'student';
  offset: { x: number; y: number }; // 2D ground offset within building footprint or attached plaza
}

export interface BuildingData {
  id: string;
  name: string;
  tagline: string;
  district: DistrictType;
  coordinates: Vector3D;
  size: Vector3D;
  color: string;
  accentColor: string;
  archetype?: BuildingArchetype;
  reservedProject?: string;
  roofDetail?: 'helipad' | 'antenna' | 'atrium' | 'mech-unit' | 'spire' | 'terrace' | 'dome';
  roofEquipment?: RoofEquipmentType;
  windowPattern?: 'grid' | 'ribbon' | 'scattered' | 'atrium-glow' | 'commit-matrix' | 'terminal-slots' | 'bank-tall';
  facadeStyle?:
    | 'stone-glass'
    | 'laboratory-clean'
    | 'ribbon-office'
    | 'exposed-frame'
    | 'academic-brick-glass'
    | 'monolithic-obsidian'
    | 'industrial-ribbed';
  entranceStyle?: EntranceStyle;
  secondaryVolumes?: BuildingVolume[];
  contextualFigures?: ContextualFigure[];
  groundAttachment?:
    | 'parade-ground'
    | 'arena-plaza'
    | 'construction-yard'
    | 'bank-forecourt'
    | 'academic-courtyard'
    | 'weather-pad';
  lightingProfile?:
    | 'warm-office'
    | 'academic-warm'
    | 'bank-gold'
    | 'cool-laboratory'
    | 'event-amber'
    | 'training-floodlights'
    | 'construction-sodium'
    | 'echo-prism';
  relatedCaseStudyId?: string;
  status: 'operational' | 'in-progress' | 'archived' | 'reserved';
  description: string;
  technologies: string[];
  liveDemoUrl?: string;
  githubUrl?: string;
}

export type InteractionPhase =
  | 'IDLE'
  | 'HOVERING'
  | 'FOCUSING'
  | 'INSPECTING'
  | 'CLOSING'
  | 'RETURNING';

export interface CameraState {
  camX: number;
  camY: number;
  zoom: number;
  districtId: DistrictId;
}

export interface DistrictData {
  id: DistrictId;
  name: string;
  subtitle: string;
  tagline: string;
  cardinal: 'NORTH' | 'SOUTH' | 'EAST' | 'WEST' | 'CENTER';
  position: Vector3D;
  colorTheme: {
    primary: string;
    accent: string;
    ambientGlow: string;
  };
  lightingProfile: {
    windowTone: 'warm-amber' | 'cool-cyan' | 'mixed-white' | 'deep-blue';
    streetLampColor: string;
  };
  buildings: BuildingData[];
}

export interface NPCData {
  id: string;
  name: string;
  role: string;
  coordinates: Vector3D;
  district: DistrictType;
  dialogueTreeId: string;
  avatarIcon?: string;
}

export interface DialogueNode {
  id: string;
  speaker: string;
  text: string;
  options?: {
    text: string;
    nextNodeId?: string;
    action?: string;
  }[];
}

export interface CaseStudy {
  id: string;
  title: string;
  subtitle: string;
  role: string;
  timeline: string;
  problem: string;
  solution: string;
  architectureNotes: string[];
  metrics: { label: string; value: string }[];
  technologies: string[];
  liveDemoUrl?: string;
  githubUrl?: string;
  districtId: DistrictType;
}

export interface EchoRecord {
  id: string;
  category: 'philosophy' | 'stack' | 'milestones' | 'now';
  title: string;
  detail: string;
  tags: string[];
}

export interface CameraPreset {
  name: string;
  position: Vector3D;
  target: Vector3D;
  zoom: number;
}
