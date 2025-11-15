import React, { useRef, useState, useEffect } from "react";
import { Mic } from "lucide-react";

export default function VoiceInput({ onResult }) {
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    const rec = new SpeechRecognition();
    rec.lang = "en-IN";
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    rec.onresult = (e) => {
      const t = e.results[0][0].transcript;
      onResult && onResult(t);
    };
    rec.onend = () => setListening(false);
    recognitionRef.current = rec;
  }, [onResult]);

  function toggle() {
    const rec = recognitionRef.current;
    if (!rec) {
      alert("Voice recognition not supported in this browser.");
      return;
    }
    if (listening) {
      rec.stop();
      setListening(false);
    } else {
      try { rec.start(); setListening(true);} catch(e){ console.warn(e); }
    }
  }

  return (
    <div className="flex items-center gap-3 w-full">
      <button onClick={toggle} className={`px-3 py-2 rounded-full border ${listening ? "bg-red-50 border-red-200" : "bg-white"} transition`}>
        <Mic size={18} className={listening ? "text-red-600" : "text-gray-700"} />
      </button>
      <div className="text-sm text-gray-600">Speak now — e.g. “Add 2 apples”</div>
    </div>
  );
}
