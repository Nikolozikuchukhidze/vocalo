import { createServerFn } from "@tanstack/react-start";

export type Recommendations = {
  voiceType: string;
  classification: string;
  span: string;
  summary: string;
  genres: string[];
  artists: { name: string; reason: string }[];
};

type Input = {
  lowNote: string;
  highNote: string;
  lowFreq: number;
  highFreq: number;
};

function parseInput(input: unknown): Input {
  if (!input || typeof input !== "object") throw new Error("Invalid input");
  const o = input as Record<string, unknown>;
  if (typeof o.lowNote !== "string" || typeof o.highNote !== "string")
    throw new Error("Invalid notes");
  return {
    lowNote: o.lowNote,
    highNote: o.highNote,
    lowFreq: Number(o.lowFreq) || 0,
    highFreq: Number(o.highFreq) || 0,
  };
}

export const getRecommendations = createServerFn({ method: "POST" })
  .inputValidator(parseInput)
  .handler(async ({ data }): Promise<Recommendations> => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("Missing LOVABLE_API_KEY");

    const semitones =
      data.lowFreq > 0 && data.highFreq > 0
        ? Math.round(12 * Math.log2(data.highFreq / data.lowFreq))
        : 0;
    const octaves = (semitones / 12).toFixed(1);

    const system = `You are a vocal coach AI for Vocalo. Given a singer's comfortable vocal range, identify their voice type and recommend music genres and artists whose vocal range and style genuinely fit. Be specific and varied — avoid generic pop-only picks. Respond ONLY with strict JSON matching the requested schema, no markdown, no commentary.`;

    const user = `Lowest comfortable note: ${data.lowNote} (${data.lowFreq.toFixed(1)} Hz)
Highest comfortable note: ${data.highNote} (${data.highFreq.toFixed(1)} Hz)
Range span: ~${octaves} octaves (${semitones} semitones)

Return JSON of the form:
{
  "voiceType": "short label like 'High Tenor' or 'Mezzo-Soprano'",
  "classification": "Soprano | Mezzo-Soprano | Alto | Countertenor | Tenor | Baritone | Bass",
  "span": "e.g. '2.5 oct'",
  "summary": "1-2 sentence description of this singer's strengths",
  "genres": ["6-8 specific genres that fit"],
  "artists": [
    { "name": "Artist name", "reason": "why their range/style fits, 1 short sentence" }
  ]
}
Include 6 artists. Pick artists whose actual vocal range matches.`;

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      if (res.status === 429) throw new Error("Rate limit reached. Try again shortly.");
      if (res.status === 402) throw new Error("AI credits exhausted. Please add credits.");
      throw new Error(`AI gateway error ${res.status}: ${text.slice(0, 200)}`);
    }

    const payload = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const content = payload.choices?.[0]?.message?.content ?? "";
    let parsed: Recommendations;
    try {
      const cleaned = content.replace(/^```json\s*|\s*```$/g, "").trim();
      parsed = JSON.parse(cleaned) as Recommendations;
    } catch {
      throw new Error("AI returned invalid JSON");
    }

    return {
      voiceType: String(parsed.voiceType ?? "Your Voice"),
      classification: String(parsed.classification ?? ""),
      span: String(parsed.span ?? `${octaves} oct`),
      summary: String(parsed.summary ?? ""),
      genres: Array.isArray(parsed.genres) ? parsed.genres.slice(0, 10).map(String) : [],
      artists: Array.isArray(parsed.artists)
        ? parsed.artists.slice(0, 8).map((a) => ({
            name: String(a?.name ?? ""),
            reason: String(a?.reason ?? ""),
          }))
        : [],
    };
  });
