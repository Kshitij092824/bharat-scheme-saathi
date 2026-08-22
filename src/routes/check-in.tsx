import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { MessageCircle, MessageSquareHeart, PhoneCall, Smile } from "lucide-react";
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

function smsHref(phone: string, body: string): string {
  const number = phone.replace(/[^\d+]/g, "");
  const encoded = encodeURIComponent(body);
  const ios =
    typeof navigator !== "undefined" && /iPad|iPhone|iPod/i.test(navigator.userAgent);
  // iOS uses &body; Android uses ?body.
  return ios ? `sms:${number}&body=${encoded}` : `sms:${number}?body=${encoded}`;
}

function whatsappHref(phone: string, body: string): string {
  let digits = phone.replace(/\D/g, "");
  if (digits.length === 10) digits = `91${digits}`;
  if (digits.length === 11 && digits.startsWith("0")) digits = `91${digits.slice(1)}`;
  return `https://wa.me/${digits}?text=${encodeURIComponent(body)}`;
}

function CheckInScreen() {
  const { t, profile, followUp } = useSaathi();
  const [mood, setMood] = useState<"well" | "help" | null>(followUp ? "help" : null);

  const showHelp = mood === "help";
  const familyName = profile.family_contact_name?.trim() ?? "";
  const familyPhone = profile.family_contact_phone?.trim() ?? "";
  const hasFamilyContact = familyName.length > 0 && familyPhone.length > 0;
  const message = t.notifyMessage(profile.name?.trim());

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

          {hasFamilyContact && (
            <>
              <Button asChild size="huge" variant="calm" className="mt-4">
                <a href={smsHref(familyPhone, message)}>
                  <MessageSquareHeart aria-hidden />
                  {t.notify(familyName)}
                </a>
              </Button>
              <Button asChild size="huge" variant="calm" className="mt-4">
                <a href={whatsappHref(familyPhone, message)} target="_blank" rel="noreferrer">
                  <MessageCircle aria-hidden />
                  {t.notifyWhatsApp(familyName)}
                </a>
              </Button>
            </>
          )}
        </section>
      )}
    </main>
  );
}
