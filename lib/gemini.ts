// Server-side only. Never import from client components.
export async function callGemini(
  systemInstruction: string,
  userPrompt: string,
  fallback: string
): Promise<string> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return fallback;

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemInstruction }] },
          contents: [{ parts: [{ text: userPrompt }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 500 },
        }),
      }
    );
    if (!res.ok) return fallback;
    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text ?? fallback;
  } catch {
    return fallback;
  }
}
