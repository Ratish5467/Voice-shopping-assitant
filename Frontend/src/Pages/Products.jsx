
import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { ShoppingCart, Star } from "lucide-react";
import { addItem, fetchItems } from "../services/api";
import itemsData from "../data/items"; 

function formatINR(v) {
  try {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(v);
  } catch {
    return `₹${v}`;
  }
}

function Stars({ rating = 0 }) {
  const filled = Math.floor(rating);
  const half = rating - filled >= 0.5;
  const total = 5;
  const arr = [];
  for (let i = 0; i < filled; i++) arr.push(<Star key={`s${i}`} size={14} className="text-amber-400" />);
  if (half) arr.push(<Star key="half" size={14} className="text-amber-400 opacity-60" />);
  for (let j = arr.length; j < total; j++) arr.push(<Star key={`e${j}`} size={14} className="text-amber-400 opacity-30" />);
  return <div className="flex items-center gap-1">{arr}</div>;
}

/* deterministic bg color based on name */
function bgForName(name) {
  const colors = [
    "from-[#06b6d4] to-[#6366f1]",
    "from-[#f97316] to-[#ef4444]",
    "from-[#10b981] to-[#06b6d4]",
    "from-[#f59e0b] to-[#ef4444]",
    "from-[#8b5cf6] to-[#ec4899]",
    "from-[#06b6d4] to-[#0891b2]"
  ];
  const n = (name || "").trim().toLowerCase().charCodeAt(0) || 65;
  return colors[n % colors.length];
}

function Avatar({ title, size = 80 }) {
  const letter = (title || " ").trim().charAt(0).toUpperCase() || "?";
  const bgClass = bgForName(title);
  return (
    <div className={`rounded-xl flex-shrink-0 flex items-center justify-center text-white font-extrabold`} style={{ width: size, height: size }}>
      <div className={`w-full h-full rounded-xl bg-gradient-to-br ${bgClass} flex items-center justify-center text-3xl`}>
        {letter}
      </div>
    </div>
  );
}

