
import React, { useContext, useEffect, useState, useRef } from "react";
import VoiceInput from "../components/VoiceInput";
import { parseVoice as syncParseVoice } from "../utils/parser";
import parseAndTranslateVoice from "../utils/translateParser";
import { fetchItems, addItem, deleteItem, fetchPrice } from "../services/api";
import { AuthContext } from "../context/AuthContext";
import { ShoppingCart, Star, Mic } from "lucide-react";
import items from "../data/items";


let itemsData = null;
try {

  itemsData = require("../data/items").default || null;
} catch (e) {
  itemsData = null;
}


if ((!itemsData || !Array.isArray(itemsData) || itemsData.length === 0) && Array.isArray(items) && items.length > 0) {
 
  itemsData = items.map((it, idx) => ({
    ...it,
    id: it.id || `item-${idx + 1}`,
  }));
  console.info("itemsData populated from static import (src/data/items.js).");
}


function capitalize(s) {
  if (!s) return "";
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function formatINR(v) {
  try {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(v);
  } catch {
    return `₹${v}`;
  }
}


const mockProducts = [
  { id: "m1", title: "Fresh Bananas (1 dozen)", price: 80, rating: 4.4 },
  { id: "m2", title: "Brown Eggs (12 pcs)", price: 120, rating: 4.6 },
  { id: "m3", title: "Whole Wheat Bread (500g)", price: 45, rating: 4.2 },
  { id: "m4", title: "Organic Milk (1L)", price: 65, rating: 4.5 },
  { id: "m5", title: "Tomatoes (1 kg)", price: 70, rating: 4.1 },
  { id: "m6", title: "Basmati Rice (5kg)", price: 420, rating: 4.7 },
  { id: "m7", title: "Olive Oil (500ml)", price: 499, rating: 4.3 },
  { id: "m8", title: "Sugar (1 kg)", price: 48, rating: 4.0 },
];


const SYNONYMS = {
  "seb": "apple",
  "seba": "apple",
  "aaloo": "potato",
  "aloo": "potato",
  "pyaaz": "onion",
  "bhindi": "lady finger",
  "karela": "bitter gourd",
  "anar": "pomegranate",
  "sebz": "vegetable",
  "sebaz": "vegetable",
  "sebhi": "apple",
  "sebji": "vegetable",
  "sebjiya": "vegetable",
  "sebjiyaan": "vegetable"
};


function norm(s) {
  return (s || "").toString().toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
}


function tokenMatchesPool(token, poolText) {
  if (!token || !poolText) return false;
  const p = poolText;
  if (p === token) return true;
  if (p.includes(token)) return true;
 
  if ((" " + p + " ").includes(" " + token + " ")) return true;
  return false;
}


function matchProductName(rawName) {
  if (!rawName) return null;

  const original = rawName.toString().trim();
  let qRaw = norm(original);


  const tokens = qRaw.split(" ").filter(Boolean).map(t => (SYNONYMS[t] ? SYNONYMS[t] : t));

  if (Array.isArray(itemsData) && itemsData.length > 0) {
    let best = null;
    let bestScore = 0;
    for (const it of itemsData) {
      const pool = norm(`${it.name || ""} ${it.category || ""} ${it.brand || ""} ${(Array.isArray(it.tags) ? it.tags.join(" ") : "")}`);
      let score = 0;
      for (const tk of tokens) {
        if (tokenMatchesPool(tk, norm(it.name || ""))) score += 4;
        if (tokenMatchesPool(tk, pool)) score += 2;
       
        if ((it.name || "").toLowerCase().startsWith(tk)) score += 1;
      }
     
      if (pool.includes(qRaw)) score += 1;

      if (score > bestScore) {
        bestScore = score;
        best = it;
      }
    }
    
    if (best && bestScore >= 2) {
      return {
        source: "itemsData",
        product: {
          id: best.id || best.name,
          title: best.name,
          price: Number(best.price || 0),
          rating: best.rating || 4.2,
          raw: best,
        },
        score: bestScore,
      };
    }
  }


  let best = null;
  let bestScore = 0;
  for (const p of mockProducts) {
    const pool = norm((p.title || "") + " " + (p.q || ""));
    let score = 0;
    for (const tk of tokens) {
      if (tokenMatchesPool(tk, pool)) score += 2;
      if ((p.title || "").toLowerCase().startsWith(tk)) score += 1;
    }
    if (pool.includes(qRaw)) score += 1;
    if (score > bestScore) {
      bestScore = score;
      best = p;
    }
  }
  if (best && bestScore >= 1) {
    return {
      source: "mock",
      product: {
        id: best.id,
        title: best.title,
        price: best.price,
        rating: best.rating,
      },
      score: bestScore,
    };
  }

 
  return null;
}

function useToast(defaultTimeout = 3000) {
  const [toast, setToast] = useState(null);
  const timerRef = useRef(null);

  function show(msg, timeout = defaultTimeout) {
    if (!msg) return;
    setToast(msg);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setToast(null), timeout);
  }

  function clear() {
    setToast(null);
    if (timerRef.current) clearTimeout(timerRef.current);
  }

  useEffect(() => () => clearTimeout(timerRef.current), []);

  return { toast, show, clear };
}

