import { Card } from "./ui/card";
import {
  BookOpen,
  Layers,
  Swords,
  ListChecks,
  Brain,
  Trophy,
  Palette,
  Repeat,
  TrendingUp,
  Database,
  Sparkles,
  BarChart3,
  ListOrdered,
  Target,
  Puzzle,
  Zap,
  Settings,
  MapPin,
  FileText,
} from "lucide-react";

interface TableOfContentsProps {
  onSelectSection: (section: string) => void;
}

type GuideSection = {
  id: string;
  icon: typeof BookOpen;
  title: string;
  description: string;
  accent: string;
  iconBg: string;
};

const coreSections: GuideSection[] = [
  { id: "basics", icon: BookOpen, title: "Game Basics", description: "Core concepts and win conditions", accent: "#2563EB", iconBg: "linear-gradient(135deg, #3B82F6, #2563EB)" },
  { id: "phases", icon: Layers, title: "Turn Phases", description: "Step-by-step turn structure", accent: "#16A34A", iconBg: "linear-gradient(135deg, #22C55E, #16A34A)" },
  { id: "donsystem", icon: Zap, title: "DON!! System", description: "Resources, timing, and execution", accent: "#D97706", iconBg: "linear-gradient(135deg, #F59E0B, #D97706)" },
  { id: "gamezones", icon: MapPin, title: "Game Zones", description: "Zones, card types, and timing", accent: "#0F766E", iconBg: "linear-gradient(135deg, #14B8A6, #0F766E)" },
  { id: "cards", icon: Layers, title: "Card Types", description: "Characters, events, stages, leaders", accent: "#7C3AED", iconBg: "linear-gradient(135deg, #8B5CF6, #7C3AED)" },
  { id: "combat", icon: Target, title: "Combat System", description: "Attacks, blocks, and damage", accent: "#DC2626", iconBg: "linear-gradient(135deg, #EF4444, #DC2626)" },
  { id: "priority", icon: Zap, title: "Priority & Actions", description: "When players can act", accent: "#CA8A04", iconBg: "linear-gradient(135deg, #FACC15, #CA8A04)" },
  { id: "scenarios", icon: ListChecks, title: "Example Scenarios", description: "Practice situations and rulings", accent: "#EA580C", iconBg: "linear-gradient(135deg, #FB923C, #EA580C)" },
  { id: "decisions", icon: Trophy, title: "Decision Tables", description: "If-then logic shortcuts", accent: "#DB2777", iconBg: "linear-gradient(135deg, #EC4899, #DB2777)" },
  { id: "cheatsheet", icon: FileText, title: "Quick Cheatsheet", description: "Reference material at a glance", accent: "#4F46E5", iconBg: "linear-gradient(135deg, #6366F1, #4F46E5)" },
];

const advancedSections: GuideSection[] = [
  { id: "prosystem", icon: Brain, title: "Pro Player System", description: "How stronger players structure decisions", accent: "#6D28D9", iconBg: "linear-gradient(135deg, #7C3AED, #5B21B6)" },
  { id: "masterpiecemoves", icon: Trophy, title: "Masterpiece Moves", description: "High-value tournament patterns", accent: "#B45309", iconBg: "linear-gradient(135deg, #D97706, #92400E)" },
  { id: "colorexecution", icon: Palette, title: "Color Execution", description: "How each color applies pressure", accent: "#9333EA", iconBg: "linear-gradient(135deg, #A855F7, #7E22CE)" },
  { id: "decisionlogic", icon: Repeat, title: "Decision Logic", description: "Turn-by-turn decision frameworks", accent: "#0891B2", iconBg: "linear-gradient(135deg, #06B6D4, #0E7490)" },
  { id: "progress", icon: TrendingUp, title: "Progress & Mastery", description: "Track growth and confidence", accent: "#059669", iconBg: "linear-gradient(135deg, #10B981, #047857)" },
];

const toolSections: GuideSection[] = [
  { id: "datasync", icon: Database, title: "Data Sync", description: "Connect external data sources", accent: "#2563EB", iconBg: "linear-gradient(135deg, #2563EB, #1D4ED8)" },
  { id: "tournamentimport", icon: FileText, title: "Tournament Import", description: "Pull in tournament and deck data", accent: "#7C3AED", iconBg: "linear-gradient(135deg, #8B5CF6, #6D28D9)" },
  { id: "aicoach", icon: Sparkles, title: "AI Coach", description: "Get feedback and recommendations", accent: "#DB2777", iconBg: "linear-gradient(135deg, #EC4899, #BE185D)" },
  { id: "metasnapshot", icon: BarChart3, title: "Meta Snapshot", description: "Read the current field quickly", accent: "#EA580C", iconBg: "linear-gradient(135deg, #F97316, #C2410C)" },
  { id: "trainingplaylist", icon: ListOrdered, title: "Training Playlist", description: "Plan focused practice sessions", accent: "#16A34A", iconBg: "linear-gradient(135deg, #22C55E, #15803D)" },
  { id: "deckfinder", icon: Target, title: "Deck Finder", description: "Pick the right deck for the room", accent: "#DC2626", iconBg: "linear-gradient(135deg, #EF4444, #B91C1C)" },
  { id: "matchupoptimizer", icon: Swords, title: "Matchup Optimizer", description: "Improve expected win rates", accent: "#EA580C", iconBg: "linear-gradient(135deg, #FB923C, #C2410C)" },
  { id: "metacounterbuilder", icon: Puzzle, title: "Meta Counter Builder", description: "Tune to beat target decks", accent: "#7C3AED", iconBg: "linear-gradient(135deg, #8B5CF6, #6D28D9)" },
  { id: "consistencyanalyzer", icon: BarChart3, title: "Consistency Analyzer", description: "Reduce variance and bad draws", accent: "#2563EB", iconBg: "linear-gradient(135deg, #3B82F6, #1D4ED8)" },
  { id: "aiverdict", icon: Zap, title: "AI Verdict", description: "Final recommendation layer", accent: "#059669", iconBg: "linear-gradient(135deg, #10B981, #047857)" },
  { id: "settings", icon: Settings, title: "Guide Settings", description: "Configure tools and integrations", accent: "#475569", iconBg: "linear-gradient(135deg, #64748B, #334155)" },
];

