import React, { useRef, useState, useEffect } from "react";
import { Mic } from "lucide-react";

export default function VoiceInput({ onResult, onStart, onStop }) {
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      recognitionRef.current = null;
      return;
    }

    const rec = new SpeechRecognition();


    rec.lang = "hi-IN"; 
    rec.interimResults = false;
    rec.continuous = false;
    rec.maxAlternatives = 1;

    rec.onstart = () => {
      setListening(true);
      onStart && onStart();
    };

    rec.onresult = (ev) => {
      const spoken =
        ev?.results?.[0]?.[0]?.transcript || "";

      if (onResult) onResult(spoken);
    };

    rec.onerror = (err) => {
      console.warn("Speech Error:", err);
      setListening(false);
      onStop && onStop();
    };

    rec.onend = () => {
      setListening(false);
      onStop && onStop();
    };

    recognitionRef.current = rec;
  }, [onResult, onStart, onStop]);

  const toggle = () => {
    const rec = recognitionRef.current;
    if (!rec) {
      alert("Voice recognition not supported in this browser.");
      return;
    }

    if (listening) {
      try {
        rec.stop();
      } catch {}
      setListening(false);
      return;
    }

    try {
      rec.start();
    } catch {
      try {
        rec.stop();
        rec.start();
      } catch (err2) {
        console.warn("Mic start failed:", err2);
      }
    }
  };

  return (
    <div className="flex items-center gap-3 w-full">
      <button
        onClick={toggle}
        className={`px-3 py-2 rounded-full border transition ${
          listening
            ? "bg-red-100 border-red-300"
            : "bg-white border-gray-300"
        }`}
      >
        <Mic
          size={18}
          className={listening ? "text-red-600" : "text-gray-700"}
        />
      </button>

      <div className="text-sm text-gray-300 md:text-gray-400">
        Speak now — e.g. “Add 2 apples”
      </div>
    </div>
  );
}
