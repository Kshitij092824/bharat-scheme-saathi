import type { CitizenProfile, Scheme } from "./saathi-types";

/**
 * The n8n webhook URL. Set VITE_N8N_WEBHOOK_URL in the project environment.
 * Until it is set, the app runs in demo mode and returns illustrative results
 * so the flow can still be walked through end to end.
 */
export const WEBHOOK_URL: string =
  (import.meta.env["VITE_N8N_WEBHOOK_URL"] as string | undefined)?.trim() || "";

export const isWebhookConfigured = () => WEBHOOK_URL.length > 0;

/** Result of a scheme lookup. `followUp` lets the backend flag a wellbeing check-in. */
export interface SchemeLookupResult {
  schemes: Scheme[];
  followUp: boolean;
  demo: boolean;
}

function cleanPayload(profile: CitizenProfile): Record<string, unknown> {
  const body: Record<string, unknown> = { situation_text: profile.situation_text };
  const keys = [
    "name",
    "age",
    "gender",
    "is_widow",
    "disability_percent",
    "is_bpl",
    "annual_income",
    "phone",
    "family_contact_name",
    "family_contact_phone",
  ] as const;
  for (const key of keys) {
    const value = profile[key];
    if (value === undefined || value === null || value === "") continue;
    if (typeof value === "number" && Number.isNaN(value)) continue;
    body[key] = value;
  }
  return body;
}

function toBilingual(item: unknown): BilingualText {
  if (typeof item === "string") return { local: item, en: item };
  const d = (item ?? {}) as Record<string, unknown>;
  const en = String(d["en"] ?? d["english"] ?? "").trim();
  const local = String(d["local"] ?? d["name_local"] ?? "").trim();
  return { local: local || en, en: en || local };
}

function normalise(raw: unknown): Scheme[] {
  const list = Array.isArray(raw)
    ? raw
    : Array.isArray((raw as { schemes?: unknown })?.schemes)
      ? ((raw as { schemes: unknown[] }).schemes as unknown[])
      : Array.isArray((raw as { data?: unknown })?.data)
        ? ((raw as { data: unknown[] }).data as unknown[])
        : [];

  return list
    .map((item, index) => {
      const s = (item ?? {}) as Record<string, unknown>;
      const docs = s["required_documents"];
      const legacyName = String(s["scheme_name"] ?? "").trim();
      const nameEn = String(s["scheme_name_en"] ?? legacyName).trim();
      const nameLocal = String(s["scheme_name_local"] ?? legacyName || nameEn).trim();
      return {
        scheme_id: String(s["scheme_id"] ?? `scheme-${index}`),
        scheme_name_en: nameEn || nameLocal,
        scheme_name_local: nameLocal || nameEn,
        reason: String(s["reason"] ?? "").trim(),
        required_documents: Array.isArray(docs) ? docs.map(toBilingual) : [],
      } satisfies Scheme;
    })
    .filter((s) => s.scheme_name_local.length > 0 || s.scheme_name_en.length > 0);
}

const DEMO_SCHEMES: Scheme[] = [
  {
    scheme_id: "demo-ipgs",
    scheme_name_en: "Indira Gandhi National Old Age Pension",
    scheme_name_local: "इंदिरा गांधी राष्ट्रीय वृद्धावस्था पेंशन",
    reason: "You are above 60 years of age and told us money is tight at home.",
    required_documents: [
      { en: "Aadhaar card", local: "आधार कार्ड" },
      { en: "Age proof", local: "वयाचा पुरावा" },
      { en: "Bank passbook", local: "बँक पासबुक" },
      { en: "BPL ration card", local: "बीपीएल शिधापत्रिका" },
    ],
  },
  {
    scheme_id: "demo-ayushman",
    scheme_name_en: "Ayushman Bharat health cover",
    scheme_name_local: "आयुष्मान भारत आरोग्य विमा",
    reason: "Your family income is low, so hospital treatment can be free for you.",
    required_documents: [
      { en: "Aadhaar card", local: "आधार कार्ड" },
      { en: "Ration card", local: "शिधापत्रिका" },
      { en: "Mobile number", local: "मोबाईल क्रमांक" },
    ],
  },
];

export async function findSchemes(profile: CitizenProfile): Promise<SchemeLookupResult> {
  if (!isWebhookConfigured()) {
    await new Promise((r) => setTimeout(r, 1600));
    return { schemes: DEMO_SCHEMES, followUp: false, demo: true };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 120_000);
  try {
    const response = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(cleanPayload(profile)),
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`Request failed with status ${response.status}`);
    const text = await response.text();
    const raw: unknown = text ? JSON.parse(text) : [];
    const followUp = Boolean(
      !Array.isArray(raw) && (raw as { follow_up?: unknown; needs_follow_up?: unknown })
        ? ((raw as { follow_up?: unknown }).follow_up ??
          (raw as { needs_follow_up?: unknown }).needs_follow_up)
        : false,
    );
    return { schemes: normalise(raw), followUp, demo: false };
  } finally {
    clearTimeout(timer);
  }
}
