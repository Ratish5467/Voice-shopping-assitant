
import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { User, LogOut, Sparkles } from "lucide-react";



export default function Profile() {
  const { user, logout } = useContext(AuthContext) || {};
  const navigate = useNavigate();

  const [name, setName] = useState(user?.name || (user?.email ? user.email.split("@")[0] : ""));
  const [email] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [bio, setBio] = useState(user?.bio || "");

  useEffect(() => {
    setName(user?.name || (user?.email ? user.email.split("@")[0] : ""));
    setPhone(user?.phone || "");
    setBio(user?.bio || "");
  }, [user]);

  function handleLogout() {
    logout?.();
    navigate("/");
  }

  const joined = user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : null;
  const initial = (name || email || "U").charAt(0).toUpperCase();

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-[#071224] to-[#011827] text-white py-8 md:py-12 transition-colors">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="md:col-span-1">
            <div className="bg-[rgba(255,255,255,0.03)] backdrop-blur-md rounded-2xl p-4 shadow-2xl border border-white/6">
              <div className="flex flex-col items-center text-center gap-3">
                <div className="relative">
                  <div className="rounded-xl p-1" style={{ background: "linear-gradient(135deg,#8360c3 0%,#ec4899 50%,#06b6d4 100%)" }}>
                    <div className="bg-white rounded-lg w-28 h-28 overflow-hidden flex items-center justify-center border-2 border-white shadow-inner">
                      <div className="text-2xl font-bold text-white bg-gradient-to-br from-indigo-600 to-pink-500 w-full h-full flex items-center justify-center">
                        {initial}
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="text-lg font-extrabold text-white">{user?.name || name || "Unnamed User"}</div>
                  <div className="text-sm text-slate-300">{email || "No email"}</div>
                  {joined && <div className="text-xs text-slate-400 mt-1">Joined: {joined}</div>}
                </div>

                <div className="flex gap-2 mt-2">
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={handleLogout}
                    className="px-3 py-1 rounded-full border border-white/8 text-sm bg-white/6 text-white"
                    title="Logout"
                  >
                    <div className="flex items-center gap-2"><LogOut size={14} />Logout</div>
                  </motion.button>
                </div>

                <div className="mt-3 flex items-center gap-2 text-xs text-slate-300">
                  <Sparkles size={14} /> <span className="font-medium">Pro tip:</span> Keep profile details correct for faster checkout.
                </div>
              </div>
            </div>

            {/* small account summary */}
            <div className="mt-4 space-y-3">
              <div className="bg-[rgba(255,255,255,0.03)] rounded-2xl p-3 shadow-lg border border-white/6">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium text-slate-200">Account summary</div>
                  <div className="text-xs text-slate-300">{user ? "Active" : "Guest"}</div>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2">
                  <div className="rounded-lg p-2 bg-[rgba(255,255,255,0.02)] text-center border border-white/6">
                    <div className="text-xs text-slate-400">Name</div>
                    <div className="font-semibold text-white">{user?.name ? user.name : "—"}</div>
                  </div>

                  <div className="rounded-lg p-2 bg-[rgba(255,255,255,0.02)] text-center border border-white/6">
                    <div className="text-xs text-slate-400">Email</div>
                    <div className="font-semibold text-white text-sm break-all">{email || "—"}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

       
          <div className="md:col-span-2 flex flex-col gap-6">
           
            <div className="bg-[rgba(255,255,255,0.03)] rounded-2xl p-6 shadow-2xl border border-white/6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-lg font-extrabold text-white">Profile details</div>
                  <div className="text-sm text-slate-300">Your account information (read-only)</div>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-400">Full name</label>
                  <input value={name} readOnly className="w-full mt-2 px-3 py-2 border rounded-lg bg-[rgba(255,255,255,0.02)] text-white border-white/6" />
                </div>

                <div>
                  <label className="text-xs text-slate-400">Email</label>
                  <input value={email} readOnly className="w-full mt-2 px-3 py-2 border rounded-lg bg-[rgba(255,255,255,0.02)] text-white border-white/6" />
                </div>

                <div>
                  <label className="text-xs text-slate-400">Phone</label>
                  <input value={phone || "—"} readOnly className="w-full mt-2 px-3 py-2 border rounded-lg bg-[rgba(255,255,255,0.02)] text-white border-white/6" />
                </div>

                <div>
                  <label className="text-xs text-slate-400">Bio</label>
                  <textarea value={bio || "—"} readOnly rows={3} className="w-full mt-2 px-3 py-2 border rounded-lg bg-[rgba(255,255,255,0.02)] text-white border-white/6" />
                </div>

                <div className="md:col-span-2 flex items-center gap-3">
                  <div>
                    <label className="text-xs text-slate-400 block">Profile preview</label>
                    <div className="mt-2 flex items-center gap-3">
                      <div className="w-16 h-16 rounded-lg overflow-hidden border bg-[rgba(255,255,255,0.02)] flex items-center justify-center text-xl text-white">
                        <User />
                      </div>

                      <div className="ml-2">
                        <div className="text-sm text-slate-300">{user?.name || name || "Unnamed User"}</div>
                        <div className="text-xs text-slate-400">{email || "No email"}</div>
                      </div>
                    </div>
                  </div>

                  <div className="ml-auto flex gap-2 items-center">
                    <button type="button" onClick={handleLogout} className="px-1 py-2 rounded-full bg-cyan-400 text-slate-900 font-semibold hover:brightness-95 transition">
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Account details */}
            <div className="bg-[rgba(255,255,255,0.02)] rounded-2xl p-4 shadow-lg border border-white/6">
              <div className="font-medium text-slate-200">Account details</div>
              <div className="mt-3 space-y-2 text-sm text-slate-300">
                <div><span className="text-slate-400">Display name:</span> <strong className="text-white">{user?.name || name || "—"}</strong></div>
                <div><span className="text-slate-400">Email:</span> <strong className="text-white">{email || "—"}</strong></div>
                <div><span className="text-slate-400">Phone:</span> <strong className="text-white">{phone || "—"}</strong></div>
                <div><span className="text-slate-400">Bio:</span> <strong className="text-white">{bio || "—"}</strong></div>
                {joined && <div><span className="text-slate-400">Joined:</span> <strong className="text-white">{joined}</strong></div>}
              </div>
            </div>

          </div>
        </div>
      </div>
    </main>
  );
}
