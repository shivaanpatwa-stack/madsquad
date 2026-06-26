// HQ Quick Actions route — backed by Gemini so only GEMINI_API_KEY is needed.
import { NextRequest, NextResponse } from "next/server";
import { callGemini } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  try {
    const { systemPrompt, userMessage } = await req.json();
    const text = await callGemini(systemPrompt ?? "", userMessage ?? "", "");
    if (!text) return NextResponse.json({ error: "No AI response" }, { status: 500 });
    return NextResponse.json({ text });
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
