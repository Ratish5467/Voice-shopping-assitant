
import React, { useState, useContext, useEffect, useRef } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Menu, X, ShoppingCart, LogIn, User, Bell, Home, Box, Grid } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { AuthContext } from "../context/AuthContext";
import LoginModal from "../Pages/LoginModal";
import { fetchItems } from "../services/api";


export default function Header({ onOpenCart }) {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [count, setCount] = useState(0);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewItems, setPreviewItems] = useState([]);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const previewRef = useRef(null);
  const headerRef = useRef(null);

  const displayName = user ? (user.name || (user.email ? user.email.split("@")[0] : "User")) : "";

  useEffect(() => {
    async function loadCart() {
      try {
        const data = await fetchItems();
        if (Array.isArray(data)) {
          const qty = data.reduce((s, it) => s + (it.quantity ?? it.qty ?? 0), 0);
          setCount(qty);
          setPreviewItems(data.slice(0, 4).map(it => ({
            id: it._id || it.id || Math.random().toString(36).slice(2,9),
            name: it.name || it.title || it.product || "Item",
            qty: it.quantity ?? it.qty ?? 1,
            price: it.price ?? it.unitPrice ?? 0,
            image: it.image ?? it.img ?? null
          })));
        } else {
          setCount(0);
          setPreviewItems([]);
        }
      } catch (e) {
        console.error("Header cart fetch:", e);
        setCount(0);
        setPreviewItems([]);
      }
    }

    loadCart();
    function onCartUpdate(e) {
      const c = e?.detail?.count;
      if (typeof c === "number") setCount(c);
      else loadCart();
    }
    window.addEventListener("cart-update", onCartUpdate);
    return () => window.removeEventListener("cart-update", onCartUpdate);
  }, []);

  
  useEffect(() => {
    if (!headerRef.current) return;
    const el = headerRef.current;
    function setHeaderHeight() {
      const h = el.offsetHeight;
      document.documentElement.style.setProperty("--header-height", `${h}px`);
    }
    setHeaderHeight();
    let ro;
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(() => setHeaderHeight());
      ro.observe(el);
    } else {
      window.addEventListener("resize", setHeaderHeight);
    }
    window.addEventListener("load", setHeaderHeight);
    return () => {
      if (ro) ro.disconnect();
      else window.removeEventListener("resize", setHeaderHeight);
      window.removeEventListener("load", setHeaderHeight);
    };
  }, []);

  useEffect(() => {
    function onDoc(e) {
      if (previewRef.current && !previewRef.current.contains(e.target)) setPreviewOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  function handleLogout() {
    logout?.();
    setOpen(false);
    navigate("/");
  }

  function handleCartClick() {
    try { onOpenCart?.(); } catch (e) {}
    navigate("/dashboard");
  }

  async function openPreview() {
    setPreviewOpen(true);
    setLoadingPreview(true);
    try {
      const data = await fetchItems();
      if (Array.isArray(data)) {
        setPreviewItems(data.slice(0,4).map(it => ({
          id: it._id || it.id || Math.random().toString(36).slice(2,9),
          name: it.name || it.title || it.product || "Item",
          qty: it.quantity ?? it.qty ?? 1,
          price: it.price ?? it.unitPrice ?? 0,
          image: it.image ?? it.img ?? null
        })));
      } else {
        setPreviewItems([]);
      }
    } catch (e) {
      console.error("Preview load error:", e);
      setPreviewItems([]);
    } finally {
      setLoadingPreview(false);
    }
  }

  const subtotal = previewItems.reduce((s, it) => s + (it.qty || 0) * (it.price || 0), 0);

  return (
    <header ref={headerRef} className="fixed top-0 left-0 right-0 z-50  ">
     
      <div className="backdrop-blur-md bg-gradient-to-br from-[#071224]/80 via-[#021827]/70 to-[#00151f]/70 border-b border-white/6">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-4">

          {/* Brand */}
          <NavLink to="/" className="flex items-center gap-3 group" aria-label="VoiceCart home">
            <motion.div whileHover={{ scale: 1.06 }} className="w-12 h-12 rounded-xl flex items-center justify-center font-extrabold shadow-2xl transform transition-transform duration-300" style={{ background: "linear-gradient(135deg,#0ea5a4 0%,#6366f1 50%,#ec4899 100%)" }}>
              <div className="text-white text-lg">VC</div>
            </motion.div>

            <div className="hidden sm:block">
              <div className="text-lg font-extrabold text-white tracking-tight">VoiceCart</div>
              <div className="text-xs text-slate-300">Say → Find → Buy</div>
            </div>
          </NavLink>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6">
            <NavLink to="/" className={({isActive}) => `text-sm font-medium ${isActive ? "text-cyan-300" : "text-slate-200"} hover:text-cyan-300 transition`}>Home</NavLink>
            <NavLink to="/products" className={({isActive}) => `text-sm font-medium ${isActive ? "text-cyan-300" : "text-slate-200"} hover:text-cyan-300 transition`}>Products</NavLink>
            <NavLink to="/dashboard" className={({isActive}) => `text-sm font-medium ${isActive ? "text-cyan-300" : "text-slate-200"} hover:text-cyan-300 transition`}>Dashboard</NavLink>
          </nav>

       
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-3">
         
              <button aria-label="Notifications" className="p-2 rounded-lg bg-white/4 hover:bg-white/6 transition flex items-center" title="Notifications">
                <Bell size={18} color="#e6eef6" />
              </button>

             
              <div className="relative" ref={previewRef}>
                <button onClick={() => handleCartClick()} onMouseEnter={() => openPreview()} onFocus={() => openPreview()} aria-haspopup="dialog" aria-expanded={previewOpen} className="relative p-2 rounded-lg flex items-center gap-2" style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)", boxShadow: "0 6px 18px rgba(2,6,23,0.6)" }}>
                  <ShoppingCart size={18} color="#dbeafe" />
                  <span className="sr-only">Cart</span>

                  <span className="absolute -top-2 -right-2 inline-flex items-center justify-center px-2 py-0.5 text-xs font-semibold leading-none text-white rounded-full" style={{ background: "linear-gradient(90deg,#ec4899,#06b6d4)", boxShadow: "0 6px 12px rgba(0,0,0,0.45)" }}>
                    {count}
                  </span>
                </button>

                <AnimatePresence>
                  {previewOpen && (
                    <motion.div initial={{ opacity: 0, y: -8, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, scale: 0.98 }} transition={{ duration: 0.14 }} className="absolute right-0 mt-2 w-80 bg-[rgba(4,8,14,0.9)] border border-white/6 rounded-xl shadow-2xl p-3 text-sm z-50">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium text-slate-100">Cart preview</div>
                        <div className="text-xs text-slate-400">{count} item{count !== 1 ? "s" : ""}</div>
                      </div>

                      <div className="max-h-40 overflow-auto space-y-2">
                        {loadingPreview ? (
                          <div className="text-center text-slate-400 py-6">Loading...</div>
                        ) : previewItems.length === 0 ? (
                          <div className="text-center text-slate-400 py-6">Your cart is empty</div>
                        ) : (
                          previewItems.map(it => (
                            <div key={it.id} className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-lg bg-slate-800 flex items-center justify-center overflow-hidden border border-white/4">
                                {it.image ? <img src={it.image} alt={it.name} className="object-contain w-full h-full" /> : <div className="text-xs text-slate-400">{it.name.charAt(0).toUpperCase()}</div>}
                              </div>
                              <div className="flex-1">
                                <div className="font-medium text-slate-100">{it.name}</div>
                                <div className="text-xs text-slate-400">Qty {it.qty} • {new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR'}).format(it.price)}</div>
                              </div>
                              <div className="text-sm font-semibold text-slate-100">{new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR'}).format(((it.qty||0)*(it.price||0)))}</div>
                            </div>
                          ))
                        )}
                      </div>

                      <div className="mt-3 flex items-center justify-between">
                        <div className="text-sm text-slate-400">Subtotal</div>
                        <div className="font-semibold text-slate-100">{new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR'}).format(subtotal)}</div>
                      </div>

                      <div className="mt-3 flex gap-2">
                        <button onClick={() => { setPreviewOpen(false); navigate('/dashboard'); }} className="flex-1 py-2 rounded-md border border-white/6 text-slate-100">View cart</button>
                        <button onClick={() => { setPreviewOpen(false); navigate('/checkout'); }} className="flex-1 py-2 rounded-md" style={{ background: "linear-gradient(90deg,#6366f1,#ec4899)", color: "#fff" }}>Checkout</button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

            
              {user ? (
                <>
                  <motion.button whileTap={{ scale: 0.98, translateY: 2 }} onClick={() => navigate('/profile')} className="relative flex items-center gap-2 px-3 py-1 rounded-lg" style={{ transformStyle: "preserve-3d", background: "linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))", boxShadow: "0 10px 20px rgba(2,6,23,0.6)", borderRadius: "10px" }}>
                    <span className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "linear-gradient(135deg,#6366f1,#ec4899)", boxShadow: "0 6px 12px rgba(99,102,241,0.08)" }}>
                      <User size={14} color="#fff" />
                    </span>
                    <div className="hidden sm:block text-sm font-medium text-slate-100">{displayName}</div>
                  </motion.button>

                  <motion.button whileTap={{ scale: 0.98, translateY: 2 }} onClick={handleLogout} className="relative px-3 py-1 rounded-lg" style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))", boxShadow: "0 8px 18px rgba(0,0,0,0.4)" }}>
                    <span className="text-sm font-medium text-slate-100">Logout</span>
                  </motion.button>
                </>
              ) : (
                <>
                  <motion.button whileTap={{ scale: 0.98, translateY: 2 }} onClick={() => setLoginOpen(true)} className="relative px-3 py-1 rounded-lg flex items-center gap-2" style={{ background: "linear-gradient(90deg,#6366f1,#ec4899)", boxShadow: "0 12px 30px rgba(99,102,241,0.08)", color: "#fff" }}>
                    <LogIn size={16} />
                    <span className="text-sm font-medium">Login</span>
                  </motion.button>

                  <NavLink to="/register" className="px-3 py-1 rounded-lg" style={{ background: "linear-gradient(90deg,#06b6d4,#ec4899)", boxShadow: "0 10px 26px rgba(6,182,212,0.06)", color: "#fff" }}>
                    <span className="text-sm font-medium">Register</span>
                  </NavLink>
                </>
              )}
            </div>

            {/* Mobile toggle */}
            <div className="md:hidden">
              <button onClick={() => setOpen(v => !v)} className="p-2 rounded-md bg-white/6 hover:bg-white/10 transition">
                {open ? <X size={20} color="#e6eef6"/> : <Menu size={20} color="#e6eef6"/>}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      <div className="md:hidden">
        <AnimatePresence>
          {open && (
            <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="bg-[rgba(2,6,23,0.95)] border-t border-white/6 px-4 py-4 rounded-b-2xl">
              <NavLink to="/" className="block py-2 text-base text-slate-100" onClick={() => setOpen(false)}>Home</NavLink>
              <NavLink to="/products" className="block py-2 text-base text-slate-100" onClick={() => setOpen(false)}>Products</NavLink>
              <NavLink to="/dashboard" className="block py-2 text-base text-slate-100" onClick={() => setOpen(false)}>Dashboard</NavLink>

              <div className="mt-4">
                {user ? (
                  <>
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg" style={{ background: "linear-gradient(135deg,#6366f1,#ec4899)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>
                          {(displayName || "U").charAt(0).toUpperCase()
                        }</div>
                        <div>
                          <div className="font-medium text-slate-100">{displayName}</div>
                          <div className="text-xs text-slate-400">Logged in</div>
                        </div>
                      </div>
                      <button onClick={() => { handleLogout(); setOpen(false); }} className="px-3 py-1 border rounded-md text-slate-100">Logout</button>
                    </div>

                    <div className="mt-3 grid gap-2">
                      <button onClick={() => { setOpen(false); navigate('/profile'); }} className="w-full py-2 border rounded-md text-slate-100">Go to Profile</button>
                      <button onClick={() => { setOpen(false); handleCartClick(); }} className="w-full py-2 bg-cyan-500 text-slate-900 rounded-md">Open Cart</button>
                    </div>
                  </>
                ) : (
                  <>
                    <button onClick={() => { setLoginOpen(true); setOpen(false); }} className="w-full py-2 border rounded-md mb-2 text-slate-100">Login</button>
                    <NavLink to="/register" onClick={() => setOpen(false)} className="block py-2 text-center bg-cyan-500 text-slate-900 rounded-md">Register</NavLink>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

   
      <div className="md:hidden">
        <div className="fixed bottom-4 left-4 right-4 z-50">
          <div className="bg-[rgba(2,6,23,0.9)] backdrop-blur-sm border border-white/6 rounded-2xl shadow-lg flex items-center justify-between px-2 py-2">
            <button onClick={() => navigate("/")} className="flex-1 flex flex-col items-center justify-center py-1 text-xs hover:bg-white/4 rounded-xl transition" aria-label="Home">
              <Home size={18} color="#e6eef6" />
              <span className="mt-1 text-[11px] text-slate-100">Home</span>
            </button>

            <button onClick={() => navigate("/products")} className="flex-1 flex flex-col items-center justify-center py-1 text-xs hover:bg-white/4 rounded-xl transition">
              <Box size={18} color="#e6eef6" />
              <span className="mt-1 text-[11px] text-slate-100">Products</span>
            </button>

            <button onClick={() => navigate("/dashboard")} className="flex-1 flex flex-col items-center justify-center py-1 text-xs hover:bg-white/4 rounded-xl transition">
              <Grid size={18} color="#e6eef6" />
              <span className="mt-1 text-[11px] text-slate-100">Dashboard</span>
            </button>

            <button onClick={() => user ? navigate("/profile") : setLoginOpen(true)} className="flex-1 flex flex-col items-center justify-center py-1 text-xs hover:bg-white/4 rounded-xl transition">
              <User size={18} color="#e6eef6" />
              <span className="mt-1 text-[11px] text-slate-100">{user ? "Profile" : "Login"}</span>
            </button>
          </div>
        </div>
      </div>

      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
    </header>
  );
}
