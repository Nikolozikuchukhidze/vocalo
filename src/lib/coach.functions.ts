import { createServerFn } from "@tanstack/react-start";

export type CoachMessage = { role: "user" | "assistant"; content: string };

export type VoiceContext = {
  lowNote?: string;
  highNote?: string;
  lowFreq?: number;
  highFreq?: number;
  lastKey?: string;
  accuracyPct?: number;
  notesHit?: number;
  username?: string;
};

type Input = {
  messages: CoachMessage[];
  voice?: VoiceContext;
};

function parseInput(input: unknown): Input {
  if (!input || typeof input !== "object") throw new Error("Invalid input");
  const o = input as Record<string, unknown>;
  const msgs = Array.isArray(o.messages) ? o.messages : [];
  const messages: CoachMessage[] = msgs
    .map((m) => {
      const x = m as { role?: string; content?: string };
      const role = x.role === "assistant" ? "assistant" : "user";
      const content = typeof x.content === "string" ? x.content : "";
      return { role, content } as CoachMessage;
    })
    .filter((m) => m.content.trim().length > 0)
    .slice(-30);
  return { messages, voice: (o.voice as VoiceContext) ?? undefined };
}

export const chatWithBrocalo = createServerFn({ method: "POST" })
  .inputValidator(parseInput)
  .handler(async ({ data }): Promise<{ reply: string }> => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("Missing LOVABLE_API_KEY");

    const v = data.voice ?? {};
    const ctxLines: string[] = [];
    if (v.username) ctxLines.push(`Singer's name: ${v.username}`);
    if (v.lowNote && v.highNote) {
      const semis =
        v.lowFreq && v.highFreq
          ? Math.round(12 * Math.log2(v.highFreq / v.lowFreq))
          : null;
      ctxLines.push(
        `Vocal range: ${v.lowNote} → ${v.highNote}${
          semis ? ` (~${(semis / 12).toFixed(1)} octaves)` : ""
        }`,
      );
    }
    if (v.lastKey) ctxLines.push(`Recently practiced key: ${v.lastKey}`);
    if (typeof v.accuracyPct === "number")
      ctxLines.push(`Recent pitch accuracy: ${v.accuracyPct.toFixed(0)}%`);
    if (typeof v.notesHit === "number")
      ctxLines.push(`Notes hit in last session: ${v.notesHit}`);

    const ctx = ctxLines.length
      ? `\n\nWhat you know about this singer:\n${ctxLines.join("\n")}`
      : "\n\nYou don't have any vocal data on this singer yet — invite them to take the vocal test or open the Train page.";

    const system = `You are Brocalo, a warm, encouraging personal singing coach inside the Vocalo app. You speak like a supportive vocal teacher: friendly, motivating, specific, and never generic. You give real, actionable feedback — breath support, vowel shape, resonance, scale choice, song picks, warm-ups.

Style rules:
- Keep replies tight (2–6 short paragraphs max, use bullet lists when useful).
- Always anchor advice to the singer's actual range/key when you have it.
- When suggesting songs, name real artists/songs that fit their range, with a one-line reason.
- When asked for a warm-up or practice routine, give a numbered plan (3–6 steps) with note names, durations, and what to listen for.
- Celebrate progress. Never be harsh.
- If you lack range data, ask them to run the Vocal Test (/vocal-test) or open Train (/train). Don't lecture — invite.
- Never mention you are an AI or a language model. You are Brocalo.${ctx}`;

    const messages = [
      { role: "system" as const, content: system },
      ...data.messages.map((m) => ({ role: m.role, content: m.content })),
    ];

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages,
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      if (res.status === 429) throw new Error("Brocalo is catching his breath — try again in a moment.");
      if (res.status === 402) throw new Error("AI credits exhausted. Please add credits.");
      throw new Error(`AI gateway error ${res.status}: ${text.slice(0, 200)}`);
    }

    const payload = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const reply = payload.choices?.[0]?.message?.content?.trim() ?? "";
    if (!reply) throw new Error("Brocalo had nothing to say — try again.");
    return { reply };
  });
