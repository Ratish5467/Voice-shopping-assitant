
import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { AuthContext } from "../context/AuthContext";
import { login as apiLogin, register as apiRegister } from "../services/api";
import { X } from "lucide-react";

export default function LoginModal({ open, onClose }) {
  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({ email: "", password: "", name: "" });
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!open) {
      setMsg("");
      setLoading(false);
    }
  }, [open]);

  function setField(k, v) {
    setForm((s) => ({ ...s, [k]: v }));
  }

  async function submit(e) {
    e.preventDefault();
    setMsg("");
    if (!form.email || !form.password || (isRegister && !form.name)) {
      setMsg("Please fill required fields");
      return;
    }

    setLoading(true);
    setMsg("Processing...");

    try {
      let resp;
      if (isRegister) {
        resp = await apiRegister({ name: form.name, email: form.email, password: form.password });
      } else {
        resp = await apiLogin({ email: form.email, password: form.password });
      }

      const payload = resp?.data ?? resp;
      const userObj = payload?.user ?? payload;
      const token = payload?.token ?? payload?.accessToken ?? null;

      if (!userObj) {
        throw new Error("Unexpected server response");
      }

      try {
        login(userObj, token);
      } catch (ctxErr) {
        console.warn("AuthContext.login error:", ctxErr);
      }

      setMsg(isRegister ? "Registered and logged in" : "Logged in");
      onClose?.();

    
      setTimeout(() => navigate("/dashboard"), 120);
    } catch (err) {
      console.error("Auth error:", err);

      const serverMsg =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err?.response?.data ||
        err?.message ||
        "Authentication failed";

      setMsg(String(serverMsg));
    } finally {
      setLoading(false);
    }
  }

 
  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") onClose?.();
    }
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-50"
            onClick={onClose}
          />

          <motion.div
            initial={{ y: -12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -12, opacity: 0 }}
            className="fixed left-1/2 top-28 -translate-x-1/2 z-50 w-full max-w-md"
          >
            <div className="bg-[rgba(255,255,255,0.03)] backdrop-blur-md rounded-2xl p-6 shadow-2xl border border-white/6 text-white">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-extrabold">{isRegister ? "Create account" : "Welcome back"}</h3>
                  <div className="text-sm text-slate-300 mt-1">{isRegister ? "Register a new account" : "Login to continue"}</div>
                </div>

                <button
                  onClick={onClose}
                  aria-label="Close"
                  className="p-2 rounded-md text-slate-300 hover:bg-white/5 transition"
                >
                  <X />
                </button>
              </div>

              <form onSubmit={submit} className="mt-4 space-y-3">
                {isRegister && (
                  <input
                    value={form.name}
                    onChange={(e) => setField("name", e.target.value)}
                    placeholder="Full name"
                    className="w-full px-3 py-2 rounded-lg bg-[rgba(255,255,255,0.02)] border border-white/6 text-white placeholder:text-slate-400"
                    disabled={loading}
                  />
                )}

                <input
                  value={form.email}
                  onChange={(e) => setField("email", e.target.value)}
                  placeholder="Email"
                  className="w-full px-3 py-2 rounded-lg bg-[rgba(255,255,255,0.02)] border border-white/6 text-white placeholder:text-slate-400"
                  disabled={loading}
                />

                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setField("password", e.target.value)}
                  placeholder="Password"
                  className="w-full px-3 py-2 rounded-lg bg-[rgba(255,255,255,0.02)] border border-white/6 text-white placeholder:text-slate-400"
                  disabled={loading}
                />

                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className={`flex-1 px-4 py-2 rounded-lg font-semibold ${loading ? "bg-indigo-400/60 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-500"} transition`}
                  >
                    {loading ? (isRegister ? "Registering..." : "Logging in...") : (isRegister ? "Register" : "Login")}
                  </button>

                  <button
                    type="button"
                    onClick={() => { setIsRegister(v => !v); setMsg(""); }}
                    className="px-4 py-2 rounded-lg border border-white/6"
                    disabled={loading}
                  >
                    {isRegister ? "Switch to Login" : "Switch to Register"}
                  </button>
                </div>
              </form>

              {msg && <div className="mt-3 text-sm text-slate-300">{msg}</div>}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
