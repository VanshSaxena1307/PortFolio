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
  | 'lowrise-storefront';

export interface Vector3D {
  x: number;
  y: number;
  z: number;
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
  windowPattern?: 'grid' | 'ribbon' | 'scattered' | 'atrium-glow';
  relatedCaseStudyId?: string;
  status: 'operational' | 'in-progress' | 'archived' | 'reserved';
  description: string;
  technologies: string[];
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
