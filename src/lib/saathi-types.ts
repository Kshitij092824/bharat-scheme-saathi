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

export interface Scheme {
  scheme_id: string;
  scheme_name: string;
  reason: string;
  required_documents: string[];
}
