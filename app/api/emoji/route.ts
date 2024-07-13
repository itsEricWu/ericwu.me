import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI();

function promptConstructor(prompt: string) {
  return `Provide a single emoji for the following prompt: ${prompt}`;
}

export async function POST(req: NextRequest) {
  const { prompt } = await req.json();

  if (!prompt) {
    return NextResponse.json(
      { message: "Prompt is required" },
      { status: 400 },
    );
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: promptConstructor(prompt) }],
    });

    return NextResponse.json(
      { result: completion.choices[0].message.content },
      { status: 200 },
    );
  } catch (error: any) {
    return NextResponse.json(
      { message: "Error generating completion", error: error.message },
      { status: 500 },
    );
  }
}