/* Normalize server items: merge duplicates by name (same as before) */
function normalizeServerItems(list) {
  if (!Array.isArray(list)) return [];

  const map = new Map();
  for (const it of list) {
    const nameRaw = it.name || it.title || "";
    const nameKey = (nameRaw + "").trim().toLowerCase();
    const qty = Number(it.quantity || it.qty || 0);
    const unitPrice = Number(it.price || 0);
    const totalValue = unitPrice * qty;

    if (!map.has(nameKey)) {
      map.set(nameKey, {
        name: nameRaw || nameKey,
        quantity: qty,
        totalValue: totalValue,
        fallbackUnitPrice: unitPrice || 0,
        image: it.image || it.img || null,
        serverIds: it._id ? [it._id] : [],
      });
    } else {
      const cur = map.get(nameKey);
      cur.quantity += qty;
      cur.totalValue += totalValue;
      if (it._id && !cur.serverIds.includes(it._id)) cur.serverIds.push(it._id);
      if (!cur.image && (it.image || it.img)) cur.image = it.image || it.img;
    }
  }

  const out = [];
  for (const [k, v] of map.entries()) {
    const finalQty = v.quantity || 0;
    const unitPrice = finalQty > 0 ? (v.totalValue / finalQty) : v.fallbackUnitPrice || 0;
    out.push({
      _id: v.serverIds.length >= 1 ? v.serverIds[0] : undefined,
      serverIds: v.serverIds,
      name: v.name,
      quantity: finalQty,
      price: Number(unitPrice.toFixed(2)),
      image: v.image || null,
    });
  }

  return out;
}

