import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { MessageCircle, MessageSquareHeart, PhoneCall, Search, Smile } from "lucide-react";
import { Button } from "@/components/ui/button";
import { lookupCitizen, type CitizenLookup } from "@/lib/saathi-api";
import { getSavedPhone } from "@/lib/saathi-phone";
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
  return ios ? `sms:${number}&body=${encoded}` : `sms:${number}?body=${encoded}`;
}

function whatsappHref(phone: string, body: string): string {
  let digits = phone.replace(/\D/g, "");
  if (digits.length === 10) digits = `91${digits}`;
  if (digits.length === 11 && digits.startsWith("0")) digits = `91${digits.slice(1)}`;
  return `https://wa.me/${digits}?text=${encodeURIComponent(body)}`;
}

function hasLookupDetails(row: CitizenLookup | undefined): boolean {
  if (!row) return false;
  return Boolean(row.name || row.family_contact_name || row.family_contact_phone);
}

function CheckInScreen() {
  const { t, profile, followUp } = useSaathi();
  const [mood, setMood] = useState<"well" | "help" | null>(followUp ? "help" : null);
  const [savedPhone, setSavedPhone] = useState("");
  const [phoneInput, setPhoneInput] = useState("");
  const [manualPhone, setManualPhone] = useState("");

  useEffect(() => {
    setSavedPhone(getSavedPhone());
  }, []);

  const autoLookup = useQuery({
    queryKey: ["citizen-lookup", "auto", savedPhone],
    queryFn: () => lookupCitizen(savedPhone),
    enabled: savedPhone.length > 0,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  const manualLookup = useQuery({
    queryKey: ["citizen-lookup", "manual", manualPhone],
    queryFn: () => lookupCitizen(manualPhone),
    enabled: manualPhone.length > 0,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  const usingManual = manualPhone.length > 0;
  const lookup: CitizenLookup | undefined = usingManual ? manualLookup.data : autoLookup.data;

  const citizenName = usingManual
    ? lookup?.name?.trim() || undefined
    : lookup?.name?.trim() || profile.name?.trim() || undefined;
  const familyName = usingManual
    ? lookup?.family_contact_name?.trim() || ""
    : lookup?.family_contact_name?.trim() || profile.family_contact_name?.trim() || "";
  const familyPhone = usingManual
    ? lookup?.family_contact_phone?.trim() || ""
    : lookup?.family_contact_phone?.trim() || profile.family_contact_phone?.trim() || "";

  const showHelp = mood === "help";
  const hasFamilyContact = familyName.length > 0 && familyPhone.length > 0;
  const message = t.notifyMessage(citizenName);
  const manualPending = usingManual && manualLookup.isFetching;
  const manualMissed =
    usingManual && manualLookup.isSuccess && !hasLookupDetails(manualLookup.data);
  const manualFailed = usingManual && manualLookup.isError;

  const findCitizen = () => {
    const phone = phoneInput.trim();
    if (!phone) return;
    setManualPhone(phone);
  };

  return (
    <main className="saathi-page">
      <h1 className="text-primary">{t.checkIn}</h1>
      <p className="mt-3 text-2xl">{t.checkInGreeting(citizenName)}</p>

      <form
        className="mt-6 rounded-2xl border-2 border-border bg-card p-4"
        onSubmit={(event) => {
          event.preventDefault();
          findCitizen();
        }}
      >
        <label htmlFor="citizen-lookup-phone" className="text-lg font-semibold">
          {t.lookUpCitizen}
        </label>
        <p className="mt-1 text-base text-muted-foreground">{t.lookUpCitizenHint}</p>
        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-stretch">
          <input
            id="citizen-lookup-phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            className="field-big"
            placeholder={t.phone}
            value={phoneInput}
            onChange={(event) => setPhoneInput(event.target.value)}
          />
          <Button type="submit" size="big" className="shrink-0 sm:min-w-28" disabled={manualPending}>
            <Search aria-hidden />
            {t.findCitizen}
          </Button>
        </div>
        {manualPending && <p className="mt-3 text-lg">{t.checking}</p>}
        {manualMissed && (
          <p className="mt-3 text-lg font-semibold text-destructive">{t.citizenNotFound}</p>
        )}
        {manualFailed && (
          <p className="mt-3 text-lg font-semibold text-destructive">{t.somethingWentWrong}</p>
        )}
      </form>

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
