import { useState, type ReactNode } from "react";
import {
  AlertCircle,
  BarChart3,
  Brain,
  ChevronRight,
  Compass,
  Crown,
  Heart,
  Lightbulb,
  LoaderCircle,
  Shield,
  Sword,
  Target,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { withApiBase } from "../../data/apiBase";
import { LearningGuideAIHelper } from "./LearningGuideAIHelper";

type CoachMove = {
  title: string;
  plan: string;
  winProbability: number;
  riskLevel: "Low" | "Medium" | "High";
  cardAdvantage: string;
  actions: string[];
};

type CoachAnalysis = {
  summary: string;
  bestMove: CoachMove;
  aggressiveMove: CoachMove;
  safeMove: CoachMove;
  boardInsight: string;
  resourceInsight: string;
  riskWarnings: string[];
  nextTurns: Array<{
    turnLabel: string;
    action: string;
    outcome: string;
    winProbability: number;
  }>;
};

const LEADERS = [
  "Monkey D. Luffy (Red)",
  "Roronoa Zoro (Green)",
  "Nami (Blue)",
  "Trafalgar Law (Purple)",
  "Charlotte Katakuri (Yellow)",
  "Kaido (Black)",
  "Eustass Kid (Red/Purple)",
  "Sanji (Yellow/Black)",
];

const MOVE_COLORS = ["#f59e0b", "#ef4444", "#3b82f6"];

export function AICoach() {
  const [yourLife, setYourLife] = useState("3");
  const [oppLife, setOppLife] = useState("2");
  const [yourHand, setYourHand] = useState("4");
  const [oppHand, setOppHand] = useState("2");
  const [donAvailable, setDonAvailable] = useState("8");
  const [attackers, setAttackers] = useState("2");
  const [blockers, setBlockers] = useState("1");
  const [restedChars, setRestedChars] = useState("1");
  const [triggerDeck, setTriggerDeck] = useState(false);
  const [aggressiveMode, setAggressiveMode] = useState(false);
  const [defensiveMode, setDefensiveMode] = useState(false);
  const [turnNumber, setTurnNumber] = useState("5");
  const [selectedLeader, setSelectedLeader] = useState("");
  const [analysis, setAnalysis] = useState<CoachAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setErrorMessage("");

    try {
      const response = await fetch(withApiBase("/ai/coach"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          selectedLeader,
          turnNumber,
          yourLife,
          oppLife,
          yourHand,
          oppHand,
          donAvailable,
          attackers,
          blockers,
          restedChars,
          triggerDeck,
          aggressiveMode,
          defensiveMode,
        }),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload?.message || "AI Coach could not analyze this board state.");
      }

      setAnalysis(payload.analysis as CoachAnalysis);
    } catch (error) {
      setAnalysis(null);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "AI Coach could not analyze this board state.",
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const moveOutcomeData = analysis
    ? [
        { name: "Best", value: analysis.bestMove.winProbability },
        { name: "Aggressive", value: analysis.aggressiveMove.winProbability },
        { name: "Safe", value: analysis.safeMove.winProbability },
      ]
    : [];

  const riskToScore = (riskLevel: CoachMove["riskLevel"]) => {
    if (riskLevel === "Low") return 2;
    if (riskLevel === "Medium") return 5;
    return 8;
  };

  const cardFlowToScore = (value: string) => {
    const parsed = Number.parseInt(value, 10);
    if (Number.isNaN(parsed)) return 3;
    return Math.max(1, Math.min(9, Math.abs(parsed) + 2));
  };

  const decisionComparisonData = analysis
    ? [
        {
          move: "Best",
          winRate: analysis.bestMove.winProbability,
          pressure: cardFlowToScore(analysis.bestMove.cardAdvantage),
          risk: riskToScore(analysis.bestMove.riskLevel),
        },
        {
          move: "Aggressive",
          winRate: analysis.aggressiveMove.winProbability,
          pressure: cardFlowToScore(analysis.aggressiveMove.cardAdvantage) + 1,
          risk: riskToScore(analysis.aggressiveMove.riskLevel),
        },
        {
          move: "Safe",
          winRate: analysis.safeMove.winProbability,
          pressure: cardFlowToScore(analysis.safeMove.cardAdvantage),
          risk: riskToScore(analysis.safeMove.riskLevel),
        },
      ]
    : [];

  const timelineData = analysis
    ? analysis.nextTurns.map((turn, index) => ({
        ...turn,
        step: index + 1,
      }))
    : [];

  const boardDelta = Number.parseInt(attackers, 10) - Number.parseInt(blockers, 10);
  const handDelta = Number.parseInt(yourHand, 10) - Number.parseInt(oppHand, 10);

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Brain className="h-8 w-8 text-pink-600" />
          <h2 className="text-3xl font-bold text-gray-900">AI Coach - Strategic Battle Assistant</h2>
        </div>
        <p className="text-gray-900">
          Send the current board state to AI and get a best line, safer alternative, pressure line, and a likely 3-turn plan.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <Card className="border-2 border-indigo-300 bg-gradient-to-br from-indigo-50 to-purple-50 lg:col-span-4">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500">
                <Target className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-indigo-900">Game State Input</CardTitle>
                <CardDescription className="text-sm text-indigo-700">
                  Enter the live match state before asking AI for a recommendation.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border border-indigo-200 bg-white p-4">
              <label className="mb-2 flex items-center gap-2 text-xs font-bold text-indigo-900">
                <Crown className="h-4 w-4" />
                LEADER SELECTION
              </label>
              <Select value={selectedLeader} onValueChange={setSelectedLeader}>
                <SelectTrigger className="w-full border-indigo-300 focus:ring-indigo-500">
                  <SelectValue placeholder="Select your leader..." />
                </SelectTrigger>
                <SelectContent>
                  {LEADERS.map((leader) => (
                    <SelectItem key={leader} value={leader}>
                      {leader}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-lg border border-indigo-200 bg-white p-4">
              <label className="mb-2 flex items-center gap-2 text-xs font-bold text-indigo-900">
                <Compass className="h-4 w-4" />
                TURN NUMBER
              </label>
              <input
                type="number"
                value={turnNumber}
                onChange={(e) => setTurnNumber(e.target.value)}
                className="w-full rounded-lg border border-indigo-300 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                min="1"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <StatInput
                label="YOUR LIFE"
                icon={<Heart className="h-3 w-3" />}
                value={yourLife}
                onChange={setYourLife}
                min="0"
                max="5"
                tone="blue"
              />
              <StatInput
                label="OPP LIFE"
                icon={<Heart className="h-3 w-3" />}
                value={oppLife}
                onChange={setOppLife}
                min="0"
                max="5"
                tone="red"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <StatInput
                label="YOUR HAND"
                icon={<Users className="h-3 w-3" />}
                value={yourHand}
                onChange={setYourHand}
                min="0"
                tone="blue"
              />
              <StatInput
                label="OPP HAND"
                icon={<Users className="h-3 w-3" />}
                value={oppHand}
                onChange={setOppHand}
                min="0"
                tone="red"
              />
            </div>

            <div className="rounded-lg border border-indigo-200 bg-white p-4">
              <label className="mb-2 flex items-center gap-2 text-xs font-bold text-indigo-900">
                <Zap className="h-4 w-4" />
                DON AVAILABLE
              </label>
              <input
                type="number"
                value={donAvailable}
                onChange={(e) => setDonAvailable(e.target.value)}
                className="w-full rounded-lg border border-indigo-300 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                min="0"
                max="10"
              />
            </div>

            <div className="rounded-lg border border-indigo-200 bg-white p-4">
              <p className="mb-3 text-xs font-bold text-indigo-900">BATTLEFIELD STATE</p>
              <div className="grid grid-cols-3 gap-3">
                <MiniInput label="ATTACKERS" value={attackers} onChange={setAttackers} icon={<Sword className="h-3 w-3" />} />
                <MiniInput label="BLOCKERS" value={blockers} onChange={setBlockers} icon={<Shield className="h-3 w-3" />} />
                <MiniInput label="RESTED" value={restedChars} onChange={setRestedChars} icon={<TrendingUp className="h-3 w-3" />} />
              </div>
            </div>

            <div className="space-y-3">
              <ToggleRow
                checked={triggerDeck}
                onCheckedChange={setTriggerDeck}
                title="Trigger-Focused Deck"
                description="Bias advice toward trigger-heavy decks"
                accent="yellow"
              />
              <ToggleRow
                checked={aggressiveMode}
                onCheckedChange={setAggressiveMode}
                title="Aggressive Preference"
                description="Favor high-pressure closing lines"
                accent="red"
              />
              <ToggleRow
                checked={defensiveMode}
                onCheckedChange={setDefensiveMode}
                title="Defensive Preference"
                description="Prefer safer resource-preserving lines"
                accent="blue"
              />
            </div>

            <Button
              onClick={handleAnalyze}
              className="w-full gap-2 bg-gradient-to-r from-pink-600 to-purple-600 py-6 text-lg font-bold text-white shadow-lg transition-all hover:from-pink-700 hover:to-purple-700 hover:shadow-xl"
              disabled={isAnalyzing}
            >
              {isAnalyzing ? (
                <>
                  <LoaderCircle className="h-5 w-5 animate-spin" />
                  Analyzing With AI...
                </>
              ) : (
                <>
                  <Brain className="h-5 w-5" />
                  Analyze With AI
                </>
              )}
            </Button>

            {errorMessage ? (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {errorMessage}
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card className="border-2 border-pink-300 bg-gradient-to-br from-pink-50 to-purple-50 lg:col-span-8">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-pink-500">
                <Brain className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-pink-900">AI Strategy Engine</CardTitle>
                <CardDescription className="text-sm text-pink-700">
                  Live AI output based on the exact state you submit.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {!analysis ? (
              <div className="flex h-96 flex-col items-center justify-center rounded-lg border-2 border-pink-200 bg-white text-center">
                {isAnalyzing ? (
                  <>
                    <LoaderCircle className="mb-4 h-16 w-16 animate-spin text-pink-400" />
                    <p className="max-w-md text-lg text-gray-700">
                      Asking AI for the best tactical line from this board state.
                    </p>
                  </>
                ) : (
                  <>
                    <Compass className="mb-4 h-20 w-20 text-pink-300" />
                    <p className="max-w-md text-lg text-gray-700">
                      Fill the board state and press Analyze With AI to see the recommendation.
                    </p>
                  </>
                )}
              </div>
            ) : (
              <>
                <div className="rounded-xl border-2 border-pink-200 bg-white p-5">
                  <div className="mb-2 flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-pink-600" />
                    <p className="text-sm font-bold text-pink-900">AI SUMMARY</p>
                  </div>
                  <p className="text-base leading-7 text-gray-800">{analysis.summary}</p>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <MoveCard move={analysis.bestMove} tone="yellow" />
                  <MoveCard move={analysis.aggressiveMove} tone="red" />
                  <MoveCard move={analysis.safeMove} tone="blue" />
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                  <Card className="border-2 border-blue-300 bg-gradient-to-br from-blue-50 to-cyan-50">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500">
                          <BarChart3 className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-xl font-bold text-blue-900">Probability View</CardTitle>
                          <CardDescription className="text-sm text-blue-700">
                            Comparison between the three AI suggestions.
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-5">
                      <div className="rounded-lg border border-blue-200 bg-white p-4">
                        <p className="mb-3 text-sm font-bold text-blue-900">WIN PROBABILITY</p>
                        <ResponsiveContainer width="100%" height={190}>
                          <BarChart data={decisionComparisonData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="move" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="winRate" fill="#f59e0b" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>

                      <div className="rounded-lg border border-blue-200 bg-white p-4">
                        <p className="mb-3 text-sm font-bold text-blue-900">PRESSURE VS RISK</p>
                        <ResponsiveContainer width="100%" height={190}>
                          <BarChart data={decisionComparisonData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="move" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="pressure" fill="#ef4444" />
                            <Bar dataKey="risk" fill="#3b82f6" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>

                      <div className="rounded-lg border border-blue-200 bg-white p-4">
                        <p className="mb-3 text-sm font-bold text-blue-900">OUTCOME SPLIT</p>
                        <ResponsiveContainer width="100%" height={200}>
                          <PieChart>
                            <Pie
                              data={moveOutcomeData}
                              cx="50%"
                              cy="50%"
                              outerRadius={72}
                              labelLine={false}
                              label={({ name, value }) => `${name}: ${value}%`}
                              dataKey="value"
                            >
                              {moveOutcomeData.map((entry, index) => (
                                <Cell key={`${entry.name}-${index}`} fill={MOVE_COLORS[index % MOVE_COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-2 border-green-300 bg-gradient-to-br from-green-50 to-emerald-50">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500">
                          <Lightbulb className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-xl font-bold text-green-900">Strategy Insights</CardTitle>
                          <CardDescription className="text-sm text-green-700">
                            Tactical reading of the current position.
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <InsightCard
                        title="Board Pressure"
                        icon={<TrendingUp className="h-5 w-5 text-green-600" />}
                        body={analysis.boardInsight}
                        footer={`Board delta: ${boardDelta >= 0 ? "+" : ""}${boardDelta}`}
                        border="border-green-300"
                      />
                      <InsightCard
                        title="Resource Outlook"
                        icon={<Zap className="h-5 w-5 text-yellow-600" />}
                        body={analysis.resourceInsight}
                        footer={`Hand delta: ${handDelta >= 0 ? "+" : ""}${handDelta}`}
                        border="border-yellow-300"
                      />
                      <div className="rounded-xl border-2 border-red-300 bg-white p-4">
                        <div className="mb-3 flex items-center gap-2">
                          <AlertCircle className="h-5 w-5 text-red-600" />
                          <p className="text-sm font-bold text-red-900">RISK WARNINGS</p>
                        </div>
                        <div className="space-y-2">
                          {analysis.riskWarnings.map((warning) => (
                            <div key={warning} className="flex items-start gap-2 text-sm text-gray-700">
                              <span className="mt-0.5 text-red-600">!</span>
                              <span>{warning}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card className="border-2 border-purple-300 bg-gradient-to-br from-purple-50 to-violet-50">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500">
                        <Compass className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-xl font-bold text-purple-900">Next-Turn Timeline</CardTitle>
                        <CardDescription className="text-sm text-purple-700">
                          Likely follow-up if you take the recommended line.
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-3">
                      {timelineData.map((turn, index) => (
                        <div key={`${turn.turnLabel}-${index}`} className="rounded-xl border-2 border-purple-200 bg-white p-4">
                          <div className="mb-3 flex items-center justify-between gap-3">
                            <p className="font-bold text-gray-900">{turn.turnLabel}</p>
                            <Badge className="bg-purple-500 text-white">{turn.winProbability}%</Badge>
                          </div>
                          <div className="space-y-3">
                            <div>
                              <p className="text-xs font-bold text-gray-500">ACTION</p>
                              <p className="text-sm text-gray-800">{turn.action}</p>
                            </div>
                            <div>
                              <p className="text-xs font-bold text-gray-500">OUTCOME</p>
                              <p className="text-sm text-gray-800">{turn.outcome}</p>
                            </div>
                            {index < timelineData.length - 1 ? (
                              <div className="flex items-center gap-2 pt-1 text-xs text-gray-500">
                                <ChevronRight className="h-4 w-4 text-purple-500" />
                                Leading to the next turn
                              </div>
                            ) : null}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="rounded-lg border-2 border-purple-200 bg-white p-4">
                      <p className="mb-3 text-sm font-bold text-purple-900">WIN PROBABILITY TREND</p>
                      <ResponsiveContainer width="100%" height={180}>
                        <LineChart data={timelineData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="turnLabel" />
                          <YAxis />
                          <Tooltip />
                          <Line
                            type="monotone"
                            dataKey="winProbability"
                            stroke="#a855f7"
                            strokeWidth={3}
                            dot={{ fill: "#a855f7", r: 5 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatInput({
  label,
  icon,
  value,
  onChange,
  min,
  max,
  tone,
}: {
  label: string;
  icon: ReactNode;
  value: string;
  onChange: (value: string) => void;
  min: string;
  max?: string;
  tone: "blue" | "red";
}) {
  const toneClasses =
    tone === "blue"
      ? {
          label: "text-blue-900",
          border: "border-blue-300",
          ring: "focus:ring-blue-500",
        }
      : {
          label: "text-red-900",
          border: "border-red-300",
          ring: "focus:ring-red-500",
        };

  return (
    <div className="rounded-lg border border-indigo-200 bg-white p-4">
      <label className={`mb-2 flex items-center gap-1 text-xs font-bold ${toneClasses.label}`}>
        {icon}
        {label}
      </label>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full rounded-lg border bg-white px-3 py-2 focus:outline-none focus:ring-2 ${toneClasses.border} ${toneClasses.ring}`}
        min={min}
        max={max}
      />
    </div>
  );
}

function MiniInput({
  label,
  icon,
  value,
  onChange,
}: {
  label: string;
  icon: ReactNode;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="mb-1 flex items-center gap-1 text-xs font-bold text-gray-700">
        {icon}
        {label}
      </label>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border border-indigo-300 bg-white px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        min="0"
      />
    </div>
  );
}

function ToggleRow({
  checked,
  onCheckedChange,
  title,
  description,
  accent,
}: {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  title: string;
  description: string;
  accent: "yellow" | "red" | "blue";
}) {
  const accentClasses =
    accent === "yellow"
      ? {
          wrapper: "border-yellow-300 bg-yellow-50",
          title: "text-yellow-900",
          description: "text-yellow-700",
          toggle: "peer-checked:bg-yellow-500",
        }
      : accent === "red"
        ? {
            wrapper: "border-red-300 bg-red-50",
            title: "text-red-900",
            description: "text-red-700",
            toggle: "peer-checked:bg-red-500",
          }
        : {
            wrapper: "border-blue-300 bg-blue-50",
            title: "text-blue-900",
            description: "text-blue-700",
            toggle: "peer-checked:bg-blue-500",
          };

  return (
    <div className={`flex items-center justify-between rounded-lg border-2 p-3 transition-shadow hover:shadow-md ${accentClasses.wrapper}`}>
      <div>
        <p className={`text-sm font-semibold ${accentClasses.title}`}>{title}</p>
        <p className={`text-xs ${accentClasses.description}`}>{description}</p>
      </div>
      <label className="relative inline-flex cursor-pointer items-center">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onCheckedChange(e.target.checked)}
          className="peer sr-only"
        />
        <div
          className={`h-6 w-11 rounded-full bg-gray-300 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-white ${accentClasses.toggle}`}
        ></div>
      </label>
    </div>
  );
}

function MoveCard({
  move,
  tone,
}: {
  move: CoachMove;
  tone: "yellow" | "red" | "blue";
}) {
  const toneClasses =
    tone === "yellow"
      ? {
          shell: "border-yellow-300 bg-gradient-to-br from-yellow-50 to-amber-50",
          badge: "bg-yellow-500 text-white",
        }
      : tone === "red"
        ? {
            shell: "border-red-300 bg-gradient-to-br from-red-50 to-rose-50",
            badge: "bg-red-500 text-white",
          }
        : {
            shell: "border-blue-300 bg-gradient-to-br from-blue-50 to-cyan-50",
            badge: "bg-blue-500 text-white",
          };

  const riskClasses =
    move.riskLevel === "Low"
      ? "border-emerald-200 bg-emerald-100 text-emerald-700"
      : move.riskLevel === "Medium"
        ? "border-amber-200 bg-amber-100 text-amber-700"
        : "border-red-200 bg-red-100 text-red-700";

  return (
    <div className={`rounded-xl border-2 p-5 shadow-sm ${toneClasses.shell}`}>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-lg font-bold text-gray-900">{move.title}</p>
          <p className="mt-1 text-sm text-gray-700">{move.plan}</p>
        </div>
        <Badge className={toneClasses.badge}>{move.winProbability}%</Badge>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${riskClasses}`}>
          {move.riskLevel} Risk
        </span>
        <span className="rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
          Card Flow {move.cardAdvantage}
        </span>
      </div>

      <div className="space-y-2">
        {move.actions.map((action) => (
          <div key={action} className="flex items-start gap-2 text-sm text-gray-800">
            <ChevronRight className="mt-0.5 h-4 w-4 text-gray-500" />
            <span>{action}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function InsightCard({
  title,
  icon,
  body,
  footer,
  border,
}: {
  title: string;
  icon: ReactNode;
  body: string;
  footer: string;
  border: string;
}) {
  return (
    <div className={`rounded-xl border-2 bg-white p-4 ${border}`}>
      <div className="mb-2 flex items-center gap-2">
        {icon}
        <p className="text-sm font-bold text-gray-900">{title}</p>
      </div>
      <p className="text-sm leading-6 text-gray-700">{body}</p>
      <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-gray-500">{footer}</p>
      <LearningGuideAIHelper
        title="AICoach AI Helper"
        topic="AICoach"
        description="Ask AI to explain this section in simpler words, answer follow-up questions, and turn the topic into practical game advice."
        context="This learning-guide page is about AICoach in the One Piece TCG learning experience."
        prompts={[
          "Explain the most important idea on this page in simple words.",
          "Give me a practical example from a real match.",
          "What mistakes do new players make with this topic?",
        ]}
      />
    </div>
  );
}