/* Dashboard Component */
export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const [addingId, setAddingId] = useState(null);

  const [translatedText, setTranslatedText] = useState("");
  const [parsePreview, setParsePreview] = useState(null);
  const [lastLang, setLastLang] = useState(null);

  // debug: last matched info (shows on UI)
  const [lastMatch, setLastMatch] = useState(null);

  const [listeningState, setListeningState] = useState(false);
  const recognitionRef = useRef(null);

  const toast = useToast(3500);

  /* find item by name from current normalized items */
  function findItemByName(name) {
    if (!name) return null;
    const n = name.trim().toLowerCase();
    return items.find((it) => {
      const nm = (it.name || "").toString().toLowerCase();
      return nm === n || nm.includes(n) || n.includes(nm);
    });
  }

  function mergeItemLocally(prodTitle, qty = 1, unitPrice = 0, image = null) {
    if (!prodTitle) return;
    setItems((prev) => {
      const prodTitleKey = prodTitle.toString().toLowerCase().trim();
      const existingIndex = prev.findIndex(
        (it) => (it.name || "").toString().toLowerCase() === prodTitleKey
      );

      if (existingIndex >= 0) {
        const copy = [...prev];
        const ex = copy[existingIndex];
        const newQty = (ex.quantity || ex.qty || 0) + qty;
        const price = (ex.price && ex.price > 0) ? ex.price : unitPrice;
        copy[existingIndex] = {
          ...ex,
          quantity: newQty,
          price: price || ex.price || unitPrice,
        };
        return copy;
      } else {
        const stub = {
          _id: `local-${Math.random().toString(36).slice(2, 9)}`,
          name: prodTitle,
          quantity: qty,
          price: unitPrice,
          image: image || null,
        };
        return [stub, ...prev];
      }
    });
  }

  async function loadItems() {
    setLoading(true);
    try {
      const data = await fetchItems();
      const list = Array.isArray(data) ? data : [];
      const normalized = normalizeServerItems(list || []);
      setItems(normalized);
      const count = normalized.reduce((s, it) => s + (it.quantity || it.qty || 0), 0);
      try {
        window.dispatchEvent(new CustomEvent("cart-update", { detail: { count } }));
      } catch (e) {}
    } catch (err) {
      console.error("loadItems failed:", err);
      toast.show("Could not load items");
      try {
        window.dispatchEvent(new CustomEvent("cart-update", { detail: { count: 0 } }));
      } catch (e) {}
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadItems();
    const onCart = () => loadItems();
    window.addEventListener("cart-update", onCart);
    return () => window.removeEventListener("cart-update", onCart);
   
  }, []);

  async function handleDelete(idOrName) {
    if (!idOrName) {
      toast.show("Invalid id/name");
      return;
    }

    const before = items;
    let targetItem = null;
    let targetId = null;

    targetItem = items.find(it => it._id && it._id.toString() === idOrName.toString());
    if (targetItem) targetId = targetItem._id;
    else {
      targetItem = items.find(it => Array.isArray(it.serverIds) && it.serverIds.includes(idOrName.toString()));
      if (targetItem) targetId = targetItem.serverIds[0];
      else {
        const nameKey = idOrName.toString().trim().toLowerCase();
        targetItem = items.find(it => (it.name || "").toString().toLowerCase() === nameKey || (it.name || "").toString().toLowerCase().includes(nameKey));
        if (targetItem) {
          targetId = targetItem._id || (Array.isArray(targetItem.serverIds) ? targetItem.serverIds[0] : undefined);
        }
      }
    }

    if (!targetId) {
      
      await loadItems();
      const nameKey = idOrName.toString().trim().toLowerCase();
      targetItem = items.find(it => (it.name || "").toString().toLowerCase() === nameKey || (it.serverIds || []).includes(idOrName.toString()));
      targetId = targetItem?._id || targetItem?.serverIds?.[0];
    }

    if (!targetId) {
      toast.show("Item to delete not found.");
      return;
    }

    setItems(prev => prev.filter(it => !( (it._id && it._id === targetId) || (Array.isArray(it.serverIds) && it.serverIds.includes(targetId)) )) );
    toast.show("Deleting...");

    try {
      await deleteItem(targetId);
      toast.show("Deleted ✅");
      await loadItems();
    } catch (err) {
      console.error("Delete error:", err);
      setItems(before);
      toast.show(`Delete failed: ${err?.message || "Server error"}`);
      const count = before.reduce((s, it) => s + (it.quantity || it.qty || 0), 0);
      try {
        window.dispatchEvent(new CustomEvent("cart-update", { detail: { count } }));
      } catch (e) {}
    }
  }

  async function handleVoiceCommand(rawText) {
    if (!rawText || rawText.trim().length === 0) {
      toast.show("No voice input detected");
      return;
    }

    setTranslatedText("");
    setParsePreview(null);
    setLastLang(null);
    setListeningState(true);
    toast.show("Processing voice...");

    try {
      const { parsed, translatedText: tText } = await parseAndTranslateVoice(rawText || "", { useOnline: false }).catch((e) => {
        console.warn("parseAndTranslateVoice failed, falling back to syncParseVoice:", e);
        return { parsed: syncParseVoice(rawText || ""), translatedText: rawText };
      });

      setTranslatedText(tText || rawText || "");
      setParsePreview(parsed || null);
      setLastLang(parsed?.lang ?? null);


      console.info("VOICE RAW:", rawText);
      console.info("PARSE RESULT:", parsed);
      console.info("itemsData available:", Array.isArray(itemsData) ? itemsData.length : 0);

      const { action, quantity = 1, item } = parsed || {};

    
      if ((action === "add" || action === "buy") && item) {
        const matched = matchProductName(item);
        setLastMatch(matched || null);
        console.info("MATCHED:", matched);

        if (matched && matched.product) {
          const prod = matched.product;
          const qty = Number(quantity || 1);

          setAddingId(prod.id);
        
          const titleToAdd = (prod.raw && prod.raw.name) ? prod.raw.name : prod.title;
          const priceToUse = prod.price || 0;

          mergeItemLocally(titleToAdd, qty, priceToUse, null);

          try {
            let price = priceToUse;
            try {
              const p = await fetchPrice(titleToAdd);
              if (p) price = p;
            } catch (e) {
          
            }

            await addItem({ name: titleToAdd, quantity: qty, price });
            toast.show(`Added ${qty} × ${titleToAdd} • ${formatINR(price)}`);
            await loadItems();
          } catch (err) {
            console.error(err);
            toast.show("Could not add item");
            await loadItems();
          } finally {
            setAddingId(null);
          }
        } else {
          console.info(`Voice add attempted for unknown product: "${item}"`);
          toast.show(`"${capitalize(item)}" is out of stock or not available.`);
        }
      } else if (action === "delete" && item) {
        const found = findItemByName(item);
        if (found) {
          if (found._id) {
            await handleDelete(found._id);
          } else {
            toast.show("Couldn't delete: item not persisted yet. Syncing and retrying...");
            await loadItems();
            const found2 = findItemByName(item);
            if (found2 && found2._id) {
              await handleDelete(found2._id);
            } else {
              toast.show(`Item to delete not found: ${capitalize(item)}`);
            }
          }
        } else {
          toast.show(`Item to delete not found: ${capitalize(item)}`);
        }
      } else {
        toast.show("Couldn't understand — try: 'Add 2 bananas' or 'Delete milk'.");
      }
    } catch (err) {
      console.error("Voice processing failed:", err);
      toast.show("Voice processing error — trying offline fallback");

      try {
        const p = syncParseVoice(rawText || "");
        setParsePreview(p);
        if (p.action === "add" && p.item) {
          const matched = matchProductName(p.item);
          setLastMatch(matched || null);
          if (matched && matched.product) {
            const prod = matched.product;
            const qty = Number(p.quantity || 1);
            const titleToAdd = (prod.raw && prod.raw.name) ? prod.raw.name : prod.title;
            mergeItemLocally(titleToAdd, qty, prod.price, null);
            await addItem({ name: titleToAdd, quantity: qty, price: prod.price });
            await loadItems();
            toast.show(`Added ${qty} × ${titleToAdd}`);
          } else {
            toast.show(`"${capitalize(p.item)}" is out of stock or not available (offline fallback).`);
          }
        } else {
          toast.show("Fallback parse couldn't execute");
        }
      } catch (e) {
        console.error("Fallback parse failed:", e);
        toast.show("Voice fallback failed");
      }
    } finally {
      setListeningState(false);
    }
  }

  async function addToCartProduct(prod, qty = 1) {
    if (!prod) return;

    const title = (prod.title || prod.name || (prod.raw && prod.raw.name) || prod.id || "Item").toString();
    const price = Number(prod.price || (prod.raw && prod.raw.price) || 0);

    mergeItemLocally(title, qty, price, null);
    setAddingId(prod.id || prod._id || title);
    toast.show(`Adding ${qty} × ${title}...`);

    try {
      await addItem({ name: title, quantity: qty, price });
      toast.show(`Added ${title} to cart`);
      await loadItems();
    } catch (err) {
      console.error("Add product to cart failed:", err);
      toast.show("Could not add product to cart");
      await loadItems();
    } finally {
      setAddingId(null);
    }
  }

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition || null;
    if (!SpeechRecognition) {
      recognitionRef.current = null;
      return;
    }
    const rec = new SpeechRecognition();
    rec.lang = "en-IN";
    rec.interimResults = false;
    rec.maxAlternatives = 1;

    rec.onstart = () => {
      setListeningState(true);
      toast.show("Listening...");
    };

    rec.onresult = async (ev) => {
      const text = (ev.results && ev.results[0] && ev.results[0][0] && ev.results[0][0].transcript) ? ev.results[0][0].transcript : "";
      try {
        await handleVoiceCommand(text);
      } catch (e) {
        console.error("Error handling voice result:", e);
      }
    };

    rec.onerror = (ev) => {
      console.error("Recognition error:", ev);
      toast.show(ev?.error || "Recognition error");
    };

    rec.onend = () => {
      setListeningState(false);
    };

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

  }, []);

  function startLocalRecognition() {
    if (!recognitionRef.current) {
      toast.show("Speech Recognition not available in this browser.");
      return;
    }
    try {
      recognitionRef.current.start();
    } catch (e) {
      try {
        recognitionRef.current.stop();
        recognitionRef.current.start();
      } catch (ee) {
        console.error("Couldn't start recognition:", ee);
        toast.show("Couldn't start microphone");
      }
    }
  }

  function stopLocalRecognition() {
    try {
      recognitionRef.current?.stop();
    } catch (e) {
      console.error(e);
    }
    setListeningState(false);
  }

  const totalQty = items.reduce((s, it) => s + (it.quantity || it.qty || 0), 0);
  const totalPrice = items.reduce((s, it) => s + ((it.quantity || it.qty || 0) * (it.price || 0)), 0);

  function FirstLetterAvatar({ text, size = 80 }) {
    const letter = (text || "").toString().trim().charAt(0).toUpperCase() || "?";
    const colors = ["from-indigo-600 to-cyan-400", "from-amber-500 to-rose-400", "from-lime-500 to-emerald-400", "from-fuchsia-600 to-pink-400"];
    const idx = (letter.charCodeAt(0) || 65) % colors.length;
    return (
      <div style={{ width: size, height: size }} className={`rounded-lg flex items-center justify-center text-white font-extrabold bg-gradient-to-br ${colors[idx]}`}>
        <span style={{ fontSize: Math.round(size * 0.45) }}>{letter}</span>
      </div>
    );
  }


  const productList = (Array.isArray(itemsData) && itemsData.length > 0)
    ? itemsData.slice(0, 8).map((it, idx) => ({
        id: it.id || `r-${idx}`,
        title: it.name,
        price: it.price,
        rating: it.rating || 4.2,
        raw: it
      }))
    : mockProducts;

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-[#071224] to-[#011827] text-white py-8 md:py-12 transition-colors">
      <div className="fixed inset-x-0 top-5 flex justify-center pointer-events-none z-50 px-4">
        {toast.toast && (
          <div className="pointer-events-auto max-w-xl w-full">
            <div className="mx-auto bg-white/95 text-indigo-900 rounded-2xl px-4 py-3 shadow-xl border border-white/20 flex items-center justify-center font-medium text-sm transition-transform">
              {toast.toast}
            </div>
          </div>
        )}
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-[rgba(255,255,255,0.03)] backdrop-blur-md rounded-2xl p-4 md:p-6 shadow-2xl border border-white/6">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4 gap-3">
                <div className="w-full md:w-auto">
                  <h1 className="text-lg md:text-2xl font-extrabold">🛒 VoiceCart — {user?.name || user?.email}</h1>
                  <div className="text-sm text-slate-300 mt-1">Add items using voice or the quick product cards below.</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className={`p-4 rounded-2xl relative overflow-hidden ${listeningState ? "bg-white text-slate-900" : "bg-[rgba(255,255,255,0.02)] text-white/95"} border border-white/10 shadow-xl transition-all`}>
                  <div className={`absolute -top-6 -right-6 w-44 h-44 rounded-full transform ${listeningState ? "scale-110 opacity-80" : "scale-90 opacity-20"} bg-gradient-to-br from-indigo-600/20 to-indigo-400/6 blur-3xl pointer-events-none`} />

                  <div className="flex items-center justify-between relative z-10">
                    <h3 className={`font-semibold ${listeningState ? "text-slate-900" : "text-white"}`}>
                      <span className="inline-flex items-center gap-2 px-2 py-1 rounded-full">
                        <Mic size={18} /> Voice Input
                      </span>
                    </h3>

                    <div className="text-xs font-medium">
                      <span className="px-2 py-1 rounded-full bg-white/10 text-white">Multilingual</span>
                    </div>
                  </div>

                  <div className="mt-3 relative z-10">
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0">
                        <button
                          onClick={() => (listeningState ? stopLocalRecognition() : startLocalRecognition())}
                          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); (listeningState ? stopLocalRecognition() : startLocalRecognition()); } }}
                          aria-pressed={listeningState}
                          aria-label={listeningState ? "Stop listening" : "Start listening"}
                          className={`w-16 h-16 rounded-full flex items-center justify-center ${listeningState ? "bg-indigo-600 text-white shadow-2xl animate-pulse" : "bg-white/6 text-slate-200"} cursor-pointer transition-transform focus:outline-none ring-2 ring-white/6`}
                        >
                          <Mic size={28} />
                        </button>
                      </div>

                      <div className="flex-1">
                        <div className="text-sm text-slate-300">Tap the mic to start speaking. Try: <span className="text-white font-medium">"Add 2 bananas"</span> or mix Hindi+English: <span className="text-white font-medium">"Milk Jodo !!"</span>.</div>
                      </div>
                    </div>

                    <div className="mt-4">
                      <VoiceInput
                        onResult={async (transcript) => {
                          setListeningState(true);
                          toast.show("Processing voice...");
                          try {
                            await handleVoiceCommand(transcript);
                          } finally {
                            setListeningState(false);
                          }
                        }}
                        onStart={() => {
                          setListeningState(true);
                          toast.show("Listening...");
                        }}
                        onStop={() => {
                          setListeningState(false);
                        }}
                      />
                    </div>
                  </div>

                  <div className="mt-3 bg-[rgba(0,0,0,0.22)] p-3 rounded-md border border-white/6 text-sm relative z-10">
                    <div className="flex justify-between items-center">
                      <div className="text-xs text-slate-300">Detected (translated)</div>
                      <div className="text-xs text-slate-300">Lang: <span className="font-medium text-white">{lastLang || "auto"}</span></div>
                    </div>
                    <div className="mt-1 text-white break-words">{translatedText || <span className="text-slate-400">— nothing yet —</span>}</div>

                    <div className="mt-2 text-xs text-slate-300">Parse preview</div>
                    <div className="mt-1 text-slate-100 text-sm">
                      {parsePreview ? (
                        <>
                          <div><strong>Action:</strong> {parsePreview.action}</div>
                          <div><strong>Qty:</strong> {parsePreview.quantity}</div>
                          <div><strong>Item:</strong> {parsePreview.item || "—"}</div>
                          <div><strong>Lang:</strong> {parsePreview.lang || lastLang || "unknown"}</div>
                        </>
                      ) : (
                        <div className="text-slate-400">— nothing parsed yet —</div>
                      )}
                    </div>
                  </div>

                  <div className="mt-3 text-xs text-slate-300 italic z-10">Tip: speak product names clearly.</div>
                </div>

                <div className="p-4 rounded-2xl bg-[rgba(255,255,255,0.02)] border border-white/6">
                  <h3 className="font-semibold text-white mb-3">🧾 Your Shopping List</h3>

                  {loading ? (
                    <div className="text-slate-300">Loading...</div>
                  ) : items.length === 0 ? (
                    <div className="text-slate-400">No items yet — add via voice or product cards.</div>
                  ) : (
                    <ul className="divide-y divide-white/6 max-h-72 md:max-h-64 overflow-auto">
                      {items.map((it) => {
                        const id = it._id || it.id || it.productId || it.name || Math.random();
                        return (
                          <li key={id} className="flex items-center justify-between py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-lg bg-white/6 flex items-center justify-center text-slate-300 overflow-hidden">
                                {it.image ? <img src={it.image} alt={it.name} className="w-full h-full object-cover" /> : <span className="text-sm">{(it.name || "Item").charAt(0).toUpperCase()}</span>}
                              </div>
                              <div className="min-w-0">
                                <div className="font-medium text-white truncate">{capitalize(it.name)}</div>
                                <div className="text-sm text-slate-300">Qty: {it.quantity} • {formatINR(it.price)}</div>
                              </div>
                            </div>

                            <div className="flex items-center gap-3">
                              <button onClick={() => handleDelete(it._id || it.serverIds?.[0] || it.name)} className="text-rose-400 bg-rose-900/10 px-3 py-1 rounded-md text-sm hover:bg-rose-900/20 transition">Delete</button>
                              <span className="bg-emerald-800/30 text-emerald-300 px-3 py-1 rounded-full text-sm font-semibold">× {it.quantity}</span>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-4">
              {productList.map((p) => (
                <article key={p.id} className="bg-[rgba(255,255,255,0.03)] backdrop-blur-md rounded-2xl p-4 shadow-xl border border-white/6 flex gap-4 items-center hover:scale-[1.01] transition-transform">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center">
                    <FirstLetterAvatar text={p.title || p.name} size={88} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="font-semibold text-white truncate">{p.title}</div>
                        <div className="text-sm text-slate-300 mt-1">{p.rating} ★</div>
                      </div>

                      <div className="text-right">
                        <div className="font-bold text-lg">{formatINR(p.price)}</div>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center gap-3">
                      <button
                        onClick={() => addToCartProduct(p, 1)}
                        disabled={addingId === p.id}
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg ${addingId === p.id ? "bg-indigo-400/60 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-500"} text-white font-semibold transition`}
                      >
                        <ShoppingCart size={14} /> {addingId === p.id ? "Adding..." : "Add"}
                      </button>

                      <button
                        onClick={() => { addToCartProduct(p, 1); toast.show(`Proceed to checkout to buy ${p.title}`); }}
                        className="px-3 py-2 rounded-lg bg-cyan-400 text-slate-900 font-medium transition hover:brightness-95"
                      >
                        Buy
                      </button>

                      <div className="ml-auto text-sm text-slate-400">In stock</div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <aside className="lg:col-span-1">
            <div className="sticky top-16 bg-gradient-to-br from-[#071B2E] to-[#022235] rounded-2xl p-4 md:p-5 shadow-2xl border border-white/6">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-sm text-slate-300">Cart preview</div>
                  <div className="font-bold text-white">{totalQty} item{totalQty !== 1 ? "s" : ""}</div>
                </div>
                <div className="text-cyan-300 font-semibold">{formatINR(totalPrice)}</div>
              </div>

              <div className="space-y-3 min-h-[120px]">
                {loading ? (
                  <div className="text-slate-300 text-center">Loading...</div>
                ) : items.length === 0 ? (
                  <div className="text-slate-400 text-center">No items in cart</div>
                ) : (
                  items.slice(0, 6).map((it) => {
                    const id = it._id || it.id || it.productId || it.name || Math.random();
                    return (
                      <div key={id} className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-white/6 flex items-center justify-center overflow-hidden">
                          {it.image ? <img src={it.image} alt={it.name} className="w-full h-full object-contain" /> : <div className="text-slate-300">{(it.name || "I").charAt(0)}</div>}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-white truncate">{it.name}</div>
                          <div className="text-sm text-slate-300">Qty {it.quantity} • {formatINR(it.price)}</div>
                        </div>

                        <div className="text-white font-semibold">{formatINR(((it.quantity||0)*(it.price||0)))}</div>
                      </div>
                    );
                  })
                )}
              </div>

              <div className="mt-5 flex items-center gap-3">
                <button onClick={() => window.location.href = "/dashboard"} className="flex-1 px-4 py-2 rounded-lg bg-white/6 border border-white/8 text-slate-200 hover:scale-[1.02] transition">View Cart</button>
                <button onClick={() => (window.location.href = "/checkout")} className="px-4 py-2 rounded-lg bg-cyan-400 text-slate-900 font-semibold hover:brightness-95 transition">Checkout</button>
              </div>

              <div className="mt-4 text-xs text-slate-400">Tip: you can also add items using voice (try “Add 2 bananas”).</div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
