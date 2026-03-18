import { Button } from "./ui/button";
import { Ship, Zap, Compass, Sword, Users } from "lucide-react";

interface SplashPageProps {
  onStart: () => void;
}

export function SplashPage({ onStart }: SplashPageProps) {
  return (
    <div
      className="rounded-[28px] border px-5 py-10 md:px-10 md:py-14"
      style={{
        borderColor: "rgba(193, 154, 107, 0.24)",
        background:
          "radial-gradient(circle at top, rgba(255,255,255,0.85), rgba(255,255,255,0) 30%), linear-gradient(180deg, #f8f1e5 0%, #efe2cb 100%)",
      }}
    >
      <div className="mx-auto flex max-w-5xl flex-col items-center text-center">
        <div
          className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em]"
          style={{
            borderColor: "rgba(10, 31, 68, 0.12)",
            color: "#0A1F44",
            background: "rgba(255,255,255,0.65)",
          }}
        >
          <Ship className="h-4 w-4" />
          Learning Mode
        </div>

        <div className="mt-8 max-w-3xl space-y-5">
          <h1
            className="text-4xl font-black tracking-tight md:text-6xl"
            style={{ color: "#0A1F44" }}
          >
            One Piece TCG Learning Guide
          </h1>
          <p className="text-lg md:text-xl" style={{ color: "#49566F" }}>
            Learn the rules, sharpen decision-making, and move into deck strategy
            with a guided path that fits naturally inside DeckLab.
          </p>
        </div>

        <div className="mt-10 grid w-full max-w-4xl gap-3 md:grid-cols-4">
          {[
            { icon: Zap, text: "Interactive Rules" },
            { icon: Compass, text: "Clear Progression" },
            { icon: Sword, text: "Matchup Thinking" },
            { icon: Users, text: "Practice Drills" },
          ].map((item) => (
            <div
              key={item.text}
              className="rounded-2xl border px-4 py-4 text-left"
              style={{
                borderColor: "rgba(193, 154, 107, 0.35)",
                background: "rgba(255,255,255,0.72)",
              }}
            >
              <item.icon className="mb-3 h-5 w-5" style={{ color: "#C48A00" }} />
              <p className="text-sm font-semibold" style={{ color: "#0A1F44" }}>
                {item.text}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-10">
          <Button
            onClick={onStart}
            size="lg"
            className="rounded-xl px-8 py-6 text-lg font-semibold md:px-10"
            style={{
              background: "#0A1F44",
              color: "#ffffff",
              boxShadow: "0 12px 30px rgba(10, 31, 68, 0.18)",
            }}
          >
            <Ship className="mr-2 h-5 w-5" />
            Start Learning
          </Button>
        </div>

        <div className="mt-6">
          <p
            className="text-sm font-medium uppercase tracking-[0.18em]"
            style={{ color: "#6B7280" }}
          >
            From first rules to competitive decisions
          </p>
        </div>
      </div>
    </div>
  );
}
