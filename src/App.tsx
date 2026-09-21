import { useState, useEffect } from 'react';
import { Header } from './components/common/Header';
import { CinematicLanding } from './components/landing/CinematicLanding';
import { PortalTransition } from './components/transition/PortalTransition';
import { CityWorld } from './components/city/CityWorld';
import { RecruiterView } from './components/recruiter/RecruiterView';
import { EchoHub } from './components/echo/EchoHub';
import { HireTerminal } from './components/terminal/HireTerminal';
import { TypewriterDialog } from './components/hud/TypewriterDialog';
import { CaseStudyModal } from './components/case-study/CaseStudyModal';
import { AppMode, BuildingData, CaseStudy, DialogueNode, NPCData } from './types';
import { DIALOGUE_TREES } from './data/dialogues';

export function App() {
  const [currentMode, setCurrentMode] = useState<AppMode>('landing');
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const [activeDialogue, setActiveDialogue] = useState<DialogueNode | null>(null);
  const [activeCaseStudy, setActiveCaseStudy] = useState<CaseStudy | null>(null);

  // Phase 2: Enter activation starts the portal transition
  const handleEnterCity = () => {
    console.log('[V-CITY EVENT] ENTER activated — Initiating Phase 2 Portal Transition');
    setCurrentMode('portal-transition');
  };

  // Called when the flyover descent arrives and settles into the Campus spawn
  const handleTransitionComplete = () => {
    console.log('[V-CITY EVENT] Transition completed — Settle at Campus Spawn');
    setCurrentMode('city-entry');
  };

  const handleSelectBuilding = (building: BuildingData) => {
    console.log('[V-CITY EVENT] Selected building for in-world inspection:', building.id, building.name);
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
      setCurrentMode('city-entry');
      setActiveDialogue(null);
    } else if (action === 'OPEN_TERMINAL') {
      setIsTerminalOpen(true);
      setActiveDialogue(null);
    }
  };

  const isFullBleedMode =
    currentMode === 'landing' ||
    currentMode === 'portal-transition' ||
    currentMode === 'city-entry';

  useEffect(() => {
    if (isFullBleedMode) {
      document.body.classList.add('landing-mode-active');
      document.documentElement.classList.add('landing-mode-active');
    } else {
      document.body.classList.remove('landing-mode-active');
      document.documentElement.classList.remove('landing-mode-active');
    }
    return () => {
      document.body.classList.remove('landing-mode-active');
      document.documentElement.classList.remove('landing-mode-active');
    };
  }, [isFullBleedMode]);

  return (
    <div className={`app-shell ${isFullBleedMode ? 'landing-mode-shell' : ''}`}>
      {/* Hide header during cinematic landing and portal transition for pure cinematic immersion */}
      {currentMode !== 'landing' && currentMode !== 'portal-transition' && (
        <Header
          currentMode={currentMode}
          onNavigate={(mode) => setCurrentMode(mode)}
          onOpenTerminal={() => setIsTerminalOpen(true)}
        />
      )}

      <main className={`main-content ${isFullBleedMode ? 'landing-mode' : ''}`}>
        {(currentMode === 'landing' || currentMode === 'portal-transition') && (
          <CinematicLanding
            frozenProgress={currentMode === 'portal-transition' ? 1.0 : undefined}
            onEnterCity={handleEnterCity}
            onSkipIntro={() => {
              console.log('[V-CITY EVENT] SKIP INTRO activated — Navigating directly to City Entry');
              setCurrentMode('city-entry');
            }}
            onOpenRecruiter={() => setCurrentMode('recruiter')}
          />
        )}

        {currentMode === 'portal-transition' && (
          <PortalTransition onComplete={handleTransitionComplete} />
        )}

        {(currentMode === 'city-entry' || currentMode === 'city') && (
          <div className="city-entry-container">
            <CityWorld
              isDescending={false}
              isSettled={true}
              onSelectBuilding={handleSelectBuilding}
              onSelectNPC={handleSelectNPC}
            />
          </div>
        )}

        {currentMode === 'recruiter' && <RecruiterView />}

        {currentMode === 'echo' && <EchoHub />}
      </main>

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
