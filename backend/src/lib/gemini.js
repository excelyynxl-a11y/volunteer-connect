const GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1beta";
const REQUEST_TIMEOUT_MS = 60 * 1000;
const MAX_ATTEMPTS = 2;
const RETRY_DELAY_MS = 1500;
const RETRYABLE_STATUSES = new Set([429, 500, 502, 503, 504]);
const RETRYABLE_CODES = new Set(["TIMEOUT", "NETWORK", "BAD_RESPONSE"]);

/**
 * Error thrown by the Gemini client. `code` is one of NOT_CONFIGURED, TIMEOUT,
 * NETWORK, RATE_LIMITED, REQUEST_FAILED, BLOCKED or BAD_RESPONSE.
 */
export class GeminiError extends Error {
  constructor(message, code, { status } = {}) {
    super(message);
    this.name = "GeminiError";
    this.code = code;
    this.status = status;
  }
}

// Read at call time so importing this file never fails when the key is unset.
export const isGeminiConfigured = () =>
  Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_MODEL);

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const buildRequestBody = ({
  systemInstruction,
  prompt,
  files,
  schema,
  temperature,
  maxOutputTokens,
}) => ({
  ...(systemInstruction
    ? { systemInstruction: { parts: [{ text: systemInstruction }] } }
    : {}),
  contents: [
    {
      role: "user",
      parts: [
        { text: prompt },
        ...files.map(({ mimeType, data }) => ({
          inlineData: { mimeType, data: data.toString("base64") },
        })),
      ],
    },
  ],
  generationConfig: {
    responseMimeType: "application/json",
    responseSchema: schema,
    temperature,
    maxOutputTokens,
  },
});

const sendRequest = async (body) => {
  const model = encodeURIComponent(process.env.GEMINI_MODEL);
  let response;

  try {
    response = await fetch(`${GEMINI_API_BASE}/models/${model}:generateContent`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": process.env.GEMINI_API_KEY,
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch (error) {
    const timedOut = error.name === "TimeoutError" || error.name === "AbortError";
    throw new GeminiError(
      timedOut ? "Gemini request timed out" : `Gemini request failed: ${error.message}`,
      timedOut ? "TIMEOUT" : "NETWORK",
    );
  }

  if (!response.ok) {
    const detail = await response.json().catch(() => null);
    const message = detail?.error?.message || "no details";
    throw new GeminiError(
      `Gemini request failed (HTTP ${response.status}): ${message}`,
      response.status === 429 ? "RATE_LIMITED" : "REQUEST_FAILED",
      { status: response.status },
    );
  }

  return response.json();
};

const parseResponse = (data) => {
  const blockReason = data?.promptFeedback?.blockReason;
  if (blockReason) {
    throw new GeminiError(`Gemini blocked the prompt (${blockReason})`, "BLOCKED");
  }

  const text = data?.candidates?.[0]?.content?.parts
    ?.map((part) => part.text ?? "")
    .join("")
    .trim();

  if (!text) {
    throw new GeminiError("Gemini returned no content", "BAD_RESPONSE");
  }

  try {
    return JSON.parse(text);
  } catch {
    throw new GeminiError("Gemini returned invalid JSON", "BAD_RESPONSE");
  }
};

const isRetryable = (error) =>
  RETRYABLE_CODES.has(error.code) || RETRYABLE_STATUSES.has(error.status);

/**
 * Asks Gemini for a JSON answer and returns it parsed.
 *
 * - `prompt`: the user text.
 * - `systemInstruction`: optional standing instructions.
 * - `files`: optional inline files as `{ mimeType, data: Buffer }`, e.g. a PDF.
 * - `schema`: response schema in Gemini's OpenAPI-style format (types such as
 *   "OBJECT", "ARRAY", "STRING").
 *
 * Retries once on timeouts, network errors, rate limits and server errors.
 * Throws a GeminiError otherwise.
 */
export const generateStructuredContent = async ({
  systemInstruction,
  prompt,
  files = [],
  schema,
  temperature = 0.2,
  maxOutputTokens = 2048,
}) => {
  if (!isGeminiConfigured()) {
    throw new GeminiError(
      "GEMINI_API_KEY and GEMINI_MODEL must be set",
      "NOT_CONFIGURED",
    );
  }

  const body = buildRequestBody({
    systemInstruction,
    prompt,
    files,
    schema,
    temperature,
    maxOutputTokens,
  });

  for (let attempt = 1; ; attempt += 1) {
    try {
      return parseResponse(await sendRequest(body));
    } catch (error) {
      if (attempt >= MAX_ATTEMPTS || !isRetryable(error)) {
        throw error;
      }

      await wait(RETRY_DELAY_MS);
    }
  }
};
