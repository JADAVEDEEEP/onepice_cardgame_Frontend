import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Swords, TrendingUp, AlertTriangle, CheckCircle2 } from "lucide-react";
import { LearningGuideAIHelper } from "./LearningGuideAIHelper";

interface Matchup {
  archetype: string;
  currentWinRate: number;
  weakPoints: string;
  aiAdjustment: string;
  newWinRate: number;
  improvement: number;
}

export function MatchupOptimizer() {
  const matchups: Matchup[] = [
    {
      archetype: "Aggro Red",
      currentWinRate: 45,
      weakPoints: "Weak to early pressure, no board wipes",
      aiAdjustment: "Added 4x blockers + life gain package",
      newWinRate: 72,
      improvement: 27
    },
    {
      archetype: "Control Black",
      currentWinRate: 38,
      weakPoints: "Single threats get removed easily",
      aiAdjustment: "Added double threat turns + pressure units",
      newWinRate: 68,
      improvement: 30
    },
    {
      archetype: "Trigger Yellow",
      currentWinRate: 55,
      weakPoints: "Trigger denial insufficient",
      aiAdjustment: "Added bottom-life effects + trigger blockers",
      newWinRate: 78,
      improvement: 23
    },
    {
      archetype: "Ramp Purple",
      currentWinRate: 62,
      weakPoints: "No DON denial strategy",
      aiAdjustment: "Added early pressure + DON-lock cards",
      newWinRate: 81,
      improvement: 19
    },
    {
      archetype: "Midrange Green",
      currentWinRate: 50,
      weakPoints: "Trading inefficiently, can't out-value",
      aiAdjustment: "Added event efficiency + high-value trades",
      newWinRate: 70,
      improvement: 20
    },
    {
      archetype: "Tempo Blue",
      currentWinRate: 48,
      weakPoints: "Countered too easily, board reset hurts",
      aiAdjustment: "Added uncounterable threats + recovery",
      newWinRate: 69,
      improvement: 21
    }
  ];

  const deckStrategy = {
    resourcesAttacked: [
      { resource: "Opponent Hand", how: "Counter drain through repeated attacks" },
      { resource: "DON Efficiency", how: "Force inefficient blocks and counters" },
      { resource: "Board Presence", how: "Remove key threats before they generate value" }
    ],
    denials: [
      "Denies single-threat strategies (Black)",
      "Denies DON ramp advantage (Purple)",
      "Denies trigger reliability (Yellow)"
    ],
    enabledMoves: [
      { num: 2, name: "Life First, Board Later" },
      { num: 9, name: "Counter Drain Turn" },
      { num: 22, name: "Lethal Setup" },
      { num: 27, name: "Overload" }
    ],
    shutdownMoves: [
      "Move #12 - Board Flip (you play around it)",
      "Move #13 - Leader Ability Lock (you don't rely on it)",
      "Move #16 - Life Lock (you have multiple kill lines)"
    ]
  };

  const getImprovementColor = (improvement: number) => {
    if (improvement >= 25) return '#2ECC40';
    if (improvement >= 15) return '#FFDC00';
    return '#FF851B';
  };

  const getWinRateColor = (winRate: number) => {
    if (winRate >= 70) return '#2ECC40';
    if (winRate >= 55) return '#FFDC00';
    if (winRate >= 45) return '#FF851B';
    return '#D0021B';
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full" style={{ backgroundColor: '#0A1F44' }}>
          <Swords className="w-5 h-5 text-yellow-300" />
          <span className="text-white font-bold">MATCHUP OPTIMIZER</span>
        </div>
        <h1 className="text-4xl font-bold" style={{ color: '#0A1F44' }}>
          Matchup Optimization Engine
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          AI-optimized deck configuration for maximum win rate against each archetype
        </p>
      </div>

      {/* Matchup Table */}
      <Card className="p-6 border-2" style={{ borderColor: '#C19A6B' }}>
        <h2 className="text-2xl font-bold mb-4" style={{ color: '#0A1F44' }}>
          Matchup Analysis Table
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead style={{ backgroundColor: '#0A1F44' }}>
              <tr>
                <th className="px-4 py-3 text-left text-white font-bold">Opponent Archetype</th>
                <th className="px-4 py-3 text-left text-white font-bold">Before</th>
                <th className="px-4 py-3 text-left text-white font-bold">Weak Points</th>
                <th className="px-4 py-3 text-left text-white font-bold">AI Adjustment</th>
                <th className="px-4 py-3 text-left text-white font-bold">After</th>
                <th className="px-4 py-3 text-left text-white font-bold">Improved</th>
              </tr>
            </thead>
            <tbody>
              {matchups.map((matchup, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-orange-50'}>
                  <td className="px-4 py-3 font-bold" style={{ color: '#0A1F44' }}>
                    {matchup.archetype}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: getWinRateColor(matchup.currentWinRate) }}
                      />
                      <span className="font-semibold">{matchup.currentWinRate}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {matchup.weakPoints}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span className="font-semibold" style={{ color: '#0A1F44' }}>
                      {matchup.aiAdjustment}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      className="text-white"
                      style={{ backgroundColor: getWinRateColor(matchup.newWinRate) }}
                    >
                      {matchup.newWinRate}%
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <TrendingUp
                        className="w-4 h-4"
                        style={{ color: getImprovementColor(matchup.improvement) }}
                      />
                      <span
                        className="font-bold"
                        style={{ color: getImprovementColor(matchup.improvement) }}
                      >
                        +{matchup.improvement}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Average Improvement */}
        <Card className="p-4 border-2 mt-4" style={{ borderColor: '#2ECC40', backgroundColor: '#F0FFF4' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-600">AVERAGE MATCHUP IMPROVEMENT</p>
              <p className="text-3xl font-bold mt-1" style={{ color: '#2ECC40' }}>
                +23.3%
              </p>
            </div>
            <CheckCircle2 className="w-12 h-12" style={{ color: '#2ECC40' }} />
          </div>
        </Card>
      </Card>

      {/* Why This Deck Wins */}
      <Card className="p-6 border-2" style={{ borderColor: '#C19A6B' }}>
        <h2 className="text-2xl font-bold mb-6" style={{ color: '#0A1F44' }}>
          Why This Deck Wins
        </h2>

        <div className="space-y-6">
          {/* Resources Attacked */}
          <div>
            <h3 className="text-lg font-bold mb-3" style={{ color: '#0A1F44' }}>
              Resources This Deck Attacks
            </h3>
            <div className="space-y-3">
              {deckStrategy.resourcesAttacked.map((item, index) => (
                <div key={index} className="p-4 rounded-lg border-l-4" style={{ borderColor: '#C19A6B', backgroundColor: '#FFF9F0' }}>
                  <p className="font-semibold mb-1" style={{ color: '#0A1F44' }}>
                    {item.resource}
                  </p>
                  <p className="text-sm text-gray-600">
                    {item.how}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* What It Denies */}
          <div>
            <h3 className="text-lg font-bold mb-3" style={{ color: '#0A1F44' }}>
              What It Denies Opponent
            </h3>
            <div className="grid md:grid-cols-3 gap-3">
              {deckStrategy.denials.map((denial, index) => (
                <Card key={index} className="p-4 border-2" style={{ borderColor: '#D0021B' }}>
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-5 h-5 shrink-0" style={{ color: '#D0021B' }} />
                    <p className="text-sm font-semibold">{denial}</p>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Masterpiece Moves Enabled */}
          <div>
            <h3 className="text-lg font-bold mb-3" style={{ color: '#0A1F44' }}>
              Masterpiece Moves This Deck Enables
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
              {deckStrategy.enabledMoves.map((move) => (
                <Card key={move.num} className="p-4 text-center border-2" style={{ borderColor: '#C19A6B' }}>
                  <div className="flex items-center justify-center w-10 h-10 rounded-full font-bold text-white mx-auto mb-2" style={{ backgroundColor: '#0A1F44' }}>
                    {move.num}
                  </div>
                  <p className="text-sm font-semibold">{move.name}</p>
                </Card>
              ))}
            </div>
          </div>

          {/* Opponent Moves It Shuts Down */}
          <div>
            <h3 className="text-lg font-bold mb-3" style={{ color: '#0A1F44' }}>
              Opponent Moves It Shuts Down
            </h3>
            <div className="space-y-2">
              {deckStrategy.shutdownMoves.map((move, index) => (
                <div key={index} className="p-3 rounded-lg bg-gray-100 text-sm">
                  <span className="font-semibold" style={{ color: '#D0021B' }}>✗</span>{" "}
                  {move}
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Bottom Tip */}
      <Card className="p-6 border-2 text-center" style={{ borderColor: '#C19A6B', backgroundColor: '#FFF9F0' }}>
        <p className="text-lg">
          <span className="font-bold" style={{ color: '#D0021B' }}>Pro Insight:</span>{" "}
          <span className="font-semibold" style={{ color: '#0A1F44' }}>
            A good deck wins 60% of matchups. A great deck wins 70%+. This AI-optimized configuration targets 70%+ across all expected opponents.
          </span>
        </p>
      </Card>

      <LearningGuideAIHelper
        title="Matchup Prep Assistant"
        topic="Matchup Optimization"
        description="Ask AI for matchup plans, mulligan ideas, and what to respect from each archetype."
        context="The page compares matchups versus aggro red, control black, trigger yellow, ramp purple, midrange green, and tempo blue, with weak points, AI adjustments, and strategy notes."
        prompts={[
          "How should I play this deck into Aggro Red?",
          "What mulligan plan helps against Control Black?",
          "Turn this matchup table into a simple tournament prep note sheet.",
        ]}
      />
    </div>
  );
}
