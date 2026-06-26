// lib/claude.ts
// Single entry point for all AI calls. Never make raw fetch calls to Anthropic in components.
// Calls the server-side /api/claude route so the API key stays on the server.
// Falls back silently if the network or key is unavailable — demo stays safe.

export const callClaude = async (
  systemPrompt: string,
  userMessage: string,
  fallback: string
): Promise<string> => {
  try {
    const response = await fetch("/api/claude", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ systemPrompt, userMessage }),
    });
    if (!response.ok) return fallback;
    const data = await response.json();
    return (data.text as string) ?? fallback;
  } catch {
    return fallback;
  }
};
