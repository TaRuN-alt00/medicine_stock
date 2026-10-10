"use client";

import React, { useState, useEffect } from "react";
import { Mic, MicOff, X, Volume2, Globe } from "lucide-react";
import { useI18n } from "@/lib/i18n";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onTranscript: (text: string) => void;
}

export function VoiceSearchModal({ isOpen, onClose, onTranscript }: Props) {
  const { language } = useI18n();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [voiceLang, setVoiceLang] = useState<"hi-IN" | "en-IN">(
    language === "hi" ? "hi-IN" : "en-IN"
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setIsListening(false);
      setTranscript("");
      setErrorMsg(null);
      return;
    }

    startListening();
  }, [isOpen, voiceLang]);

  const startListening = () => {
    setErrorMsg(null);
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setErrorMsg("Voice search is not supported in this browser. Please type the medicine name.");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = voiceLang;
      recognition.continuous = false;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const current = event.resultIndex;
        const text = event.results[current][0].transcript;
        setTranscript(text);
      };

      recognition.onerror = (event: any) => {
        console.error("Speech error", event);
        if (event.error === "not-allowed") {
          setErrorMsg("Microphone permission denied. Please allow microphone access in your browser settings.");
        } else {
          setErrorMsg("Could not detect voice. Please speak again or type.");
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (e) {
      console.error(e);
      setErrorMsg("Failed to start microphone. Please try again.");
      setIsListening(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40">
      <div className="card-base w-full max-w-sm p-6 bg-surface relative shadow-dropdown text-center space-y-4">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-ink-muted hover:text-ink rounded-btn"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="font-serif font-bold text-xl text-ink">
          Voice Medicine Search
        </h3>
        <p className="text-xs text-ink-muted">
          Speak the brand name or composition (e.g. &quot;Dolo 650&quot; or &quot;Paracetamol&quot;)
        </p>

        {/* Language selector toggle */}
        <div className="inline-flex rounded-btn border border-stone p-1 bg-paper text-xs">
          <button
            onClick={() => setVoiceLang("hi-IN")}
            className={`px-3 py-1 rounded transition-colors ${
              voiceLang === "hi-IN" ? "bg-forest text-white" : "text-ink-muted hover:text-ink"
            }`}
          >
            हिन्दी (Hindi)
          </button>
          <button
            onClick={() => setVoiceLang("en-IN")}
            className={`px-3 py-1 rounded transition-colors ${
              voiceLang === "en-IN" ? "bg-forest text-white" : "text-ink-muted hover:text-ink"
            }`}
          >
            English (India)
          </button>
        </div>

        {/* Pulse / Microphone Animation */}
        <div className="py-6 flex flex-col items-center justify-center">
          <button
            onClick={startListening}
            className={`w-20 h-20 rounded-full flex items-center justify-center transition-all ${
              isListening
                ? "bg-forest text-white shadow-lg ring-8 ring-forest/20 animate-pulse scale-105"
                : "bg-paper text-forest border border-stone hover:bg-stone/30"
            }`}
            title={isListening ? "Listening..." : "Click to speak"}
          >
            {isListening ? <Mic className="w-8 h-8" /> : <MicOff className="w-8 h-8" />}
          </button>
          <span className="text-xs font-semibold mt-3 text-ink">
            {isListening ? "Listening... Speak now" : "Tap microphone to speak"}
          </span>
        </div>

        {/* Recognized Transcript Display */}
        {transcript && (
          <div className="p-3 bg-paper border border-stone rounded-btn text-sm font-semibold text-ink">
            &quot;{transcript}&quot;
          </div>
        )}

        {/* Error message if any */}
        {errorMsg && (
          <div className="p-3 bg-unavailable/10 border border-unavailable/30 rounded-btn text-xs text-unavailable">
            {errorMsg}
          </div>
        )}

        {/* Action button */}
        <div className="flex gap-2 pt-2">
          {transcript && (
            <button
              onClick={() => {
                onTranscript(transcript);
                onClose();
              }}
              className="btn-base btn-forest flex-1 text-xs"
            >
              Search &quot;{transcript}&quot;
            </button>
          )}
          <button onClick={onClose} className="btn-base btn-outline flex-1 text-xs">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
