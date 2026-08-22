export interface CitizenProfile {
  name?: string | undefined;
  age?: number | undefined;
  gender?: string | undefined;
  is_widow?: boolean | undefined;
  disability_percent?: number | undefined;
  is_bpl?: boolean | undefined;
  annual_income?: number | undefined;
  phone?: string | undefined;
  family_contact_name?: string | undefined;
  family_contact_phone?: string | undefined;
  situation_text: string;
}

/** True when Name and Age are filled — enough to submit without free-text. */
export function hasStructuredCore(profile: CitizenProfile): boolean {
  const name = profile.name?.trim() ?? "";
  return name.length > 0 && typeof profile.age === "number" && !Number.isNaN(profile.age);
}

/**
 * Build a short English situation_text from structured fields so the backend
 * still receives a usable description when the citizen never typed or spoke.
 */
export function situationFromFields(profile: CitizenProfile): string {
  const parts: string[] = [];
  if (typeof profile.age === "number" && !Number.isNaN(profile.age)) {
    parts.push(`${profile.age} year old`);
  }
  if (profile.gender) parts.push(profile.gender);
  if (profile.is_widow === true) parts.push("widow");
  if (typeof profile.disability_percent === "number" && profile.disability_percent > 0) {
    parts.push(`${profile.disability_percent}% disability`);
  }
  if (profile.is_bpl === true) parts.push("BPL");
  if (typeof profile.annual_income === "number" && !Number.isNaN(profile.annual_income)) {
    parts.push(`annual income ₹${profile.annual_income.toLocaleString("en-IN")}`);
  }
  if (profile.name?.trim()) parts.push(`name ${profile.name.trim()}`);
  return parts.join(", ");
}

/** A document name in the citizen's language and in English. */
export interface BilingualText {
  local: string;
  en: string;
}

export interface Scheme {
  scheme_id: string;
  /** English scheme name. */
  scheme_name_en: string;
  /** Scheme name in the citizen's language (falls back to English). */
  scheme_name_local: string;
  reason: string;
  required_documents: BilingualText[];
}
