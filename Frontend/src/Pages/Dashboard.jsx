
import React, { useState, useEffect, useRef, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Mic, ShoppingCart } from "lucide-react";
import { fetchItems, addItem, deleteItem, fetchPrice } from "../services/api";
import itemsDataRaw from "../data/items";
import parseAndTranslateVoice from "../utils/translateParser";
import { parseVoice } from "../utils/parser";
import VoiceInput from "../components/VoiceInput";

const itemsData = Array.isArray(itemsDataRaw) ? itemsDataRaw : [];

function capitalize(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : "";
}

function formatINR(v) {
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(v);
  } catch {
    return `₹${v}`;
  }
}


function useToast(timeout = 3000) {
  const [toast, setToast] = useState(null);
  const timer = useRef(null);
  function show(msg) {
    setToast(msg);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(null), timeout);
  }
  return { toast, show };
}


function normalizeServerItems(list) {
  if (!Array.isArray(list)) return [];
  const map = new Map();
  list.forEach((it) => {
    const name = (it.name || "").trim().toLowerCase();
    const qty = Number(it.quantity || it.qty || 0);
    const price = Number(it.price || 0);
    if (!map.has(name)) {
      map.set(name, {
        name: it.name,
        quantity: qty,
        total: qty * price,
        price,
        _id: it._id,
        serverIds: it._id ? [it._id] : [],
      });
    } else {
      const x = map.get(name);
      x.quantity += qty;
      x.total += qty * price;
      if (it._id) x.serverIds.push(it._id);
    }
  });
  return [...map.values()].map((x) => ({
    name: x.name,
    quantity: x.quantity,
    price: x.total / (x.quantity || 1),
    _id: x._id || (x.serverIds && x.serverIds[0]),
    serverIds: x.serverIds,
  }));
}

