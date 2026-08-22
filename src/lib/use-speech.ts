import { useCallback, useEffect, useRef, useState } from "react";

type RecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: unknown) => void) | null;
  onerror: ((event?: unknown) => void) | null;
  onend: (() => void) | null;
};

function getRecognitionCtor(): (new () => RecognitionLike) | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as Record<string, unknown>;
  return ((w["SpeechRecognition"] ?? w["webkitSpeechRecognition"]) as
    | (new () => RecognitionLike)
    | undefined) ?? null;
}

/**
 * Speech-to-text via the browser's Web Speech API.
 * Runs in continuous mode and silently restarts itself when the engine ends a
 * session on its own, so natural pauses never cut the user off. Listening only
 * ends when the caller calls `stop()`.
 */
export function useSpeechInput(lang: string, onText: (text: string) => void) {
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const ref = useRef<RecognitionLike | null>(null);
  const wantListening = useRef(false);
  const onTextRef = useRef(onText);
  onTextRef.current = onText;

  useEffect(() => {
    setSupported(getRecognitionCtor() !== null);
    return () => {
      wantListening.current = false;
      ref.current?.abort();
      ref.current = null;
    };
  }, []);

  const stop = useCallback(() => {
    wantListening.current = false;
    ref.current?.stop();
    setListening(false);
  }, []);

  const startSession = useCallback(() => {
    const Ctor = getRecognitionCtor();
    if (!Ctor) return;
    const recognition = new Ctor();
    recognition.lang = lang;
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.onresult = (event: unknown) => {
      const e = event as {
        results?: ArrayLike<ArrayLike<{ transcript?: string }> & { isFinal?: boolean }>;
        resultIndex?: number;
      };
      const results = e.results;
      if (!results) return;
      let text = "";
      for (let i = e.resultIndex ?? 0; i < results.length; i++) {
        const result = results[i];
        if (result && result.isFinal === false) continue;
        text += `${result?.[0]?.transcript ?? ""} `;
      }
      if (text.trim()) onTextRef.current(text.trim());
    };
    recognition.onerror = (event?: unknown) => {
      const code = (event as { error?: string } | undefined)?.error;
      // Fatal errors: stop for good. Everything else is handled by onend restart.
      if (code === "not-allowed" || code === "service-not-allowed") {
        wantListening.current = false;
        setListening(false);
      }
    };
    recognition.onend = () => {
      if (!wantListening.current) {
        setListening(false);
        return;
      }
      // Session ended on its own (pause / engine timeout) — restart seamlessly.
      setTimeout(() => {
        if (wantListening.current) startSession();
      }, 150);
    };
    ref.current = recognition;
    try {
      recognition.start();
      setListening(true);
    } catch {
      // Already starting; ignore.
    }
  }, [lang]);

  const start = useCallback(() => {
    if (wantListening.current) return;
    ref.current?.abort();
    wantListening.current = true;
    startSession();
  }, [startSession]);

  return { supported, listening, start, stop };
}

/** One chunk of speech with its own language. */
export interface SpeechSegment {
  text: string;
  lang: string;
}

/** Text-to-speech for reading results aloud, across mixed-language segments. */
export function useSpeechOutput(lang: string) {
  const [speaking, setSpeaking] = useState(false);
  const supported = typeof window !== "undefined" && "speechSynthesis" in window;
  const cancelled = useRef(false);

  const stop = useCallback(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    cancelled.current = true;
    window.speechSynthesis.cancel();
    setSpeaking(false);
  }, []);

  /** Speak a list of segments in order, each in its own language. */
  const speakSegments = useCallback((segments: SpeechSegment[]) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const queue = segments.filter((s) => s.text.trim().length > 0);
    if (queue.length === 0) return;
    window.speechSynthesis.cancel();
    cancelled.current = false;
    setSpeaking(true);

    const speakAt = (index: number) => {
      if (cancelled.current || index >= queue.length) {
        if (!cancelled.current) setSpeaking(false);
        return;
      }
      const segment = queue[index]!;
      const utterance = new SpeechSynthesisUtterance(segment.text);
      utterance.lang = segment.lang;
      utterance.rate = 0.9;
      utterance.onend = () => speakAt(index + 1);
      utterance.onerror = () => speakAt(index + 1);
      window.speechSynthesis.speak(utterance);
    };
    speakAt(0);
  }, []);

  const speak = useCallback(
    (text: string) => speakSegments([{ text, lang }]),
    [lang, speakSegments],
  );

  useEffect(() => stop, [stop]);

  return { supported, speaking, speak, speakSegments, stop };
}
