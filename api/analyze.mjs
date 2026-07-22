import { readFileSync } from "node:fs";

const SKILL = readFileSync(
  new URL("../.agents/skills/senior-management-consultant/SKILL.md", import.meta.url),
  "utf8",
);

const EVENTS = {
  "2.1": ["A01", "A02", "A03", "A04", "A05", "A06", "A07", "A08", "A09", "A10", "A11", "A12"],
  "2.2": ["B01", "B02", "B03", "B04", "B05", "B06", "B07", "B08", "B09", "B10", "B11", "B12", "B13", "B14"],
};
const SIGNALS = ["growth", "profit", "customer", "delivery", "coordination", "people", "digital", "innovation", "change", "governance"];
const CONFIDENCE = new Set(["高", "中", "低"]);

const clamp = (value, min, max) => Math.min(max, Math.max(min, Number(value) || 0));
const strings = (value, limit) =>
  Array.isArray(value) ? value.filter((item) => typeof item === "string").slice(0, limit) : [];

function normalizeResult(value, lens) {
  const eventIds = new Set(EVENTS[lens]);
  const signalIds = new Set(SIGNALS);
  const status = value?.status === "mapped" ? "mapped" : "needs-detail";
  return {
    status,
    signals: Array.isArray(value?.signals)
      ? value.signals
          .filter((item) => signalIds.has(item?.id))
          .slice(0, 5)
          .map((item) => ({
            id: item.id,
            label: String(item.label || item.id).slice(0, 30),
            matchedTerms: strings(item.matchedTerms, 5).map((term) => term.slice(0, 30)),
            interpretation: String(item.interpretation || "").slice(0, 180),
          }))
      : [],
    questions: Array.isArray(value?.questions)
      ? value.questions
          .filter((item) => Number.isInteger(item?.questionId) && item.questionId >= 1 && item.questionId <= 56)
          .slice(0, 6)
          .map((item) => ({
            questionId: item.questionId,
            score: clamp(item.score, 0, 100),
            confidence: CONFIDENCE.has(item.confidence) ? item.confidence : "中",
            reason: String(item.reason || "").slice(0, 180),
            signalIds: strings(item.signalIds, 4).filter((id) => signalIds.has(id)),
          }))
      : [],
    events: Array.isArray(value?.events)
      ? value.events
          .filter((item) => eventIds.has(item?.eventId))
          .slice(0, 3)
          .map((item) => ({
            eventId: item.eventId,
            score: clamp(item.score, 0, 100),
            confidence: CONFIDENCE.has(item.confidence) ? item.confidence : "中",
            reason: String(item.reason || "").slice(0, 180),
          }))
      : [],
    followUps: strings(value?.followUps, 3).map((item) => item.slice(0, 160)),
    caveat: String(value?.caveat || "模型映射只决定优先核验方向，不代表问题或根因已经成立。").slice(0, 220),
  };
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "method_not_allowed" });
  const apiKey = process.env.SILICONFLOW_API_KEY;
  if (!apiKey) return res.status(503).json({ error: "semantic_model_not_configured" });

  const { text, lens = "2.1", industry = "", size = "" } = req.body || {};
  if (typeof text !== "string" || text.trim().length < 12 || text.length > 800 || !EVENTS[lens]) {
    return res.status(400).json({ error: "invalid_input" });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);
  try {
    const response = await fetch("https://api.siliconflow.cn/v1/chat/completions", {
      method: "POST",
      signal: controller.signal,
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: process.env.SILICONFLOW_MODEL || "deepseek-ai/DeepSeek-V3.2",
        messages: [
          {
            role: "system",
            content: `${SKILL}\n\nReturn one JSON object with keys status, signals, questions, events, followUps, caveat. Allowed signal IDs: ${SIGNALS.join(", ")}. Allowed event IDs: ${EVENTS[lens].join(", ")}. Allowed question IDs: integers 1-56. Maximums: 5 signals, 6 questions, 3 events, 3 followUps. Confidence must be 高, 中, or 低.`,
          },
          {
            role: "user",
            content: JSON.stringify({ enterprise_statement: text.trim(), respondent_lens: lens, industry, size }),
          },
        ],
        response_format: { type: "json_object" },
        enable_thinking: false,
        temperature: 0.15,
        max_tokens: 1800,
      }),
    });
    if (!response.ok) return res.status(502).json({ error: "semantic_model_failed", status: response.status });
    const payload = await response.json();
    const content = payload?.choices?.[0]?.message?.content;
    if (typeof content !== "string") throw new Error("empty_model_content");
    const result = normalizeResult(JSON.parse(content), lens);
    return res.status(200).json({ result, model: payload.model, source: "siliconflow" });
  } catch (error) {
    return res.status(error?.name === "AbortError" ? 504 : 502).json({ error: "semantic_model_invalid_response" });
  } finally {
    clearTimeout(timeout);
  }
}

