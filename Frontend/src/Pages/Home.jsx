
import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { NavLink, useNavigate } from "react-router-dom";
import { ShoppingCart, Mic, Zap, Star } from "lucide-react";
import { parseVoice } from "../utils/parser"; 
import { fetchItems } from "../services/api"; 

const Feature = ({ Icon, title, desc, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.45 }}
    className="bg-[rgba(17,24,39,0.6)] dark:bg-[rgba(2,6,23,0.6)] backdrop-blur-md rounded-xl p-4 shadow-xl border border-white/10 flex gap-3 items-start"
    aria-hidden
  >
    <div className="w-12 h-12 rounded-lg bg-indigo-800/20 flex items-center justify-center text-indigo-300">
      <Icon size={20} />
    </div>
    <div>
      <div className="font-semibold text-white">{title}</div>
      <div className="text-sm text-slate-300 mt-1">{desc}</div>
    </div>
  </motion.div>
);

function IllustrationSVG() {
  return (
    <svg viewBox="0 0 700 500" className="w-full h-auto" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden>
      <defs>
        <linearGradient id="g1" x1="0" x2="1">
          <stop offset="0" stopColor="#4F46E5" />
          <stop offset="1" stopColor="#0891B2" />
        </linearGradient>
      </defs>

      <rect x="0" y="0" width="700" height="500" rx="24" fill="url(#g1)" opacity="0.06" />

      {/* stylized phone with cart */}
      <g transform="translate(80,40)">
        <rect x="0" y="0" width="280" height="420" rx="26" fill="#0f1724" opacity="0.9" />
        <rect x="16" y="18" width="248" height="160" rx="12" fill="#0b1220" />
        <g transform="translate(24,36)">
          <rect x="0" y="0" width="216" height="36" rx="8" fill="#0b1220" />
          <circle cx="196" cy="18" r="10" fill="#60a5fa" />
        </g>

        <g transform="translate(24,200)">
          <rect x="0" y="0" width="216" height="36" rx="8" fill="#111827" />
          <rect x="0" y="56" width="216" height="36" rx="8" fill="#0f1724" />
          <rect x="0" y="112" width="216" height="36" rx="8" fill="#1f2937" />
        </g>

        <g transform="translate(16,340)">
          <rect x="0" y="0" width="248" height="48" rx="12" fill="#020617" opacity="0.06" />
        </g>
      </g>

      {/* decorative badges */}
      <g transform="translate(420,80)">
        <circle cx="48" cy="48" r="48" fill="#fff" opacity="0.06" />
        <g transform="translate(16,16)">
          <rect x="0" y="0" width="64" height="24" rx="8" fill="#0891b2" />
          <text x="8" y="16" fontSize="12" fill="#fff" fontFamily="sans-serif">Checkout</text>
        </g>
      </g>
    </svg>
  );
}

