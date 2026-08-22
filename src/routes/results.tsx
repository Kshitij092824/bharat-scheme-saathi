import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { MessageCircleHeart, RefreshCw, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSaathi } from "@/lib/saathi-store";
import { findSchemes } from "@/lib/saathi-api";
import { hasStructuredCore, situationFromFields, type Scheme } from "@/lib/saathi-types";
import { useSpeechOutput, type SpeechSegment } from "@/lib/use-speech";
import { STRINGS, type Language } from "@/lib/i18n";

export const Route = createFileRoute("/results")({
  head: () => ({
    meta: [
      { title: "Your matched schemes — Bharat Saathi AI" },
      {
        name: "description",
        content:
          "The government welfare schemes Saathi found for you, in plain language, with the documents you will need.",
      },
      { property: "og:title", content: "Your matched schemes — Bharat Saathi AI" },
      {
        property: "og:description",
        content: "Plain-language scheme matches and the documents needed to apply.",
      },
    ],
  }),
  component: ResultsScreen,
});

const EN_SPEECH = "en-IN";
const EN_STRINGS = STRINGS.en;

function pushBilingual(
  segments: SpeechSegment[],
  localText: string,
  enText: string,
  localLang: string,
) {
  const local = localText.trim();
  const en = enText.trim();
  const localIsEnglish = localLang.toLowerCase().startsWith("en");
  if (local) segments.push({ text: local, lang: localLang });
  if (!en) return;
  if (localIsEnglish && en === local) return;
  segments.push({ text: en, lang: EN_SPEECH });
}

function schemeSpeechSegments(
  scheme: Scheme,
  index: number | null,
  language: Language,
  whyLabel: string,
  documentsLabel: string,
): SpeechSegment[] {
  const local = language.speech;
  const segments: SpeechSegment[] = [];
  const prefix = index == null ? "" : `${index + 1}. `;
  pushBilingual(
    segments,
    `${prefix}${scheme.scheme_name_local}`,
    `${prefix}${scheme.scheme_name_en}`,
    local,
  );
  if (scheme.reason_local || scheme.reason_en) {
    pushBilingual(segments, whyLabel, EN_STRINGS.whyYouQualify, local);
    pushBilingual(segments, scheme.reason_local, scheme.reason_en, local);
  }
  if (scheme.required_documents.length > 0) {
    pushBilingual(segments, documentsLabel, EN_STRINGS.documentsNeeded, local);
    for (const doc of scheme.required_documents) {
      pushBilingual(segments, doc.local, doc.en, local);
    }
  }
  return segments;
}

