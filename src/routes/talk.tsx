import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback, useState } from "react";
import { ChevronDown, Mic, Search, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSaathi } from "@/lib/saathi-store";
import { savePhone } from "@/lib/saathi-phone";
import { hasStructuredCore, situationFromFields } from "@/lib/saathi-types";
import { useSpeechInput } from "@/lib/use-speech";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/talk")({
  head: () => ({
    meta: [
      { title: "Talk to Saathi — Bharat Saathi AI" },
      {
        name: "description",
        content:
          "Speak or type your situation and Saathi will look for government welfare schemes you may qualify for.",
      },
      { property: "og:title", content: "Talk to Saathi — Bharat Saathi AI" },
      {
        property: "og:description",
        content: "Speak or type your situation and Saathi will look for schemes you qualify for.",
      },
    ],
  }),
  component: TalkScreen,
});

function TalkScreen() {
  const { t, language, profile, updateProfile, setSchemes } = useSaathi();
  const navigate = useNavigate();
  const [showDetails, setShowDetails] = useState(true);
  const [warning, setWarning] = useState(false);

  const onText = useCallback(
    (text: string) => {
      updateProfile({
        situation_text: profile.situation_text ? `${profile.situation_text} ${text}` : text,
      });
      setWarning(false);
    },
    [profile.situation_text, updateProfile],
  );

  const { supported, listening, start, stop } = useSpeechInput(language.speech, onText);

  const submit = () => {
    const typed = profile.situation_text.trim();
    const structuredOk = hasStructuredCore(profile);
    if (!typed && !structuredOk) {
      setWarning(true);
      return;
    }
    if (!typed && structuredOk) {
      updateProfile({ situation_text: situationFromFields(profile) });
    }
    savePhone(profile.phone ?? "");
    setSchemes(null);
    void navigate({ to: "/results" });
  };

  return (
    <main className="saathi-page">
      <h1 className="text-primary">{t.appName}</h1>
      <p className="mt-3 rounded-2xl bg-secondary p-4 text-xl">{t.talkPrompt}</p>

      <div className="mt-8 flex flex-col items-center">
        <button
          type="button"
          onClick={listening ? stop : start}
          disabled={!supported}
          aria-pressed={listening}
          className={cn(
            "flex size-32 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform active:scale-95 disabled:opacity-50",
            listening && "mic-pulse bg-destructive",
          )}
        >
          {listening ? (
            <Square aria-hidden className="size-14" fill="currentColor" />
          ) : (
            <Mic aria-hidden className="size-16" />
          )}
        </button>
        <p className="mt-3 text-xl font-semibold">
          {listening ? t.listening : supported ? t.tapAndSpeak : t.voiceNotAvailable}
        </p>
      </div>

      <div className="mt-8">
        <label htmlFor="situation" className="text-lg font-semibold">
          {t.tellUsSomething}
        </label>
        <textarea
          id="situation"
          rows={5}
          className="field-big mt-2"
          placeholder={t.orType}
          value={profile.situation_text}
          onChange={(event) => {
            updateProfile({ situation_text: event.target.value });
            setWarning(false);
          }}
        />
      </div>

      <div className="mt-8 flex items-center gap-4" role="separator" aria-label={t.orDivider}>
        <span className="h-0.5 flex-1 bg-border" />
        <span className="text-lg font-bold tracking-wide text-muted-foreground">{t.orDivider}</span>
        <span className="h-0.5 flex-1 bg-border" />
      </div>

      <div className="mt-6 rounded-2xl border-2 border-border bg-card">
        <button
          type="button"
          onClick={() => setShowDetails((v) => !v)}
          aria-expanded={showDetails}
          className="flex min-h-16 w-full items-center justify-between gap-3 px-4 py-3 text-left text-lg font-semibold"
        >
          {t.moreAboutYou}
          <ChevronDown
            aria-hidden
            className={cn("size-7 transition-transform", showDetails && "rotate-180")}
          />
        </button>

        {showDetails && (
          <div className="space-y-5 border-t-2 border-border px-4 py-5">
            <p className="text-base text-muted-foreground">{t.moreAboutYouHint}</p>

            <TextField
              label={t.name}
              value={profile.name ?? ""}
              onChange={(v) => {
                updateProfile({ name: v });
                setWarning(false);
              }}
            />
            <NumberField
              label={t.age}
              value={profile.age}
              onChange={(v) => {
                updateProfile({ age: v });
                setWarning(false);
              }}
            />
            <ChoiceField
              label={t.gender}
              value={profile.gender}
              options={[
                { value: "female", label: t.female },
                { value: "male", label: t.male },
                { value: "other", label: t.other },
              ]}
              onChange={(v) => updateProfile({ gender: v })}
            />
            <YesNoField
              label={t.widow}
              yes={t.yes}
              no={t.no}
              value={profile.is_widow}
              onChange={(v) => updateProfile({ is_widow: v })}
            />
            <NumberField
              label={t.disabilityPercent}
              value={profile.disability_percent}
              onChange={(v) => updateProfile({ disability_percent: v })}
            />
            <YesNoField
              label={t.bpl}
              yes={t.yes}
              no={t.no}
              value={profile.is_bpl}
              onChange={(v) => updateProfile({ is_bpl: v })}
            />
            <NumberField
              label={t.annualIncome}
              value={profile.annual_income}
              onChange={(v) => updateProfile({ annual_income: v })}
            />
            <TextField
              label={t.phone}
              type="tel"
              value={profile.phone ?? ""}
              onChange={(v) => updateProfile({ phone: v })}
            />
            <TextField
              label={t.familyContactName}
              value={profile.family_contact_name ?? ""}
              onChange={(v) => updateProfile({ family_contact_name: v })}
            />
            <TextField
              label={t.familyContactPhone}
              type="tel"
              value={profile.family_contact_phone ?? ""}
              onChange={(v) => updateProfile({ family_contact_phone: v })}
            />
          </div>
        )}
      </div>

      {warning && <p className="mt-5 text-lg font-semibold text-destructive">{t.needSomething}</p>}

      <Button size="huge" className="mt-6" onClick={submit}>
        <Search aria-hidden />
        {t.findSchemes}
      </Button>
    </main>
  );
}