export default function Dashboard() {
  const { user } = useContext(AuthContext);

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addingId, setAddingId] = useState(null);

  const [translatedText, setTranslatedText] = useState("");
  const [parsePreview, setParsePreview] = useState(null);
  const [lastMatch, setLastMatch] = useState(null);

  const [listeningState, setListeningState] = useState(false);
  const recognitionRef = useRef(null);

  const toast = useToast(3500);

  // LOAD ITEMS
  async function loadItems() {
    setLoading(true);
    try {
      const res = await fetchItems();
      const norm = normalizeServerItems(res);
      setItems(norm);
    } catch (e) {
      console.error("loadItems error:", e);
      toast.show("Could not load items");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadItems();
  }, []);

  // merge local
  function mergeItemLocally(name, qty, price) {
    setItems((prev) => {
      const arr = [...prev];
      const idx = arr.findIndex((x) => (x.name || "").toLowerCase() === (name || "").toLowerCase());
      if (idx >= 0) {
        
        arr[idx] = { ...arr[idx], quantity: Number(arr[idx].quantity || 0) + Number(qty || 0) };
        return arr;
      } else {
        return [{ name, quantity: qty, price, _id: null, serverIds: [] }, ...arr];
      }
    });
  }

  
  function matchProductName(query) {
    if (!query) return null;
    const q = query.toLowerCase();
    let best = null;
    let score = 0;
    itemsData.forEach((p) => {
      const title = (p.name || "").toLowerCase();
      const tags = (p.tags || []).join(" ").toLowerCase();
      let s = 0;
      if (title === q) s += 10;
      if (title.includes(q)) s += 5;
      if (tags.includes(q)) s += 3;
      if (q.startsWith(title)) s += 1;
      if (s > score) {
        score = s;
        best = p;
      }
    });
    return best;
  }

  function normalizeKey(x) {
    if (x === undefined || x === null) return "";
    return String(x).toLowerCase().trim();
  }

  function findItemByName(nameOrId) {
    if (!nameOrId) return null;
    const key = normalizeKey(nameOrId);


    const byId = items.find(it => it._id && normalizeKey(it._id) === key);
    if (byId) return byId;


    const byServerId = items.find(it => Array.isArray(it.serverIds) && it.serverIds.some(id => normalizeKey(id) === key));
    if (byServerId) return byServerId;


    const direct = items.find(it => {
      const nm = normalizeKey(it.name);
      if (!nm) return false;
      if (nm === key) return true;
      if (nm.includes(key)) return true;
      if (key.includes(nm)) return true;
      if (nm.replace(/s$/, "") === key.replace(/s$/, "")) return true;
      return false;
    });
    if (direct) return direct;

    const targetTokens = key.split(/\s+/).filter(Boolean);
    if (targetTokens.length) {
      const tokMatch = items.find(it => {
        const nm = normalizeKey(it.name);
        return targetTokens.every(tok => tok && (nm.includes(tok) || nm.replace(/s$/, "").includes(tok.replace(/s$/, ""))));
      });
      if (tokMatch) return tokMatch;
    }

    
    const cat = matchProductName(nameOrId);
    if (cat && cat.name) {
      const catKey = normalizeKey(cat.name);
      const catFound = items.find(it => {
        const nm = normalizeKey(it.name);
        if (!nm) return false;
        if (nm === catKey) return true;
        if (nm.includes(catKey)) return true;
        if (catKey.includes(nm)) return true;
        return false;
      });
      if (catFound) return catFound;
    }

  
    return null;
  }


  function findBestMatchForSpoken(itemText) {
    if (!itemText) return null;
    return matchProductName(itemText);
  }

  
  async function addToCartByProduct(productObj, qty = 1) {
    if (!productObj) return toast.show("Product data missing");
    const title = productObj.name || productObj.title || productObj.id;
    const price = Number(productObj.price || 0);
    mergeItemLocally(title, Number(qty || 1), price);
    setAddingId(title);
    try {
      await addItem({ name: title, quantity: Number(qty || 1), price });
      toast.show(`Added ${qty} × ${title}`);
      await loadItems();
    } catch (err) {
      console.error("Add failed:", err);
      toast.show("Add failed");
      await loadItems();
    } finally {
      setAddingId(null);
    }
  }

 async function handleDelete(targetIdOrName) {
    if (!targetIdOrName) {
      toast.show("Invalid delete request");
      console.warn("handleDelete called with empty target");
      return;
    }

    console.info("handleDelete called for:", targetIdOrName);
    console.info("CURRENT CART ITEMS:", items);


    let found = findItemByName(targetIdOrName);

   
    if (!found) {
      const cleaned = String(targetIdOrName).replace(/["'`]/g, "").trim();
      if (cleaned !== targetIdOrName) {
        found = findItemByName(cleaned);
      }
    }


    if (!found) {
      const cat = matchProductName(targetIdOrName);
      if (cat && cat.name) {
        console.info("Catalogue fallback matched:", cat.name);
        found = findItemByName(cat.name);
      }
    }

   
    if (!found) {
      const targetTokens = normalizeKey(targetIdOrName).split(/\s+/).filter(Boolean);
      if (targetTokens.length) {
        for (const it of items) {
          const iname = normalizeKey(it.name);
         
          const hits = targetTokens.filter(tok => iname.includes(tok) || iname.replace(/s$/, "").includes(tok.replace(/s$/, ""))).length;
          if (hits >= Math.max(1, Math.floor(targetTokens.length / 2))) {
            found = it;
            console.info("Token-loose fallback matched item", it.name, "for tokens", targetTokens);
            break;
          }
        }
      }
    }

    if (!found) {
      toast.show("Item not in cart");
      console.info("handleDelete: could not resolve", targetIdOrName, "— items:", items);
      return;
    }

    console.info("handleDelete: resolved to", found);


    const serverIds = Array.isArray(found.serverIds) ? found.serverIds.filter(Boolean) : (found._id ? [found._id] : []);
    const primaryId = found._id || serverIds[0] || null;
    if (!primaryId && (!serverIds || serverIds.length === 0)) {
      setItems(prev => prev.filter(i => i !== found));
      toast.show("Removed local item");
      return;
    }

  
    const prevItems = items;
    setItems(prev => prev.filter(i => i !== found && normalizeKey(i._id) !== normalizeKey(primaryId)));

    toast.show("Deleting...");

    try {
      if (serverIds.length > 1) {
        for (const sid of serverIds) {
          try {
            await deleteItem(sid);
            console.info("Deleted server id", sid);
          } catch (e) {
            console.warn("Failed deleteItem for sid", sid, e);
          }
        }
      } else {
        await deleteItem(primaryId);
      }
      toast.show("Deleted ✔");
      await loadItems();
    } catch (err) {
      console.error("Delete error:", err);
      setItems(prevItems);
      toast.show("Delete failed");
      await loadItems();
    }
  }

  async function handleVoiceCommand(rawText) {
    if (!rawText || !rawText.trim()) {
      toast.show("No voice input");
      return;
    }

    setParsePreview(null);
    setTranslatedText("");
    setLastMatch(null);
    setListeningState(true);
    toast.show("Processing voice...");

    try {
      const { parsed, translatedText: tText } = await parseAndTranslateVoice(rawText || "");
      setTranslatedText(tText || rawText);
      setParsePreview(parsed || null);

      const action = (parsed && parsed.action) || "unknown";
      const qtyRequested = Number((parsed && parsed.quantity) || 1);
      const itemText = (parsed && (parsed.item || parsed.name)) || (tText || rawText);

      if (!itemText || itemText.trim().length === 0) {
        toast.show("Could not detect item");
        return;
      }

      
      const matched = findBestMatchForSpoken(itemText);
      setLastMatch(matched || null);

      if (!matched) {
        toast.show(`"${itemText}" not found in store`);
        return;
      }

      const prod = matched;

     
      if (action === "add" || action === "buy") {
        await addToCartByProduct(prod, qtyRequested);
        return;
      }

     
      if (action === "delete" || action === "remove") {
        const norm = (s = "") => String(s || "").toLowerCase().trim();
        const spokenNorm = norm(itemText || tText || rawText);

        let existing = items.find(it => {
          const iname = norm(it.name);
          if (!iname) return false;
          if (iname === norm(prod.name)) return true;
          if (iname.includes(norm(prod.name))) return true;
          if (norm(prod.name).includes(iname)) return true;
       
          if (iname.replace(/s$/, "") === norm(prod.name).replace(/s$/, "")) return true;
          return false;
        });

        if (!existing) {
          const tokens = spokenNorm.split(/\s+/).filter(Boolean);
          existing = items.find(it => {
            const iname = norm(it.name);
            return tokens.some(tok => {
              if (!tok) return false;
              if (iname === tok) return true;
              if (iname.includes(tok)) return true;
              if (iname.includes(tok.replace(/s$/, ""))) return true;
              return false;
            });
          });
        }

        
        if (!existing) {
          const prodTags = (prod.tags || []).map(t => norm(t));
          const prodParts = norm(prod.name).split(/\s+/).filter(Boolean);
          existing = items.find(it => {
            const iname = norm(it.name);
            if (prodTags.some(tag => tag && iname.includes(tag))) return true;
            if (prodParts.some(p => p && (iname === p || iname.includes(p)))) return true;
            return false;
          });
        }

      
        console.info("Voice delete debug:", { rawText, itemText, prodName: prod.name, items, existing });

        
        if (!existing) {
          await handleDelete(prod.name);
          return;
        }

        const existingQty = Number(existing.quantity || 0);
        const removeQty = Number(Number.isFinite(qtyRequested) ? qtyRequested : 1);

       
        if (removeQty > 0 && removeQty < existingQty) {
          
          const remaining = existingQty - removeQty;
      
          setItems(prev => prev.map(it => (it === existing ? { ...it, quantity: remaining } : it)));

          if (!existing._id) {
            toast.show(`Removed ${removeQty} × ${existing.name} (local)`);
            return;
          }

          try {
            toast.show(`Removing ${removeQty} × ${existing.name}...`);
          
            const sids = Array.isArray(existing.serverIds) && existing.serverIds.length ? existing.serverIds : existing._id ? [existing._id] : [];
            for (const sid of sids) {
              try {
                await deleteItem(sid);
              } catch (e) {
                console.warn("partial-delete failed for", sid, e);
              }
            }
            if (remaining > 0) {
              await addItem({ name: existing.name, quantity: remaining, price: existing.price || 0 });
            }
            toast.show(`Removed ${removeQty} × ${existing.name}`);
            await loadItems();
          } catch (err) {
            console.error("Partial remove failed:", err);
            toast.show("Remove failed");
            await loadItems();
          }
          return;
        }

        await handleDelete(existing._id || existing.serverIds?.[0] || existing.name);
        return;
      }


      toast.show("Command not recognized — try: add 2 bananas / remove 2 bananas");
    } catch (err) {
      console.error("Voice processing failed:", err);

      try {
        const p = parseVoice(rawText || "");
        setParsePreview(p);
        if (p.action === "add" && p.item) {
          const m = matchProductName(p.item);
          if (m) {
            await addToCartByProduct(m, p.quantity || 1);
          } else {
            toast.show(`${p.item} not found`);
          }
        } else if (p.action === "delete" && p.item) {
          const m = matchProductName(p.item);
          if (m) {
            const existing = findItemByName(m.name);
            if (existing) {
              if (p.quantity && Number(p.quantity) < (existing.quantity || 0)) {
                
                setItems(prev => prev.map(it => (it === existing ? { ...it, quantity: (existing.quantity - Number(p.quantity)) } : it)));
                toast.show(`Removed ${p.quantity} × ${existing.name}`);
              } else {
                await handleDelete(existing._id || existing.name);
              }
            } else {
              toast.show(`${m.name} not in cart`);
            }
          } else {
            toast.show(`${p.item} not found`);
          }
        } else {
          toast.show("Could not parse voice");
        }
      } catch (e) {
        console.error("Fallback parse failed:", e);
        toast.show("Voice error");
      }
    } finally {
      setListeningState(false);
    }
  }

 
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition || null;
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
      const text =
        ev.results && ev.results[0] && ev.results[0][0] && ev.results[0][0].transcript
          ? ev.results[0][0].transcript
          : "";
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

  // UI data + helpers
  const totalQty = items.reduce((s, it) => s + (it.quantity || 0), 0);
  const totalPrice = items.reduce((s, it) => s + (it.quantity || 0) * (it.price || 0), 0);

  function FirstLetterAvatar({ text, size = 80 }) {
    const letter = (text || "").charAt(0).toUpperCase() || "?";
    return (
      <div style={{ width: size, height: size }} className="rounded-lg flex items-center justify-center text-white font-extrabold bg-gradient-to-br from-indigo-600 to-cyan-400">
        <span style={{ fontSize: size * 0.45 }}>{letter}</span>
      </div>
    );
  }

  const productList = itemsData.slice(0, 8);

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-[#071224] to-[#011827] text-white py-8 md:py-12">

      {/* Toast */}
      <div className="fixed inset-x-0 top-5 flex justify-center pointer-events-none z-50 px-4">
        {toast.toast && (
          <div className="max-w-xl w-full pointer-events-auto">
            <div className="mx-auto bg-white/95 text-indigo-900 rounded-2xl px-4 py-3 shadow-xl border border-white/20 font-medium text-sm">
              {toast.toast}
            </div>
          </div>
        )}
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* LEFT SECTION */}
          <div className="lg:col-span-2">
            <div className="bg-[rgba(255,255,255,0.03)] rounded-2xl p-4 md:p-6 shadow-2xl border border-white/10">

              <h1 className="text-lg md:text-2xl font-extrabold">🛒 VoiceCart — {user?.name || user?.email}</h1>
              <div className="text-sm text-slate-300 mt-1">Add items using voice or product cards.</div>

              {/* GRID: Voice + Shopping List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">

                {/* VOICE INPUT PANEL */}
                <div className={`p-4 rounded-2xl ${listeningState ? "bg-white text-slate-900" : "bg-white/5 text-white"}`}>
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold flex items-center gap-2"><Mic size={18} /> Voice Input</h3>
                    <span className="text-xs px-2 py-1 rounded-full bg-white/10">Multilingual</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <h3 className="font-small flex items-center gap-2 mt-2 mr-2"> Speak clear phareses likee "add Banana or add apple" </h3>
                    
                  </div>

                  <div className="mt-3">
                    <button
                      onClick={() => (listeningState ? stopLocalRecognition() : startLocalRecognition())}
                      className={`w-16 h-16 rounded-full flex items-center justify-center ${listeningState ? "bg-indigo-600 text-white animate-pulse" : "bg-white text-slate-900"} shadow-lg`}
                    >
                      <Mic size={28} />
                    </button>
                  </div>

                 

                  {/* TRANSLATED & PARSE PREVIEW */}
                  <div className="mt-4 bg-black/20 p-3 rounded-md text-sm">
                    <div className="text-xs text-slate-300">Translated</div>
                    <div className="text-white mt-1 break-words">{translatedText || "—"}</div>

                    <div className="mt-3 text-xs text-slate-300">Parsed</div>
                    <div className="text-white">
                      {parsePreview ? (
                        <>
                          <div><b>Action:</b> {parsePreview.action}</div>
                          <div><b>Qty:</b> {parsePreview.quantity}</div>
                          <div><b>Item:</b> {parsePreview.item}</div>
                        </>
                      ) : (
                        "—"
                      )}
                    </div>
                  </div>
                </div>

                {/* SHOPPING LIST PANEL */}
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                  <h3 className="font-semibold text-white mb-3">🧾 Your Shopping List</h3>

                  {loading ? (
                    <div className="text-slate-300">Loading...</div>
                  ) : items.length === 0 ? (
                    <div className="text-slate-400">No items yet</div>
                  ) : (
                    <ul className="divide-y divide-white/10 max-h-72 overflow-auto">
                      {items.map((it) => (
                        <li key={it._id || it.name} className="flex items-center justify-between py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center">
                              {it.image ? <img src={it.image} className="w-full h-full object-cover" /> : <span>{(it.name||"").charAt(0)}</span>}
                            </div>

                            <div>
                              <div className="font-medium">{capitalize(it.name)}</div>
                              <div className="text-xs text-slate-300">Qty: {it.quantity} • {formatINR(it.price)}</div>
                            </div>
                          </div>

                          <button onClick={() => handleDelete(it._id ?? it.serverIds?.[0] ?? it.name)} className="text-rose-400 bg-rose-900/20 px-3 py-1 rounded-md text-sm">Delete</button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>

            {/* PRODUCT CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 mt-6">
              {productList.map((p) => (
                <div key={p.id} className="bg-white/5 rounded-2xl p-4 border border-white/10 flex gap-4">
                  <FirstLetterAvatar text={p.name} size={80} />
                  <div className="flex-1">
                    <div className="font-semibold">{p.name}</div>
                    <div className="text-slate-300 text-sm">{formatINR(p.price)}</div>

                    <div className="mt-3 flex gap-3">
                      <button onClick={() => addToCartByProduct(p, 1)} disabled={addingId === p.name} className="px-4 py-2 rounded-lg bg-indigo-600 text-white">
                        {addingId === p.name ? "Adding..." : "Add"}
                      </button>

                      <button onClick={() => { addToCartByProduct(p, 1); toast.show(`Proceed to checkout for ${p.name}`); }} className="px-3 py-2 rounded-lg bg-cyan-400 text-black">
                        Buy
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div> 

          {/* RIGHT SIDEBAR */}
          <aside className="lg:col-span-1">
            <div className="sticky top-16 bg-gradient-to-br from-[#071B2E] to-[#022235] rounded-2xl p-4 md:p-5 shadow-2xl border border-white/6">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-sm text-slate-300">Cart preview</div>
                  <div className="font-bold text-white">{totalQty} item{totalQty !== 1 ? "s" : ""}</div>
                </div>
                <div className="text-cyan-300 font-semibold">{formatINR(totalPrice)}</div>
              </div>

              <div className="space-y-3 min-h-[120px] max-h-64 overflow-auto">
                {loading ? (
                  <div className="text-slate-300 text-center">Loading...</div>
                ) : items.length === 0 ? (
                  <div className="text-slate-400 text-center">No items in cart</div>
                ) : (
                  items.map((it) => (
                    <div key={it._id || it.name} className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-white/6 flex items-center justify-center overflow-hidden">
                        {it.image ? <img src={it.image} alt={it.name} className="w-full h-full object-contain" /> : <div className="text-slate-300">{(it.name || "I").charAt(0)}</div>}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-white truncate">{it.name}</div>
                        <div className="text-sm text-slate-300">Qty {it.quantity} • {formatINR(it.price)}</div>
                      </div>

                      <div className="text-white font-semibold">{formatINR(((it.quantity||0)*(it.price||0)))}</div>
                    </div>
                  ))
                )}
              </div>

              <div className="mt-5 flex items-center gap-3">
                <button onClick={() => (window.location.href = "/dashboard")} className="flex-1 px-4 py-2 rounded-lg bg-white/6 border border-white/8 text-slate-200 hover:scale-[1.02] transition">View Cart</button>
                <button onClick={() => (window.location.href = "/checkout")} className="px-4 py-2 rounded-lg bg-cyan-400 text-slate-900 font-semibold hover:brightness-95 transition">Checkout</button>
              </div>

              <div className="mt-4 text-xs text-slate-400">Tip: speak clearly — e.g. "Add 2 apples" or "Do aloo jodo".</div>
            </div>
          </aside>

        </div>
      </div>
    </main>
  );
}