function SectionCard({
  section,
  onSelectSection,
}: {
  section: GuideSection;
  onSelectSection: (section: string) => void;
}) {
  const Icon = section.icon;

  return (
    <Card
      className="group cursor-pointer border transition-all hover:-translate-y-0.5 hover:shadow-lg"
      style={{
        borderColor: "rgba(193, 154, 107, 0.22)",
        background: "rgba(255,255,255,0.84)",
      }}
      onClick={() => onSelectSection(section.id)}
    >
      <div className="space-y-4 p-5">
        <div
          className="flex h-11 w-11 items-center justify-center rounded-xl transition-transform group-hover:scale-105"
          style={{ background: section.iconBg }}
        >
          <Icon className="h-5 w-5 text-white" />
        </div>

        <div className="space-y-2">
          <h3 className="text-base font-semibold" style={{ color: "#0A1F44" }}>
            {section.title}
          </h3>
          <p className="text-sm" style={{ color: "#5F6B82" }}>
            {section.description}
          </p>
        </div>

        <div className="h-px w-full" style={{ background: `${section.accent}26` }} />
      </div>
    </Card>
  );
}

function SectionGroup({
  title,
  description,
  icon: Icon,
  iconBg,
  sections,
  columnsClassName,
  onSelectSection,
}: {
  title: string;
  description: string;
  icon: typeof BookOpen;
  iconBg: string;
  sections: GuideSection[];
  columnsClassName: string;
  onSelectSection: (section: string) => void;
}) {
  return (
    <section className="space-y-5">
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl shrink-0"
            style={{ background: iconBg }}
          >
            <Icon className="h-5 w-5 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        </div>
        <p className="text-sm text-gray-700 md:pl-[3.25rem]">{description}</p>
      </div>

      <div className={columnsClassName}>
        {sections.map((section) => (
          <SectionCard
            key={section.id}
            section={section}
            onSelectSection={onSelectSection}
          />
        ))}
      </div>
    </section>
  );
}

export function TableOfContents({ onSelectSection }: TableOfContentsProps) {
  return (
    <div className="space-y-10">
      <section
        className="rounded-[24px] border px-6 py-8 md:px-8 md:py-10"
        style={{
          borderColor: "rgba(193, 154, 107, 0.28)",
          background: "rgba(255,255,255,0.56)",
        }}
      >
        <div className="space-y-4">
          <div
            className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em]"
            style={{
              borderColor: "rgba(10, 31, 68, 0.12)",
              color: "#0A1F44",
              background: "rgba(255,255,255,0.72)",
            }}
          >
            <BookOpen className="h-4 w-4" />
            Learning Guide
          </div>

          <h1 className="text-4xl font-black tracking-tight md:text-5xl text-gray-900">
            Learn the Game, Then Level Up
          </h1>

          <p className="max-w-3xl text-base md:text-lg text-gray-700">
            Work through the fundamentals first, then move into tournament-level
            decision-making, matchup prep, and AI-assisted tools without leaving DeckLab.
          </p>
        </div>
      </section>

      <SectionGroup
        title="Core Learning"
        description="Essential rules, turn structure, combat, and practical scenarios."
        icon={BookOpen}
        iconBg="linear-gradient(135deg, #3B82F6, #1D4ED8)"
        sections={coreSections}
        columnsClassName="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4"
        onSelectSection={onSelectSection}
      />

      <SectionGroup
        title="Advanced Decision-Making"
        description="Turn rules knowledge into cleaner sequencing, planning, and matchup judgment."
        icon={Brain}
        iconBg="linear-gradient(135deg, #8B5CF6, #6D28D9)"
        sections={advancedSections}
        columnsClassName="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5"
        onSelectSection={onSelectSection}
      />

      <SectionGroup
        title="Tools & Analysis"
        description="Use data, AI, and planning tools to sharpen practice and choose better decks."
        icon={Database}
        iconBg="linear-gradient(135deg, #EC4899, #BE185D)"
        sections={toolSections}
        columnsClassName="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5"
        onSelectSection={onSelectSection}
      />
    </div>
  );
}