function TextField({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <div>
      <label className="text-lg font-semibold">
        {label}
        <input
          type={type}
          className="field-big mt-2"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </label>
    </div>
  );
}

function NumberField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number | undefined;
  onChange: (value: number | undefined) => void;
}) {
  return (
    <div>
      <label className="text-lg font-semibold">
        {label}
        <input
          type="number"
          inputMode="numeric"
          className="field-big mt-2"
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value === "" ? undefined : Number(e.target.value))}
        />
      </label>
    </div>
  );
}

function ChoiceField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string | undefined;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}) {
  return (
    <fieldset>
      <legend className="text-lg font-semibold">{label}</legend>
      <div className="mt-2 flex flex-wrap gap-3">
        {options.map((option) => (
          <Button
            key={option.value}
            type="button"
            size="big"
            variant={value === option.value ? "default" : "calm"}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </Button>
        ))}
      </div>
    </fieldset>
  );
}

function YesNoField({
  label,
  yes,
  no,
  value,
  onChange,
}: {
  label: string;
  yes: string;
  no: string;
  value: boolean | undefined;
  onChange: (value: boolean) => void;
}) {
  return (
    <fieldset>
      <legend className="text-lg font-semibold">{label}</legend>
      <div className="mt-2 flex gap-3">
        <Button
          type="button"
          size="big"
          variant={value === true ? "default" : "calm"}
          onClick={() => onChange(true)}
        >
          {yes}
        </Button>
        <Button
          type="button"
          size="big"
          variant={value === false ? "default" : "calm"}
          onClick={() => onChange(false)}
        >
          {no}
        </Button>
      </div>
    </fieldset>
  );
}
