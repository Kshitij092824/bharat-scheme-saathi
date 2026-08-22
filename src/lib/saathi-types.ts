export interface CitizenProfile {
  name?: string;
  age?: number;
  gender?: string;
  is_widow?: boolean;
  disability_percent?: number;
  is_bpl?: boolean;
  annual_income?: number;
  phone?: string;
  family_contact_name?: string;
  family_contact_phone?: string;
  situation_text: string;
}

export interface Scheme {
  scheme_id: string;
  scheme_name: string;
  reason: string;
  required_documents: string[];
}
