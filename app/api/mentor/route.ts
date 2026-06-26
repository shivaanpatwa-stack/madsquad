import { NextRequest, NextResponse } from "next/server";
import { callGemini } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  try {
    const { systemInstruction, userPrompt, fallback } = await req.json();
    const text = await callGemini(
      systemInstruction ?? "",
      userPrompt ?? "",
      fallback ?? ""
    );
    return NextResponse.json({ text });
  } catch {
    return NextResponse.json({ text: "" }, { status: 500 });
  }
}