export default function Home() {
  const navigate = useNavigate();


  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [parseResult, setParseResult] = useState(null);
  const [error, setError] = useState("");
  const recognitionRef = useRef(null);


  const [miniItems, setMiniItems] = useState([]);
  const [miniLoading, setMiniLoading] = useState(false);
  const [miniError, setMiniError] = useState("");

  useEffect(() => {
   
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition || null;
    if (!SpeechRecognition) {
      setSupported(false);
    } else {
      setSupported(true);
      const rec = new SpeechRecognition();
      rec.lang = "en-IN";
      rec.interimResults = false;
      rec.maxAlternatives = 1;

      rec.onstart = () => {
        setListening(true);
        setTranscript("");
        setParseResult(null);
        setError("");
      };

      rec.onresult = (ev) => {
        const text = ev.results[0][0].transcript || "";
        setTranscript(text);
        try {
          if (typeof parseVoice === "function") {
            setParseResult(parseVoice(text || ""));
          } else {
            const t = text.toLowerCase();
            const action = t.includes("add") ? "add" : t.includes("remove") || t.includes("delete") ? "delete" : "unknown";
            const qtyMatch = t.match(/\d+/);
            const qty = qtyMatch ? parseInt(qtyMatch[0], 10) : 1;
            const words = t.split(/\s+/).filter(Boolean);
            const item = words.slice(-1)[0] || "";
            setParseResult({ action, quantity: qty, item });
          }
        } catch (e) {
          console.error("Parse error:", e);
          setParseResult(null);
        }
      };

      rec.onerror = (ev) => setError(ev.error || "Recognition error");
      rec.onend = () => setListening(false);

      recognitionRef.current = rec;

      return () => {
        try {
          rec.onstart = null;
          rec.onresult = null;
          rec.onend = null;
          rec.onerror = null;
          rec.stop?.();
        } catch (e) {}
      };
    }
  }, []);

  function startListening() {
    setError("");
    if (!recognitionRef.current) {
      setError("Speech Recognition not available in this browser.");
      return;
    }
    try {
      recognitionRef.current.start();
    } catch (e) {
      try { recognitionRef.current.stop(); recognitionRef.current.start(); } catch (ee) { console.error(ee); }
    }
  }

  function stopListening() {
    try {
      recognitionRef.current?.stop();
    } catch (e) {
      console.error(e);
    }
    setListening(false);
  }


  async function loadMiniCart() {
    setMiniLoading(true);
    setMiniError("");
    try {
      const data = await fetchItems();
      const list = Array.isArray(data) ? data : [];
      const normalized = list.map((it) => ({
        id: it._id || it.id || it.productId || Math.random().toString(36).slice(2, 9),
        name: it.name || it.title || it.product || "Item",
        qty: it.quantity ?? it.qty ?? it.quantityOrdered ?? 1,
        price: it.price ?? it.unitPrice ?? 0,
        image: it.image ?? it.img ?? null,
      }));
      setMiniItems(normalized.slice(0, 4));
    } catch (err) {
      console.error("Mini-cart load failed:", err);
      setMiniError("Could not load cart preview");
      setMiniItems([]);
    } finally {
      setMiniLoading(false);
    }
  }

  useEffect(() => {
    loadMiniCart();

    function onCartUpdate() {
      loadMiniCart();
    }
    window.addEventListener("cart-update", onCartUpdate);

    return () => window.removeEventListener("cart-update", onCartUpdate);
  
  }, []);

  const totalQty = miniItems.reduce((s, it) => s + (it.qty || 0), 0);
  const totalPrice = miniItems.reduce((s, it) => s + (it.qty || 0) * (it.price || 0), 0);

  return (
    <main className=" min-h-[72vh] bg-gradient-to-br from-slate-900 via-[#071224] to-[#011827] text-white py-12 transition-colors">
      <div className="container mx-auto px-4 mb-0">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
         
          <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }} className="max-w-xl">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-800 to-cyan-700 text-white px-3 py-1 rounded-full text-sm font-medium mb-4 shadow-sm ring-1 ring-white/10">
              <span className="px-2 py-0.5 rounded bg-white/10 text-white text-xs">New</span>
              Voice-first shopping
            </div>

            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Shop hands-free with{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-300">
                VoiceCart
              </span>
            </h1>

            <p className="mt-4 text-slate-300 text-lg">
              Add items, manage your cart, and checkout using natural voice commands. Fast, accessible, and delightful shopping — built with modern UI & AI.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <button onClick={() => navigate("/dashboard")} className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2 rounded-lg shadow-lg transition">
                <ShoppingCart size={16} /> Get Started
              </button>

              <NavLink to="/products" className="inline-flex items-center gap-2 border border-white/10 px-4 py-2 rounded-lg hover:shadow-sm transition bg-white/5 text-white">
                Browse Products
              </NavLink>

              <button onClick={() => { const el = document.getElementById("demo-voice"); if (el) el.scrollIntoView({ behavior: "smooth", block: "center" }); }} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white">
                <Mic size={16} /> Try Voice Demo
              </button>
            </div>

           
            <div className="mt-6 flex gap-4 flex-wrap">
              <div className="bg-[rgba(255,255,255,0.03)] rounded-lg px-4 py-2 shadow-sm border border-white/6 text-sm">
                <div className="text-xs text-slate-300">Avg add time</div>
                <div className="font-semibold text-white">~3s / item</div>
              </div>
              <div className="bg-[rgba(255,255,255,0.03)] rounded-lg px-4 py-2 shadow-sm border border-white/6 text-sm">
                <div className="text-xs text-slate-300">Users love it</div>
                <div className="font-semibold text-white">4.8 ★</div>
              </div>
              <div className="bg-[rgba(255,255,255,0.03)] rounded-lg px-4 py-2 shadow-sm border border-white/6 text-sm">
                <div className="text-xs text-slate-300">Accessibility</div>
                <div className="font-semibold text-white">Keyboard & Voice</div>
              </div>
            </div>
          </motion.div>

       
          <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }} className="flex justify-center lg:justify-end">
            <div className="relative w-full max-w-md">
              <div className="rounded-2xl p-6 bg-gradient-to-br from-[#071B2E] to-[#022235] border border-white/6 shadow-2xl">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="text-sm text-slate-300">Cart</div>
                    <div className="font-bold text-lg text-white">{totalQty} item{totalQty !== 1 ? "s" : ""}</div>
                  </div>
                  <div className="text-cyan-300 font-semibold">₹{totalPrice.toFixed(2)}</div>
                </div>

                <div className="space-y-3 min-h-[120px]">
                  {miniLoading ? (
                    <div className="text-center text-slate-300">Loading...</div>
                  ) : miniError ? (
                    <div className="text-center text-amber-300">{miniError}</div>
                  ) : miniItems.length === 0 ? (
                    <div className="text-center text-slate-300">No items in cart yet</div>
                  ) : (
                    miniItems.map((it) => (
                      <div key={it.id} className="flex items-center gap-3">
                        <div className="w-14 h-14 rounded-lg bg-white/6 flex items-center justify-center border border-white/6 overflow-hidden">
                          {it.image ? <img src={it.image} alt={it.name} className="object-contain w-full h-full" /> : (
                            <div className="text-slate-300 text-xs">{it.name.charAt(0).toUpperCase()}</div>
                          )}
                        </div>

                        <div className="flex-1">
                          <div className="font-medium text-white">{it.name}</div>
                          <div className="text-sm text-slate-300">Qty {it.qty} • ₹{it.price}</div>
                        </div>

                        <div className="text-sm text-white font-semibold">₹{((it.qty||0)*(it.price||0)).toFixed(2)}</div>
                      </div>
                    ))
                  )}
                </div>

                <div className="mt-5 flex items-center justify-between">
                  <button onClick={() => navigate("/dashboard")} className="px-4 py-2 bg-white/6 border border-white/8 rounded-lg shadow-sm hover:scale-[1.02] text-slate-200 transition">View Cart</button>
                  <button onClick={() => { navigate("/checkout"); }} className="px-4 py-2 bg-cyan-400 text-slate-900 rounded-lg shadow hover:brightness-95 transition">Checkout</button>
                </div>
              </div>

              <div className="absolute -bottom-4 left-6 bg-white/95 text-indigo-800 rounded-full px-4 py-2 shadow-md border border-white/10 flex items-center gap-2">
                <Star size={16} className="text-yellow-400" />
                <div className="text-sm text-indigo-800">
                  Loved by <span className="font-semibold">12k+</span> shoppers
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Features */}
        <div className="mt-12 max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Feature Icon={Mic} title="Voice-first" desc="Natural language commands — add, remove, and update items by speaking." delay={0.05} />
            <Feature Icon={ShoppingCart} title="Smart Cart" desc="Realtime sync, quantity merge, and fast checkout." delay={0.12} />
            <Feature Icon={Zap} title="Fast & Accurate" desc="Quick item lookup and auto price suggestions." delay={0.18} />
            <Feature Icon={Star} title="Accessible" desc="Built for everyone — keyboard, screen readers & voice controls." delay={0.24} />
          </motion.div>
        </div>

       
        <div id="demo-voice" className="mt-12 max-w-3xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-[rgba(255,255,255,0.03)] border border-white/6 p-6 rounded-2xl shadow-lg">
            <h3 className="text-lg font-semibold text-white">Try Voice Demo</h3>
            <p className="text-sm text-slate-300 mt-1">Click & speak a command like “Add 2 apples” or “Remove milk”.</p>

            <div className="mt-4 flex items-center gap-3 flex-wrap">
              <button onClick={() => (listening ? stopListening() : startListening())} className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg shadow-md transition ${listening ? "bg-rose-600 text-white" : "bg-white/6 border border-white/8 text-white"}`} aria-pressed={listening}>
                <Mic size={16} /> {listening ? "Listening..." : "Start Listening"}
              </button>

              <button onClick={() => { setTranscript(""); setParseResult(null); setError(""); }} className="px-4 py-2 rounded-lg border border-white/8 bg-white/6 text-white">Reset</button>

              <div className="text-sm text-slate-300 ml-2">{supported ? "Speech Recognition ready" : "Speech Recognition not supported in this browser"}</div>
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 bg-[rgba(255,255,255,0.02)] rounded-lg border border-white/6 text-sm">
                <div className="text-xs text-slate-300">Transcript</div>
                <div className="mt-2 text-slate-200">{transcript || <span className="text-slate-400">— nothing yet —</span>}</div>
                {error && <div className="mt-2 text-xs text-rose-300">{error}</div>}
              </div>

              <div className="p-3 bg-[rgba(255,255,255,0.02)] rounded-lg border border-white/6 text-sm">
                <div className="text-xs text-slate-300">Parsed Result</div>
                {parseResult ? (
                  <div className="mt-2 text-slate-200">
                    <div><span className="font-medium">Action:</span> {parseResult.action}</div>
                    <div><span className="font-medium">Quantity:</span> {parseResult.quantity ?? parseResult.qty ?? "1"}</div>
                    <div><span className="font-medium">Item:</span> {parseResult.item ?? parseResult.name ?? "-"}</div>
                  </div>
                ) : (
                  <div className="mt-2 text-slate-400">— nothing parsed yet —</div>
                )}
              </div>
            </div>

            <div className="mt-5 text-sm text-slate-300 italic">Tip: use short clear phrases like "Add 1 litre milk" or "Remove 2 apples".</div>
          </motion.div>

          <motion.blockquote initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} className="bg-[rgba(255,255,255,0.03)] border border-white/6 p-6 rounded-2xl shadow-lg mt-6">
            <div className="text-slate-300 italic">“VoiceCart made weekly shopping effortless — I add everything in seconds by speaking.”</div>
            <div className="mt-3 text-sm font-semibold text-white">— Ankit R., early user</div>
          </motion.blockquote>
        </div>
      </div>
    </main>
  );
}
