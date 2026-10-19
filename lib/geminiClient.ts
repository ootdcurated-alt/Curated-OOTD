const GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta";

const PREFERRED_MODELS = [
  "gemini-2.5-flash-lite",
  "gemini-3.6-flash",
  "gemini-3.5-flash",
  "gemini-3.8-flash",
  "gemini-3.1-flash-lite-preview",
  "gemini-flash-latest",
];

let cachedModelNames: string[] | null = null;
let cacheExpiresAt = 0;

function geminiHeaders(apiKey: string): HeadersInit {
  return {
    "Content-Type": "application/json",
    "x-goog-api-key": apiKey,
  };
}

async function listModelNames(apiKey: string): Promise<string[]> {
  if (cachedModelNames && Date.now() < cacheExpiresAt) {
    return cachedModelNames;
  }

  try {
    const res = await fetch(`${GEMINI_BASE}/models`, {
      headers: geminiHeaders(apiKey),
      signal: AbortSignal.timeout(12000),
    });
    if (!res.ok) return [];

    const data = (await res.json()) as {
      models?: Array<{
        name?: string;
        supportedGenerationMethods?: string[];
      }>;
    };

    const names =
      data.models
        ?.filter((m) => m.supportedGenerationMethods?.includes("generateContent"))
        .map((m) => (m.name || "").replace(/^models\//, ""))
        .filter(Boolean) ?? [];

    cachedModelNames = names;
    cacheExpiresAt = Date.now() + 10 * 60 * 1000;
    return names;
  } catch {
    return [];
  }
}

async function resolveModelOrder(apiKey: string, envModel?: string): Promise<string[]> {
  const fromApi = await listModelNames(apiKey);
  const ordered: string[] = [];

  const pushUnique = (id?: string) => {
    if (!id || ordered.includes(id)) return;
    if (fromApi.length > 0 && !fromApi.includes(id)) return;
    ordered.push(id);
  };

  pushUnique(envModel?.trim());
  for (const id of PREFERRED_MODELS) pushUnique(id);
  for (const id of fromApi) {
    if (id.includes("flash") && !id.includes("embedding") && !id.includes("tts")) {
      pushUnique(id);
    }
  }

  if (ordered.length === 0) {
    return [...PREFERRED_MODELS];
  }
  return ordered;
}

export async function generateGeminiText(
  apiKey: string,
  prompt: string,
  envModel?: string
): Promise<{ text: string; model: string } | null> {
  const key = apiKey.trim();
  if (!key) return null;

  const models = await resolveModelOrder(key, envModel);

  for (const model of models) {
    const url = `${GEMINI_BASE}/models/${model}:generateContent`;

    for (const useJsonMime of [true, false]) {
      for (let attempt = 0; attempt < 3; attempt++) {
        const generationConfig: Record<string, unknown> = {
          temperature: 0.45,
          maxOutputTokens: 2048,
        };
        if (useJsonMime) {
          generationConfig.responseMimeType = "application/json";
        }

        const res = await fetch(url, {
          method: "POST",
          headers: geminiHeaders(key),
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig,
          }),
          signal: AbortSignal.timeout(28000),
        });

        if (res.ok) {
          const data = await res.json();
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
          if (text) return { text, model };
          break;
        }

        const errBody = await res.text();
        const retryable = res.status === 503 || res.status === 429;
        console.error(
          `Gemini (${model}, json=${useJsonMime}, attempt ${attempt + 1}, ${res.status}):`,
          errBody.slice(0, 400)
        );

        if (res.status === 400 && useJsonMime) break;

        if (retryable && attempt < 2) {
          await new Promise((r) => setTimeout(r, 700 * (attempt + 1)));
          continue;
        }
        break;
      }
    }
  }

  return null;
}
