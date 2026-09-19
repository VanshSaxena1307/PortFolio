/**
 * V-CITY Core Domain Types
 */

export type AppMode = 'landing' | 'city' | 'recruiter' | 'echo' | 'case-study';

export type DistrictType = 'core' | 'ai-lab' | 'backend-foundry' | 'frontend-plaza' | 'systems-depot';

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
  relatedCaseStudyId?: string;
  status: 'operational' | 'in-progress' | 'archived';
  description: string;
  technologies: string[];
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
