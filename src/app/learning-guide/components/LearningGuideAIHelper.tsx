import { useState } from "react";
import { Bot, LoaderCircle, Sparkles } from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { withApiBase } from "../../data/apiBase";

type Props = {
  title: string;
  topic: string;
  context: string;
  description: string;
  prompts: string[];
};

export function LearningGuideAIHelper({
  title,
  topic,
  context,
  description,
  prompts,
}: Props) {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [provider, setProvider] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const runPrompt = async (nextQuestion: string) => {
    const trimmed = nextQuestion.trim();
    if (!trimmed) {
      setError("Ask something first.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(withApiBase("/ai/guide-assist"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          topic,
          context,
          question: trimmed,
        }),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload?.message || "Unable to get AI guidance right now.");
      }

      setAnswer(String(payload.answer || ""));
      setProvider(String(payload.provider || ""));
    } catch (requestError) {
      setAnswer("");
      setProvider("");
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to get AI guidance right now.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="space-y-4 border-2 border-fuchsia-200 bg-gradient-to-br from-fuchsia-50 to-white p-6">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-fuchsia-600 text-white">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-fuchsia-950">{title}</h3>
            <p className="text-sm text-fuchsia-700">{description}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {prompts.map((prompt) => (
            <Button
              key={prompt}
              type="button"
              variant="outline"
              className="h-auto whitespace-normal border-fuchsia-200 text-left text-fuchsia-900 hover:bg-fuchsia-100"
              onClick={() => {
                setQuestion(prompt);
                void runPrompt(prompt);
              }}
            >
              <Sparkles className="h-4 w-4 shrink-0" />
              {prompt}
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <Textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask the learning assistant something specific..."
          className="min-h-28 border-fuchsia-200 bg-white"
        />
        <Button
          type="button"
          onClick={() => void runPrompt(question)}
          disabled={loading}
          className="bg-fuchsia-700 text-white hover:bg-fuchsia-800"
        >
          {loading ? (
            <>
              <LoaderCircle className="h-4 w-4 animate-spin" />
              Thinking...
            </>
          ) : (
            <>
              <Bot className="h-4 w-4" />
              Ask AI
            </>
          )}
        </Button>
      </div>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {answer ? (
        <div className="space-y-3 rounded-xl border border-fuchsia-200 bg-white p-4">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-bold text-fuchsia-950">AI Guidance</p>
            {provider ? (
              <Badge className="bg-fuchsia-700 text-white capitalize">{provider}</Badge>
            ) : null}
          </div>
          <p className="whitespace-pre-line text-sm leading-7 text-slate-700">{answer}</p>
        </div>
      ) : null}
    </Card>
  );
}
