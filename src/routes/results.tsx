import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { ChevronDown, MessageCircleHeart, RefreshCw, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSaathi } from "@/lib/saathi-store";
import { findSchemes } from "@/lib/saathi-api";
import { useSpeechOutput, type SpeechSegment } from "@/lib/use-speech";
import { cn } from "@/lib/utils";
import type { Scheme } from "@/lib/saathi-types";

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

function ResultsScreen() {
  const { t, profile, language, setSchemes, setFollowUp } = useSaathi();
  const navigate = useNavigate();
  const { supported, speaking, speakSegments, stop } = useSpeechOutput(language.speech);

  const situation = profile.situation_text.trim();

  useEffect(() => {
    if (!situation) void navigate({ to: "/talk" });
  }, [situation, navigate]);

  const query = useQuery({
    queryKey: ["schemes", situation, profile.age, profile.annual_income],
    queryFn: () => findSchemes(profile),
    enabled: situation.length > 0,
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
      speakSegments([{ text: t.noMatches, lang: language.speech }]);
      return;
    }
    const local = language.speech;
    const segments: SpeechSegment[] = [{ text: t.yourSchemes, lang: local }];
    schemes.forEach((scheme, index) => {
      segments.push({ text: `${index + 1}. ${scheme.scheme_name_local}`, lang: local });
      if (scheme.scheme_name_en && scheme.scheme_name_en !== scheme.scheme_name_local) {
        segments.push({ text: scheme.scheme_name_en, lang: EN_SPEECH });
      }
      if (scheme.reason) {
        segments.push({ text: t.whyYouQualify, lang: local });
        segments.push({ text: scheme.reason, lang: local });
        segments.push({ text: scheme.reason, lang: EN_SPEECH });
      }
      if (scheme.required_documents.length > 0) {
        segments.push({ text: t.documentsNeeded, lang: local });
        for (const doc of scheme.required_documents) {
          segments.push({ text: doc.local, lang: local });
          if (doc.en && doc.en !== doc.local) segments.push({ text: doc.en, lang: EN_SPEECH });
        }
      }
    });
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
              onClick={speaking ? stop : readAloud}
            >
              {speaking ? <VolumeX aria-hidden /> : <Volume2 aria-hidden />}
              {speaking ? t.stopReading : t.readAloud}
            </Button>
          )}
          <ul className="mt-6 space-y-5">
            {query.data.schemes.map((scheme) => (
              <li key={scheme.scheme_id}>
                <SchemeCard
                  scheme={scheme}
                  whyLabel={t.whyYouQualify}
                  documentsLabel={t.documentsNeeded}
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
}: {
  scheme: Scheme;
  whyLabel: string;
  documentsLabel: string;
}) {
  const [open, setOpen] = useState(false);
  const showEnglishName =
    scheme.scheme_name_en.length > 0 && scheme.scheme_name_en !== scheme.scheme_name_local;

  return (
    <article className="rounded-2xl border-2 border-border bg-card p-5 shadow-sm">
      <h2 className="text-primary">{scheme.scheme_name_local}</h2>
      {showEnglishName && (
        <p className="mt-1 text-lg font-semibold text-muted-foreground">{scheme.scheme_name_en}</p>
      )}
      <p className="mt-3 text-base font-semibold text-muted-foreground">{whyLabel}</p>
      <p className="mt-1 text-xl">{scheme.reason}</p>

      {scheme.required_documents.length > 0 && (
        <div className="mt-4 border-t-2 border-border pt-2">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            className="flex min-h-14 w-full items-center justify-between gap-3 text-left text-lg font-semibold"
          >
            {documentsLabel}
            <ChevronDown
              aria-hidden
              className={cn("size-7 transition-transform", open && "rotate-180")}
            />
          </button>
          {open && (
            <ul className="mt-2 list-disc space-y-3 pl-6 text-xl">
              {scheme.required_documents.map((doc, index) => (
                <li key={`${scheme.scheme_id}-doc-${index}`}>
                  <span className="block">{doc.local}</span>
                  {doc.en && doc.en !== doc.local && (
                    <span className="block text-base text-muted-foreground">{doc.en}</span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </article>
  );
}
