// Server-side Anthropic API proxy.
// Keeps ANTHROPIC_API_KEY off the client bundle.
// Set ANTHROPIC_API_KEY in .env.local — the Coach and Quick Actions features use it.
// If the key is missing, returns a 500 and the client falls back to hardcoded answers.

import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY not set" }, { status: 500 });
  }

  try {
    const { systemPrompt, userMessage } = await req.json();

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 1000,
        system: systemPrompt,
        messages: [{ role: "user", content: userMessage }],
      }),
    });

    if (!response.ok) {
      return NextResponse.json({ error: "Upstream API error" }, { status: 500 });
    }

    const data = await response.json();
    const text =
      (data.content as Array<{ type: string; text?: string }>)?.find(
        (b) => b.type === "text"
      )?.text ?? "";

    return NextResponse.json({ text });
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
