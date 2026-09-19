import { useState } from 'react';
import { Header } from './components/common/Header';
import { CinematicLanding } from './components/landing/CinematicLanding';
import { CityWorld } from './components/city/CityWorld';
import { RecruiterView } from './components/recruiter/RecruiterView';
import { EchoHub } from './components/echo/EchoHub';
import { HireTerminal } from './components/terminal/HireTerminal';
import { TypewriterDialog } from './components/hud/TypewriterDialog';
import { CaseStudyModal } from './components/case-study/CaseStudyModal';
import { AppMode, BuildingData, CaseStudy, DialogueNode, NPCData } from './types';
import { DIALOGUE_TREES } from './data/dialogues';
import { CASE_STUDIES } from './data/caseStudies';

export function App() {
  const [currentMode, setCurrentMode] = useState<AppMode>('landing');
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const [activeDialogue, setActiveDialogue] = useState<DialogueNode | null>(null);
  const [activeCaseStudy, setActiveCaseStudy] = useState<CaseStudy | null>(null);
  const [transitionStatus, setTransitionStatus] = useState<string | null>(null);

  // Phase 1 Event Boundary: Clean onEnterCity callback
  const handleEnterCity = () => {
    console.log('[V-CITY EVENT] onEnterCity triggered — Phase 2 transition boundary ready.');
    setTransitionStatus('Event: onEnterCity() triggered — Phase 2 transition ready.');
    const timer = setTimeout(() => {
      setTransitionStatus(null);
    }, 4500);
    return () => clearTimeout(timer);
  };

  const handleSelectBuilding = (building: BuildingData) => {
    if (building.relatedCaseStudyId) {
      const study = CASE_STUDIES.find((c) => c.id === building.relatedCaseStudyId);
      if (study) {
        setActiveCaseStudy(study);
        return;
      }
    }
    setActiveDialogue({
      id: `dialogue-${building.id}`,
      speaker: `${building.name} // Telemetry`,
      text: `${building.description} Status: ${building.status.toUpperCase()}.`,
      options: [
        { text: 'Acknowledge', action: 'CLOSE' },
        { text: 'Open Recruiter Dossier', action: 'OPEN_RECRUITER' },
      ],
    });
  };

  const handleSelectNPC = (npc: NPCData) => {
    const tree = DIALOGUE_TREES[npc.dialogueTreeId];
    if (tree) {
      setActiveDialogue(tree);
    }
  };

  const handleDialogueAction = (action?: string) => {
    if (!action || action === 'CLOSE') {
      setActiveDialogue(null);
      return;
    }
    if (action === 'OPEN_ECHO') {
      setCurrentMode('echo');
      setActiveDialogue(null);
    } else if (action === 'OPEN_RECRUITER') {
      setCurrentMode('recruiter');
      setActiveDialogue(null);
    } else if (action === 'ENTER_CITY') {
      setCurrentMode('city');
      setActiveDialogue(null);
    } else if (action === 'OPEN_TERMINAL') {
      setIsTerminalOpen(true);
      setActiveDialogue(null);
    }
  };

  return (
    <div className="app-shell">
      <Header
        currentMode={currentMode}
        onNavigate={(mode) => setCurrentMode(mode)}
        onOpenTerminal={() => setIsTerminalOpen(true)}
      />

      <main className={`main-content ${currentMode === 'landing' ? 'landing-mode' : ''}`}>
        {currentMode === 'landing' && (
          <CinematicLanding onEnterCity={handleEnterCity} />
        )}

        {currentMode === 'city' && (
          <CityWorld
            onSelectBuilding={handleSelectBuilding}
            onSelectNPC={handleSelectNPC}
          />
        )}

        {currentMode === 'recruiter' && <RecruiterView />}

        {currentMode === 'echo' && <EchoHub />}
      </main>

      {/* Temporary Phase 1 Event Boundary Feedback */}
      {transitionStatus && (
        <div className="phase-toast badge-mono" role="status">
          {transitionStatus}
        </div>
      )}

      {/* Overlays & Interactive HUD Elements */}
      <TypewriterDialog
        dialogue={activeDialogue}
        onOptionSelect={handleDialogueAction}
        onClose={() => setActiveDialogue(null)}
      />

      <CaseStudyModal
        study={activeCaseStudy}
        onClose={() => setActiveCaseStudy(null)}
      />

      <HireTerminal
        isOpen={isTerminalOpen}
        onClose={() => setIsTerminalOpen(false)}
      />
    </div>
  );
}

export default App;
