export async function callMentor(
  systemInstruction: string,
  userPrompt: string,
  fallback: string
): Promise<string> {
  try {
    const res = await fetch("/api/mentor", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ systemInstruction, userPrompt, fallback }),
    });
    if (!res.ok) return fallback;
    const data: { text?: string } = await res.json();
    return data.text ?? fallback;
  } catch {
    return fallback;
  }
}
