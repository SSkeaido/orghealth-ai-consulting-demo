import type { ProblemMapping } from "./problemMappingAgent";
import type { DiagnosticVersion } from "./diagnosticModes";

export const semanticApiUrl = import.meta.env.VITE_SEMANTIC_API_URL?.trim() ?? "";
export const isSemanticAiEnabled = Boolean(semanticApiUrl);

export async function analyzeCompanyProblemWithAI(input: {
  text: string;
  lens: DiagnosticVersion;
  industry: string;
  size: string;
  signal: AbortSignal;
}): Promise<ProblemMapping | null> {
  if (!semanticApiUrl || input.text.trim().length < 12) return null;
  const response = await fetch(semanticApiUrl, {
    method: "POST",
    signal: input.signal,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: input.text, lens: input.lens, industry: input.industry, size: input.size }),
  });
  if (!response.ok) throw new Error(`semantic_api_${response.status}`);
  const payload = (await response.json()) as { result?: ProblemMapping };
  return payload.result ?? null;
}

