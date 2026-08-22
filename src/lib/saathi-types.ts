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
