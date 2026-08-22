import { useCallback, useEffect, useRef, useState } from "react";

type RecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
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

type RecognitionResultLike = ArrayLike<{ transcript?: string }> & { isFinal?: boolean };

/** Pull only *new* final phrases from a SpeechRecognition event. */
export function collectNewFinalTranscripts(
  results: ArrayLike<RecognitionResultLike>,
  alreadyProcessed: number,
): { text: string; nextIndex: number } {
  let nextIndex = alreadyProcessed;
  const parts: string[] = [];
  for (let i = alreadyProcessed; i < results.length; i++) {
    const result = results[i];
    // Strict: never treat interim / missing-final as committed text.
    if (!result || result.isFinal !== true) break;
    nextIndex = i + 1;
    const piece = (result[0]?.transcript ?? "").replace(/\s+/g, " ").trim();
    if (piece) parts.push(piece);
  }
  return { text: parts.join(" "), nextIndex };
}

/**
 * Speech-to-text via the browser's Web Speech API.
 * Uses continuous mode and restarts the session if the engine stops on its own
 * (pauses, no-speech timeout). Listening only ends when the caller calls `stop()`.
 */
export function useSpeechInput(lang: string, onText: (text: string) => void) {
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const ref = useRef<RecognitionLike | null>(null);
  const wantListening = useRef(false);
  /** True only between a successful start() and the matching onend. */
  const sessionRunning = useRef(false);
  const processedIndex = useRef(0);
  const lastCommitted = useRef("");
  const restartTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onTextRef = useRef(onText);
  const langRef = useRef(lang);
  onTextRef.current = onText;
  langRef.current = lang;

  const clearRestart = () => {
    if (restartTimer.current) {
      clearTimeout(restartTimer.current);
      restartTimer.current = null;
    }
  };

  const scheduleRestart = useCallback((startSession: () => void) => {
    clearRestart();
    restartTimer.current = setTimeout(() => {
      restartTimer.current = null;
      if (wantListening.current && !sessionRunning.current) startSession();
    }, 280);
  }, []);

  const stop = useCallback(() => {
    wantListening.current = false;
    clearRestart();
    const recognition = ref.current;
    if (recognition) {
      recognition.onresult = null;
      recognition.onerror = null;
      try {
        recognition.stop();
      } catch {
        try {
          recognition.abort();
        } catch {
          /* ignore */
        }
      }
    }
    setListening(false);
  }, []);

  const startSession = useCallback(() => {
    const Ctor = getRecognitionCtor();
    if (!Ctor || !wantListening.current) return;
    if (sessionRunning.current) return;

    clearRestart();
    processedIndex.current = 0;
    lastCommitted.current = "";

    const recognition = new Ctor();
    recognition.lang = langRef.current;
    recognition.continuous = true;
    // Finals only in the saved transcript. Android Chrome repeats words if
    // evolving interim guesses are appended (or mis-tagged as final).
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: unknown) => {
      const e = event as { results?: ArrayLike<RecognitionResultLike> };
      const results = e.results;
      if (!results) return;
      const { text, nextIndex } = collectNewFinalTranscripts(results, processedIndex.current);
      processedIndex.current = nextIndex;
      const piece = text.trim();
      if (!piece || piece === lastCommitted.current) return;
      lastCommitted.current = piece;
      onTextRef.current(piece);
    };

    recognition.onerror = (event?: unknown) => {
      const code = (event as { error?: string } | undefined)?.error;
      if (code === "not-allowed" || code === "service-not-allowed") {
        wantListening.current = false;
        clearRestart();
        setListening(false);
      }
      // no-speech / aborted / network: wait for onend, then restart if wanted.
    };

    recognition.onend = () => {
      sessionRunning.current = false;
      if (ref.current === recognition) ref.current = null;
      if (!wantListening.current) {
        setListening(false);
        return;
      }
      // Previous session has fully ended — only now is a restart allowed.
      scheduleRestart(startSession);
    };

    ref.current = recognition;
    try {
      recognition.start();
      sessionRunning.current = true;
      setListening(true);
    } catch {
      sessionRunning.current = false;
      scheduleRestart(startSession);
    }
  }, [scheduleRestart]);

  useEffect(() => {
    setSupported(getRecognitionCtor() !== null);
    return () => {
      wantListening.current = false;
      sessionRunning.current = false;
      clearRestart();
      try {
        ref.current?.abort();
      } catch {
        /* ignore */
      }
      ref.current = null;
    };
  }, []);

  const start = useCallback(() => {
    if (wantListening.current) return;
    wantListening.current = true;
    if (!sessionRunning.current) startSession();
    // If a session is still winding down, onend will start the next one.
  }, [startSession]);

  return { supported, listening, start, stop };
}

/** One chunk of speech with its own language. */
export interface SpeechSegment {
  text: string;
  lang: string;
}

function pickVoice(lang: string): SpeechSynthesisVoice | undefined {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return undefined;
  const voices = window.speechSynthesis.getVoices();
  if (voices.length === 0) return undefined;
  const wanted = lang.toLowerCase().replace("_", "-");
  const prefix = wanted.split("-")[0] ?? wanted;
  return (
    voices.find((v) => v.lang.toLowerCase().replace("_", "-") === wanted) ??
    voices.find((v) => v.lang.toLowerCase().replace("_", "-").startsWith(`${prefix}-`)) ??
    voices.find((v) => v.lang.toLowerCase().startsWith(prefix))
  );
}

/** Text-to-speech for reading results aloud, across mixed-language segments. */
export function useSpeechOutput(lang: string) {
  const [speaking, setSpeaking] = useState(false);
  const supported = typeof window !== "undefined" && "speechSynthesis" in window;
  const cancelled = useRef(false);
  const keepAlive = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearKeepAlive = () => {
    if (keepAlive.current) {
      clearInterval(keepAlive.current);
      keepAlive.current = null;
    }
  };

  const stop = useCallback(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    cancelled.current = true;
    clearKeepAlive();
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
    // Chrome can pause long utterances; resume keeps playback going.
    clearKeepAlive();
    keepAlive.current = setInterval(() => {
      if (window.speechSynthesis.speaking) window.speechSynthesis.resume();
    }, 8000);

    const speakAt = (index: number) => {
      if (cancelled.current || index >= queue.length) {
        clearKeepAlive();
        if (!cancelled.current) setSpeaking(false);
        return;
      }
      const segment = queue[index]!;
      const utterance = new SpeechSynthesisUtterance(segment.text);
      utterance.lang = segment.lang;
      utterance.rate = 0.9;
      const voice = pickVoice(segment.lang);
      if (voice) utterance.voice = voice;
      utterance.onend = () => speakAt(index + 1);
      utterance.onerror = () => speakAt(index + 1);
      window.speechSynthesis.speak(utterance);
    };

    let started = false;
    const begin = () => {
      if (started || cancelled.current) return;
      started = true;
      speakAt(0);
    };
    if (window.speechSynthesis.getVoices().length === 0) {
      window.speechSynthesis.addEventListener("voiceschanged", begin, { once: true });
      window.setTimeout(begin, 300);
    } else {
      begin();
    }
  }, []);

  const speak = useCallback(
    (text: string) => speakSegments([{ text, lang }]),
    [lang, speakSegments],
  );

  useEffect(() => stop, [stop]);

  return { supported, speaking, speak, speakSegments, stop };
}
