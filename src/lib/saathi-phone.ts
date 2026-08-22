export const SAATHI_PHONE_KEY = "saathi_phone";

export function getSavedPhone(): string {
  if (typeof window === "undefined") return "";
  try {
    return window.localStorage.getItem(SAATHI_PHONE_KEY)?.trim() ?? "";
  } catch {
    return "";
  }
}

export function savePhone(phone: string): void {
  if (typeof window === "undefined") return;
  const value = phone.trim();
  if (!value) return;
  try {
    window.localStorage.setItem(SAATHI_PHONE_KEY, value);
  } catch {
    /* private mode / quota — ignore */
  }
}
