import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { MessageSquareHeart, PhoneCall, Smile } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSaathi } from "@/lib/saathi-store";

export const Route = createFileRoute("/check-in")({
  head: () => ({
    meta: [
      { title: "Saathi Check-In — a friendly hello every day" },
      {
        name: "description",
        content:
          "A gentle daily check-in for elders living alone, with one-tap access to India's Elder Line 14567 and a message to family.",
      },
      { property: "og:title", content: "Saathi Check-In — a friendly hello every day" },
      {
        property: "og:description",
        content: "Tell Saathi how you feel today, and reach help or family with one tap.",
      },
    ],
  }),
  component: CheckInScreen,
});

function CheckInScreen() {
  const { t, profile, followUp } = useSaathi();
  const [mood, setMood] = useState<"well" | "help" | null>(followUp ? "help" : null);

  const showHelp = mood === "help";
  const familyName = profile.family_contact_name?.trim();
  const familyPhone = profile.family_contact_phone?.trim();

  const smsHref = familyPhone
    ? `sms:${familyPhone}?&body=${encodeURIComponent(t.notifyMessage(profile.name))}`
    : undefined;

  return (
    <main className="saathi-page">
      <h1 className="text-primary">{t.checkIn}</h1>
      <p className="mt-3 text-2xl">{t.checkInGreeting(profile.name)}</p>

      <div className="mt-8 grid gap-4">
        <Button size="huge" variant="leaf" onClick={() => setMood("well")}>
          <Smile aria-hidden />
          {t.imWell}
        </Button>
        <Button size="huge" variant="calm" onClick={() => setMood("help")}>
          <MessageSquareHeart aria-hidden />
          {t.needHelp}
        </Button>
      </div>

      {mood === "well" && (
        <p className="mt-8 rounded-2xl bg-accent p-5 text-xl text-accent-foreground">
          {t.wellReply}
        </p>
      )}

      {showHelp && (
        <section className="mt-8 rounded-2xl border-2 border-primary bg-card p-5">
          <p className="text-xl">{t.helpReply}</p>

          <p className="mt-5 text-lg font-semibold text-muted-foreground">{t.helpline}</p>
          <Button asChild size="huge" className="mt-2">
            <a href="tel:14567">
              <PhoneCall aria-hidden />
              {t.callHelpline}
            </a>
          </Button>

          {familyName && smsHref && (
            <Button asChild size="huge" variant="calm" className="mt-4">
              <a href={smsHref}>
                <MessageSquareHeart aria-hidden />
                {t.notify(familyName)}
              </a>
            </Button>
          )}
        </section>
      )}
    </main>
  );
}
