import { Navigate, useNavigate, useParams } from 'react-router';
import { SplashPage } from '../learning-guide/components/SplashPage';
import { TableOfContents } from '../learning-guide/components/TableOfContents';
import { GameBasics } from '../learning-guide/components/GameBasics';
import { DonSystem } from '../learning-guide/components/DonSystem';
import { TurnPhases } from '../learning-guide/components/TurnPhases';
import { CardMastery } from '../learning-guide/components/CardMastery';
import { GameZones } from '../learning-guide/components/GameZones';
import { GameEndConditions } from '../learning-guide/components/GameEndConditions';
import { CardTypes } from '../learning-guide/components/CardTypes';
import { CombatSystem } from '../learning-guide/components/CombatSystem';
import { PriorityActions } from '../learning-guide/components/PriorityActions';
import { Scenarios } from '../learning-guide/components/Scenarios';
import { DecisionTables } from '../learning-guide/components/DecisionTables';
import { Cheatsheet } from '../learning-guide/components/Cheatsheet';
import { ProPlayerSystem } from '../learning-guide/components/ProPlayerSystem';
import { MasterpieceMoves } from '../learning-guide/components/MasterpieceMoves';
import { ColorExecution } from '../learning-guide/components/ColorExecution';
import { DecisionLogic } from '../learning-guide/components/DecisionLogic';
import { Progress } from '../learning-guide/components/Progress';
import { DataSync } from '../learning-guide/components/DataSync';
import { TournamentImport } from '../learning-guide/components/TournamentImport';
import { AICoach } from '../learning-guide/components/AICoach';
import { MetaSnapshot } from '../learning-guide/components/MetaSnapshot';
import { TrainingPlaylist } from '../learning-guide/components/TrainingPlaylist';
import { DeckFinder } from '../learning-guide/components/DeckFinder';
import { MatchupOptimizer } from '../learning-guide/components/MatchupOptimizer';
import { MetaCounterBuilder } from '../learning-guide/components/MetaCounterBuilder';
import { ConsistencyAnalyzer } from '../learning-guide/components/ConsistencyAnalyzer';
import { AIVerdict } from '../learning-guide/components/AIVerdict';
import { Settings } from '../learning-guide/components/Settings';

const learningSectionComponents = {
  basics: GameBasics,
  gameendconditions: GameEndConditions,
  donsystem: DonSystem,
  gamezones: GameZones,
  phases: TurnPhases,
  cardmastery: CardMastery,
  cards: CardTypes,
  combat: CombatSystem,
  priority: PriorityActions,
  scenarios: Scenarios,
  decisions: DecisionTables,
  cheatsheet: Cheatsheet,
  prosystem: ProPlayerSystem,
  masterpiecemoves: MasterpieceMoves,
  colorexecution: ColorExecution,
  decisionlogic: DecisionLogic,
  progress: Progress,
  datasync: DataSync,
  tournamentimport: TournamentImport,
  aicoach: AICoach,
  metasnapshot: MetaSnapshot,
  trainingplaylist: TrainingPlaylist,
  deckfinder: DeckFinder,
  matchupoptimizer: MatchupOptimizer,
  metacounterbuilder: MetaCounterBuilder,
  consistencyanalyzer: ConsistencyAnalyzer,
  aiverdict: AIVerdict,
  settings: Settings
} as const;

export function LearningGuideHomePage() {
  const navigate = useNavigate();

  return (
    <div className="learning-guide-surface">
      <SplashPage onStart={() => navigate('/learning-guide/toc')} />
    </div>
  );
}

export function LearningGuideContentsPage() {
  const navigate = useNavigate();

  return (
    <div className="learning-guide-surface">
      <TableOfContents
        onSelectSection={(section) => navigate(`/learning-guide/${section}`)}
      />
    </div>
  );
}

export default function LearningGuideSectionPage() {
  const { section = '' } = useParams();

  if (section === 'toc') {
    return <LearningGuideContentsPage />;
  }

  const Component =
    learningSectionComponents[
      section as keyof typeof learningSectionComponents
    ];

  if (!Component) {
    return <Navigate to="/learning-guide/toc" replace />;
  }

  return (
    <div className="learning-guide-surface">
      <Component />
    </div>
  );
}
