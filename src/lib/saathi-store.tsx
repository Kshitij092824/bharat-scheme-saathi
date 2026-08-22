import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { LANGUAGES, getStrings, type Language, type LanguageCode, type Strings } from "./i18n";
import type { CitizenProfile, Scheme } from "./saathi-types";

interface SaathiState {
  language: Language;
  setLanguage: (code: LanguageCode) => void;
  t: Strings;
  profile: CitizenProfile;
  updateProfile: (patch: { [K in keyof CitizenProfile]?: CitizenProfile[K] | undefined }) => void;
  schemes: Scheme[] | null;
  setSchemes: (schemes: Scheme[] | null) => void;
  followUp: boolean;
  setFollowUp: (value: boolean) => void;
}

const SaathiContext = createContext<SaathiState | null>(null);

export function SaathiProvider({ children }: { children: ReactNode }) {
  const [code, setCode] = useState<LanguageCode>("en");
  const [profile, setProfile] = useState<CitizenProfile>({ situation_text: "" });
  const [schemes, setSchemes] = useState<Scheme[] | null>(null);
  const [followUp, setFollowUp] = useState(false);

  const value = useMemo<SaathiState>(() => {
    const language: Language =
      LANGUAGES.find((l) => l.code === code) ??
      ({ code: "en", label: "English", english: "English", speech: "en-IN" } as Language);
    return {
      language,
      setLanguage: setCode,
      t: getStrings(code),
      profile,
      updateProfile: (patch) => setProfile((prev) => ({ ...prev, ...patch })),
      schemes,
      setSchemes,
      followUp,
      setFollowUp,
    };
  }, [code, profile, schemes, followUp]);

  return <SaathiContext.Provider value={value}>{children}</SaathiContext.Provider>;
}

export function useSaathi(): SaathiState {
  const ctx = useContext(SaathiContext);
  if (!ctx) throw new Error("useSaathi must be used inside SaathiProvider");
  return ctx;
}
