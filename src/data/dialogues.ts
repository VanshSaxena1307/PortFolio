import { DialogueNode } from '../types';

export const DIALOGUE_TREES: Record<string, DialogueNode> = {
  'tree-guide': {
    id: 'node-welcome',
    speaker: 'AURA // SYSTEM',
    text: 'Welcome to V-CITY. I am AURA, the city orchestrator. Every sector represents an engineering domain mastered by Vansh Saxena. Where would you like to travel?',
    options: [
      { text: 'Inspect Core Citadel (ECHO Hub)', action: 'OPEN_ECHO' },
      { text: 'View Recruiter Briefing & Skills', action: 'OPEN_RECRUITER' },
      { text: 'Explore V-City Districts', action: 'ENTER_CITY' },
    ],
  },
  'tree-recruiter': {
    id: 'node-recruiter',
    speaker: 'SCOUT-01 // TALENT AI',
    text: 'Greetings. Looking for key technical qualifications, impact metrics, or direct communication channels with Vansh Saxena?',
    options: [
      { text: 'Open Recruiter Dossier', action: 'OPEN_RECRUITER' },
      { text: 'Launch Hire Me Terminal', action: 'OPEN_TERMINAL' },
    ],
  },
};