function ResultsScreen() {
  const { t, profile, language, setSchemes, setFollowUp } = useSaathi();
  const navigate = useNavigate();
  const { supported, speaking, speakSegments, stop } = useSpeechOutput(language.speech);
  const [readingId, setReadingId] = useState<string | null>(null);

  useEffect(() => {
    if (!speaking) setReadingId(null);
  }, [speaking]);

  const typed = profile.situation_text.trim();
  const effectiveSituation = typed || situationFromFields(profile);
  const canLookup = typed.length > 0 || hasStructuredCore(profile);

  useEffect(() => {
    if (!canLookup) void navigate({ to: "/talk" });
  }, [canLookup, navigate]);

  const query = useQuery({
    queryKey: ["schemes", effectiveSituation, profile.age, profile.annual_income],
    queryFn: () =>
      findSchemes({
        ...profile,
        situation_text: effectiveSituation,
      }),
    enabled: canLookup && effectiveSituation.length > 0,
    retry: false,
    staleTime: Infinity,
  });

  useEffect(() => {
    if (!query.data) return;
    setSchemes(query.data.schemes);
    setFollowUp(query.data.followUp);
  }, [query.data, setSchemes, setFollowUp]);

  const readAloud = () => {
    const schemes = query.data?.schemes ?? [];
    if (schemes.length === 0) {
      setReadingId("all");
      speakSegments([{ text: t.noMatches, lang: language.speech }]);
      return;
    }
    const segments: SpeechSegment[] = [];
    pushBilingual(segments, t.yourSchemes, EN_STRINGS.yourSchemes, language.speech);
    schemes.forEach((scheme, index) => {
      segments.push(
        ...schemeSpeechSegments(scheme, index, language, t.whyYouQualify, t.documentsNeeded),
      );
    });
    setReadingId("all");
    speakSegments(segments);
  };

  return (
    <main className="saathi-page">
      <h1 className="text-primary">{t.yourSchemes}</h1>

      {query.isPending && (
        <div className="mt-10 flex flex-col items-center text-center">
          <div className="mic-pulse size-24 rounded-full bg-primary/20" aria-hidden />
          <p className="mt-6 text-2xl font-semibold" role="status">
            {t.checking}
          </p>
          <p className="mt-2 text-lg text-muted-foreground">{t.checkingHint}</p>
        </div>
      )}

      {query.isError && (
        <div className="mt-8 rounded-2xl border-2 border-border bg-card p-5 text-center">
          <p className="text-xl">{t.somethingWentWrong}</p>
          <Button size="huge" className="mt-5" onClick={() => void query.refetch()}>
            <RefreshCw aria-hidden />
            {t.tryAgain}
          </Button>
        </div>
      )}

      {query.data && query.data.schemes.length === 0 && (
        <div className="mt-8 rounded-2xl bg-secondary p-5">
          <p className="text-xl font-semibold">{t.noMatches}</p>
          <p className="mt-2 text-lg">{t.noMatchesHint}</p>
        </div>
      )}

      {query.data && query.data.schemes.length > 0 && (
        <>
          {supported && (
            <Button
              size="big"
              variant="calm"
              className="mt-5 w-full"
              onClick={speaking && readingId === "all" ? stop : readAloud}
            >
              {speaking && readingId === "all" ? <VolumeX aria-hidden /> : <Volume2 aria-hidden />}
              {speaking && readingId === "all" ? t.stopReading : t.readAloud}
            </Button>
          )}
          <ul className="mt-6 space-y-5">
            {query.data.schemes.map((scheme) => (
              <li key={scheme.scheme_id}>
                <SchemeCard
                  scheme={scheme}
                  whyLabel={t.whyYouQualify}
                  documentsLabel={t.documentsNeeded}
                  readLabel={t.readAloud}
                  stopLabel={t.stopReading}
                  speaking={speaking && readingId === scheme.scheme_id}
                  speechSupported={supported}
                  onRead={() => {
                    setReadingId(scheme.scheme_id);
                    speakSegments(
                      schemeSpeechSegments(
                        scheme,
                        null,
                        language,
                        t.whyYouQualify,
                        t.documentsNeeded,
                      ),
                    );
                  }}
                  onStop={stop}
                />
              </li>
            ))}
          </ul>
        </>
      )}

      {!query.isPending && (
        <Button size="huge" className="mt-8" onClick={() => void navigate({ to: "/talk" })}>
          <MessageCircleHeart aria-hidden />
          {t.askAgain}
        </Button>
      )}
    </main>
  );
}

function SchemeCard({
  scheme,
  whyLabel,
  documentsLabel,
  readLabel,
  stopLabel,
  speaking,
  speechSupported,
  onRead,
  onStop,
}: {
  scheme: Scheme;
  whyLabel: string;
  documentsLabel: string;
  readLabel: string;
  stopLabel: string;
  speaking: boolean;
  speechSupported: boolean;
  onRead: () => void;
  onStop: () => void;
}) {
  const showEnglishName =
    scheme.scheme_name_en.length > 0 && scheme.scheme_name_en !== scheme.scheme_name_local;
  const showEnglishReason =
    scheme.reason_en.length > 0 && scheme.reason_en !== scheme.reason_local;
  const hasReason = scheme.reason_local.length > 0 || scheme.reason_en.length > 0;

  return (
    <article className="rounded-2xl border-2 border-border bg-card p-5 shadow-sm">
      <h2 className="text-2xl font-bold leading-snug text-primary">{scheme.scheme_name_local}</h2>
      {showEnglishName && (
        <p className="mt-1 text-base font-medium text-muted-foreground">{scheme.scheme_name_en}</p>
      )}
      {hasReason && (
        <>
          <p className="mt-3 text-base font-semibold text-muted-foreground">{whyLabel}</p>
          <p className="mt-1 text-xl">{scheme.reason_local || scheme.reason_en}</p>
          {showEnglishReason && (
            <p className="mt-1 text-base text-muted-foreground">{scheme.reason_en}</p>
          )}
        </>
      )}

      {scheme.required_documents.length > 0 && (
        <div className="mt-4 border-t-2 border-border pt-4">
          <h3 className="text-lg font-semibold">{documentsLabel}</h3>
          <ul className="mt-3 list-disc space-y-3 pl-6">
            {scheme.required_documents.map((doc, index) => {
              const showEn = doc.en.length > 0 && doc.en !== doc.local;
              return (
                <li key={`${scheme.scheme_id}-doc-${index}`}>
                  <span className="block text-xl font-medium">{doc.local}</span>
                  {showEn && (
                    <span className="block text-base text-muted-foreground">{doc.en}</span>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {speechSupported && (
        <Button size="big" variant="calm" className="mt-5 w-full" onClick={speaking ? onStop : onRead}>
          {speaking ? <VolumeX aria-hidden /> : <Volume2 aria-hidden />}
          {speaking ? stopLabel : readLabel}
        </Button>
      )}
    </article>
  );
}