export default function Products() {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("popular");
  const [addingMap, setAddingMap] = useState({});
  const [qtyMap, setQtyMap] = useState(() => {
    const m = {};
    itemsData.forEach((p) => (m[p.id] = 1));
    return m;
  });
  const [message, setMessage] = useState("");

  const products = useMemo(() => itemsData, []);
  const visible = useMemo(() => {
    const q = (query || "").toLowerCase().trim();
    let list = products.filter(
      (p) =>
        (p.name + " " + (p.category || "") + " " + (p.brand || "") + " " + (p.tags || []).join(" ")).toLowerCase().includes(q)
    );
    if (sort === "price-asc") list = [...list].sort((a, b) => a.price - b.price);
    else if (sort === "price-desc") list = [...list].sort((a, b) => b.price - a.price);
    else if (sort === "rating") list = [...list].sort((a, b) => (b.rating || 0) - (a.rating || 0));
    return list;
  }, [products, query, sort]);

  function setQty(id, q) {
    setQtyMap((prev) => ({ ...prev, [id]: Math.max(1, Math.min(10, Number(q) || 1)) }));
  }

  async function handleAdd(prod) {
    if (!prod) return;
    const id = prod.id;
    const qty = qtyMap[id] || 1;
    setAddingMap((s) => ({ ...s, [id]: true }));
    setMessage(`Adding ${qty} × ${prod.name} to cart...`);
    try {
      await addItem({ name: prod.name, quantity: qty, price: prod.price });

      try {
        const items = await fetchItems();
        const arr = Array.isArray(items) ? items : [];
        const count = arr.reduce((s, it) => s + (it.quantity || it.qty || 0), 0);
        window.dispatchEvent(new CustomEvent("cart-update", { detail: { count } }));
      } catch (e) {
        window.dispatchEvent(new CustomEvent("cart-update", { detail: { count: null } }));
      }

      setMessage(`${qty} × ${prod.name} added to cart`);
    } catch (err) {
      console.error("Add failed", err);
      setMessage("Could not add to cart — check console.");
    } finally {
      setAddingMap((s) => ({ ...s, [id]: false }));
      setTimeout(() => setMessage(""), 2200);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-[#071224] to-[#011827] text-white py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-extrabold">Products</h1>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="flex items-center gap-2 bg-[rgba(255,255,255,0.03)] border border-white/6 rounded-lg px-3 py-2 flex-1 md:flex-initial">
              <svg className="w-4 h-4 text-slate-300" viewBox="0 0 24 24" fill="none"><path d="M11 4a7 7 0 100 14 7 7 0 000-14zM21 21l-4.35-4.35" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              <input
                placeholder="Search items..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="bg-transparent focus:outline-none text-sm placeholder:text-slate-400 text-white w-full"
              />
            </div>

            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="bg-[rgba(255,255,255,0.03)] border border-white/6 rounded-lg px-3 py-2 text-sm"
            >
              <option value="popular">Sort: Popular</option>
              <option value="price-asc">Price: Low → High</option>
              <option value="price-desc">Price: High → Low</option>
              <option value="rating">Rating</option>
            </select>
          </div>
        </div>

        {message && <div className="mb-4 text-sm text-slate-200">{message}</div>}

        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {visible.map((p) => (
            <motion.article
              key={p.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.28 }}
              whileHover={{ scale: 1.01 }}
              className="bg-[rgba(255,255,255,0.02)] backdrop-blur-md rounded-2xl p-4 shadow-2xl border border-white/6 flex flex-col gap-3"
            >
              <div className="flex items-start gap-4">
                <Avatar title={p.name} size={72} />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white">{p.name}</h3>
                  <div className="text-sm text-slate-400">{p.brand} • {p.unit}</div>
                </div>
              </div>

              <div className="mt-1 flex items-center justify-between">
                <div>
                  <div className="text-slate-300 text-sm">Per unit</div>
                  <div className="text-xl font-bold mt-1">{formatINR(p.price)}</div>
                </div>

                <div className="text-right">
                  <Stars rating={p.rating || 4.2} />
                  <div className="text-sm text-slate-400 mt-1">{p.category}</div>
                </div>
              </div>

         
              <div className="mt-3 flex flex-col sm:flex-row sm:items-center gap-2">
             
                <div className="inline-flex items-center bg-[rgba(255,255,255,0.02)] border border-white/6 rounded-md overflow-hidden">
                  <button
                    onClick={() => setQty(p.id, Math.max(1, (qtyMap[p.id] || 1) - 1))}
                    className="px-3 py-2 text-sm sm:px-3 sm:py-2"
                    aria-label="Decrease quantity"
                    disabled={(qtyMap[p.id] || 1) <= 1}
                  >
                    −
                  </button>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={qtyMap[p.id] ?? 1}
                    onChange={(e) => setQty(p.id, e.target.value)}
                    className="w-14 text-center bg-transparent px-2 py-2 focus:outline-none text-sm"
                  />
                  <button
                    onClick={() => setQty(p.id, Math.min(10, (qtyMap[p.id] || 1) + 1))}
                    className="px-3 py-2 text-sm sm:px-3 sm:py-2"
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>

              
                <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                  <button
                    onClick={() => handleAdd(p)}
                    disabled={!!addingMap[p.id]}
                    className={`inline-flex items-center gap-2 px-3 py-2 rounded-md font-semibold ${addingMap[p.id] ? "bg-indigo-400/60 cursor-not-allowed" : "bg-gradient-to-r from-indigo-500 to-cyan-400 text-slate-900"} text-sm sm:px-4 sm:py-2 shadow`}
                  >
                    <ShoppingCart size={14} /> {addingMap[p.id] ? "Adding..." : "Add"}
                  </button>

                  <button
                    onClick={() => { handleAdd(p); setMessage(`Proceed to checkout to buy ${p.name}`); }}
                    className="px-3 py-2 rounded-md border border-white/8 text-sm"
                  >
                    Buy
                  </button>
                </div>

                <div className="ml-auto text-sm text-slate-400 hidden sm:block">{p.tags?.[0] || ""}</div>
              </div>

        
              <div className="text-sm text-slate-400 mt-1 sm:hidden">{p.tags?.[0] || ""}</div>
            </motion.article>
          ))}
        </div>

        <div className="mt-6 text-center text-slate-400">Showing {visible.length} items</div>
      </div>
    </main>
  );
}
