
import React, { useState, useContext } from "react";
import { register as apiRegister } from "../services/api";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const { login } = useContext(AuthContext);
  const nav = useNavigate();

  function setField(k, v) {
    setForm(s => ({ ...s, [k]: v }));
  }

  async function submit(e) {
    e.preventDefault();
    setMsg("");
    if (!form.name || !form.email || !form.password) {
      setMsg("Please fill all fields");
      return;
    }
    setLoading(true);
    setMsg("Registering...");

    try {
      const res = await apiRegister(form);
      const payload = res?.data ?? res;
      const userObj = payload?.user ?? payload;
      const token = payload?.token ?? payload?.accessToken ?? null;

      if (!userObj) throw new Error("Unexpected server response");

      try {
        login(userObj, token);
      } catch (e) {
        console.warn("AuthContext.login error:", e);
      }

      setMsg("Registered — Redirecting...");
      setTimeout(() => nav("/dashboard"), 200);
    } catch (err) {
      console.error("Register error:", err);
      const serverMsg =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err?.message ||
        "Registration failed";
      setMsg(String(serverMsg));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-[#071224] to-[#011827] text-white flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="bg-[rgba(255,255,255,0.03)] backdrop-blur-md rounded-2xl p-6 shadow-2xl border border-white/6">
          <h2 className="text-2xl font-extrabold">Create your account</h2>
          <p className="text-sm text-slate-300 mt-1">Register to save your cart and checkout faster.</p>

          <form onSubmit={submit} className="mt-6 space-y-3">
            <input
              value={form.name}
              onChange={e => setField("name", e.target.value)}
              placeholder="Full name"
              className="w-full px-3 py-2 rounded-lg bg-[rgba(255,255,255,0.02)] border border-white/6 text-white placeholder:text-slate-400"
              disabled={loading}
            />
            <input
              value={form.email}
              onChange={e => setField("email", e.target.value)}
              placeholder="Email"
              className="w-full px-3 py-2 rounded-lg bg-[rgba(255,255,255,0.02)] border border-white/6 text-white placeholder:text-slate-400"
              disabled={loading}
            />
            <input
              type="password"
              value={form.password}
              onChange={e => setField("password", e.target.value)}
              placeholder="Password"
              className="w-full px-3 py-2 rounded-lg bg-[rgba(255,255,255,0.02)] border border-white/6 text-white placeholder:text-slate-400"
              disabled={loading}
            />

            <button
              type="submit"
              className={`w-full py-2 rounded-lg font-semibold ${loading ? "bg-indigo-400/60 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-500"} transition`}
              disabled={loading}
            >
              {loading ? "Registering..." : "Register"}
            </button>

            {msg && <div className="text-sm text-slate-300 mt-2">{msg}</div>}
          </form>
        </div>

        <div className="mt-4 text-center text-sm text-slate-400">
          Already have an account? <button onClick={() => nav("/")} className="text-white underline">Login</button>
        </div>
      </div>
    </main>
  );
}
