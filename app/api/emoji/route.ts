import { NextResponse, type NextRequest } from "next/server";
import OpenAI from "openai";
import emojiMap from "unicode-emoji-json";

import { fuzzySearch } from "@/lib/fuzzySearch";

const MAX_PROMPT = 80;

function firstGrapheme(text: string) {
  const segmenter = new Intl.Segmenter("en", { granularity: "grapheme" });

  for (const { segment } of segmenter.segment(text.trim())) return segment;

  return "";
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const prompt =
    typeof body?.prompt === "string"
      ? body.prompt.trim().slice(0, MAX_PROMPT)
      : "";

  if (!prompt) {
    return NextResponse.json(
      { message: "Prompt is required" },
      { status: 400 },
    );
  }

  try {
    const openai = new OpenAI();
    const completion = await openai.chat.completions.create({
      model: "gpt-6-luna",
      reasoning_effort: "none",
      max_completion_tokens: 8,
      messages: [
        {
          role: "system",
          content:
            "Reply with exactly one emoji that best matches the user's text. No words.",
        },
        { role: "user", content: prompt },
      ],
    });
    const emoji = firstGrapheme(completion.choices[0]?.message?.content ?? "");
    const entry =
      emojiMap[emoji as keyof typeof emojiMap] ??
      emojiMap[emoji.replace(/️/g, "") as keyof typeof emojiMap];
    const match = entry ? fuzzySearch(entry.name) : null;

    return NextResponse.json(
      { emoji, name: entry?.name ?? null, url: match?.url ?? null },
      { status: match ? 200 : 404 },
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json(
      { message: "Error generating completion", error: message },
      { status: 500 },
    );
  }
}
