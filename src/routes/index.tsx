import { createFileRoute, useNavigate } from "@tanstack/react-router";
import saathiIcon from "@/assets/saathi-icon.png";
import { Button } from "@/components/ui/button";
import { LANGUAGES, type LanguageCode } from "@/lib/i18n";
import { useSaathi } from "@/lib/saathi-store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Bharat Saathi AI — Find the schemes you deserve" },
      {
        name: "description",
        content:
          "A simple, voice-first helper for elderly Indians: speak in your language and find the government welfare schemes you qualify for.",
      },
      { property: "og:title", content: "Bharat Saathi AI — Find the schemes you deserve" },
      {
        property: "og:description",
        content:
          "Speak in your language and Saathi finds the government welfare schemes you may qualify for.",
      },
    ],
  }),
  component: WelcomeScreen,
});

function WelcomeScreen() {
  const { setLanguage, t } = useSaathi();
  const navigate = useNavigate();

  const choose = (code: LanguageCode) => {
    setLanguage(code);
    void navigate({ to: "/talk" });
  };

  return (
    <main className="saathi-page">
      <div className="flex flex-col items-center text-center">
        <img
          src={saathiIcon}
          alt="Two hands holding a marigold flower"
          width={512}
          height={512}
          className="size-40 sm:size-48"
        />
        <h1 className="mt-2 text-4xl text-primary">Bharat Saathi AI</h1>
        <p className="mt-2 text-xl text-muted-foreground">{t.tagline}</p>
      </div>

      <h2 className="mt-10 text-center">{t.chooseLanguage} / अपनी भाषा चुनें</h2>

      <ul className="mt-5 grid gap-4 sm:grid-cols-2">
        {LANGUAGES.map((language) => (
          <li key={language.code}>
            <Button
              variant="calm"
              size="huge"
              className="flex-col gap-0 leading-tight"
              onClick={() => choose(language.code)}
            >
              <span className="text-3xl">{language.label}</span>
              <span className="text-base font-medium text-muted-foreground">
                {language.english}
              </span>
            </Button>
          </li>
        ))}
      </ul>
    </main>
  );
}
