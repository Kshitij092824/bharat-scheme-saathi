import { useCallback, useEffect, useRef, useState } from "react";

type RecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: unknown) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
};

function getRecognitionCtor(): (new () => RecognitionLike) | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as Record<string, unknown>;
  return ((w["SpeechRecognition"] ?? w["webkitSpeechRecognition"]) as
    | (new () => RecognitionLike)
    | undefined) ?? null;
}

/** Speech-to-text via the browser's Web Speech API. Always optional — never the only path. */
export function useSpeechInput(lang: string, onText: (text: string) => void) {
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const ref = useRef<RecognitionLike | null>(null);

  useEffect(() => {
    setSupported(getRecognitionCtor() !== null);
    return () => {
      ref.current?.abort();
      ref.current = null;
    };
  }, []);

  const stop = useCallback(() => {
    ref.current?.stop();
    setListening(false);
  }, []);

  const start = useCallback(() => {
    const Ctor = getRecognitionCtor();
    if (!Ctor) return;
    ref.current?.abort();
    const recognition = new Ctor();
    recognition.lang = lang;
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onresult = (event: unknown) => {
      const results = (event as { results?: ArrayLike<ArrayLike<{ transcript?: string }>> }).results;
      let text = "";
      if (results) {
        for (let i = 0; i < results.length; i++) {
          text += results[i]?.[0]?.transcript ?? "";
        }
      }
      if (text.trim()) onText(text.trim());
    };
    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);
    ref.current = recognition;
    try {
      recognition.start();
      setListening(true);
    } catch {
      setListening(false);
    }
  }, [lang, onText]);

  return { supported, listening, start, stop };
}

/** Text-to-speech for reading results aloud. */
export function useSpeechOutput(lang: string) {
  const [speaking, setSpeaking] = useState(false);
  const supported = typeof window !== "undefined" && "speechSynthesis" in window;

  const stop = useCallback(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    setSpeaking(false);
  }, []);

  const speak = useCallback(
    (text: string) => {
      if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      utterance.rate = 0.9;
      utterance.onend = () => setSpeaking(false);
      utterance.onerror = () => setSpeaking(false);
      window.speechSynthesis.speak(utterance);
      setSpeaking(true);
    },
    [lang],
  );

  useEffect(() => stop, [stop]);

  return { supported, speaking, speak, stop };
}
