
import React from "react";
import { Facebook, Instagram, Github, Linkedin, ChevronUp } from "lucide-react";
import { NavLink } from "react-router-dom";

function IconButton({ href = "#", children, label }) {
  return (
    <a
      href={href}
      aria-label={label}
      className="p-2 rounded-lg bg-white/6 border border-white/6 hover:bg-white/8 transition transform hover:-translate-y-0.5 flex items-center justify-center"
      rel="noreferrer"
      target="_blank"
    >
      {children}
    </a>
  );
}

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-0 pt-0">
   
      <div className="h-1 w-full bg-gradient-to-r from-indigo-500 via-cyan-400 to-pink-500 opacity-90" />

     
      <div className="bg-gradient-to-br from-[#02121a]/80 via-[#041827]/70 to-[#00121a]/70 text-slate-300 border-t border-white/6 pt-10 pb-6">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 items-start">

         
            <div className="flex flex-col items-center md:items-start text-center md:text-left">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-xl font-extrabold shadow-lg"
                style={{ background: "linear-gradient(135deg,#06b6d4,#6366f1)" }}
                aria-hidden
              >
                VC
              </div>

              <h2 className="text-xl font-bold text-white mt-3">VoiceCart</h2>

              <p className="text-slate-300 text-sm leading-relaxed mt-2 max-w-sm">
                VoiceCart brings a futuristic shopping experience powered by
                AI + Voice Recognition. Add, remove or check items with your voice — fast and easy.
              </p>

              <div className="mt-4 flex items-center gap-3">
                <button
                  onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white/6 border border-white/6 hover:bg-white/8 transition"
                >
                  <ChevronUp size={16} />
                  <span className="text-sm text-slate-100 font-medium">Back to top</span>
                </button>
              </div>
            </div>

            {/* Quick Links */}
            <div className="flex flex-col items-center md:items-start text-center md:text-left">
              <h3 className="text-lg font-semibold text-white mb-3">Quick Links</h3>

              <div className="grid grid-cols-2 sm:grid-cols-1 gap-2 text-slate-300 text-sm">
                <NavLink to="/" className="hover:text-cyan-300 transition">Home</NavLink>
                <NavLink to="/products" className="hover:text-cyan-300 transition">Products</NavLink>
                <NavLink to="/dashboard" className="hover:text-cyan-300 transition">Dashboard</NavLink>
                <NavLink to="/profile" className="hover:text-cyan-300 transition">Profile</NavLink>
              </div>

              <div className="mt-6 w-full">
                <h4 className="text-sm font-medium text-white mb-2">Contact</h4>
                <address className="not-italic text-sm text-slate-300">
                  ratishkumar5467@gmail.com<br />
                  <a href="tel:+911234567890" className="hover:text-cyan-300 transition">+91 12345 67890</a>
                </address>
              </div>
            </div>

         
            <div className="flex flex-col items-center md:items-start text-center md:text-left">
              <h3 className="text-lg font-semibold text-white mb-3">Follow & Subscribe</h3>

              <p className="text-slate-300 text-sm">Follow for updates, new features and promo deals.</p>

              <div className="mt-3 flex items-center gap-3">
                <IconButton href="#" label="Facebook">
                  <Facebook size={18} className="text-slate-100" />
                </IconButton>

                <IconButton href="https://www.instagram.com/ratishpatel_5467/" label="Instagram">
                  <Instagram size={18} className="text-slate-100" />
                </IconButton>

                <IconButton href="https://www.linkedin.com/in/ratish-kumar5467/" label="LinkedIn">
                  <Linkedin size={18} className="text-slate-100" />
                </IconButton>

                <IconButton href="https://github.com/Ratish5467" label="GitHub">
                  <Github size={18} className="text-slate-100" />
                </IconButton>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
               
                  const input = e.currentTarget.elements.namedItem("email");
                  const val = input?.value || "";
                  if (!val || !val.includes("@")) {
                    alert("Please enter a valid email");
                    return;
                  }
                  alert("Thanks! We'll notify you about updates — (demo).");
                  input.value = "";
                }}
                className="mt-4 w-full max-w-sm"
                aria-label="Subscribe to newsletter"
              >
                <label htmlFor="email" className="sr-only">Email</label>
                <div className="flex gap-2">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@domain.com"
                    className="flex-1 px-3 py-2 rounded-lg bg-white/4 border border-white/6 placeholder:text-slate-400 text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                  />
                  <button
                    type="submit"
                    className="px-3 py-2 rounded-lg bg-gradient-to-r from-cyan-400 to-indigo-600 text-slate-900 font-medium hover:brightness-105 transition"
                  >
                    Subscribe
                  </button>
                </div>
                <div className="text-xs text-slate-400 mt-2">No spam — unsubscribe anytime.</div>
              </form>
            </div>
          </div>

         
          <div className="mt-8 border-t border-white/6 pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
            <p className="text-sm text-slate-400 text-center md:text-left">© {year} <span className="font-semibold text-white">VoiceCart</span>. All rights reserved.</p>

            <div className="flex items-center gap-3">
              <NavLink to="/terms" className="text-sm text-slate-400 hover:text-cyan-300 transition">Terms</NavLink>
              <NavLink to="/privacy" className="text-sm text-slate-400 hover:text-cyan-300 transition">Privacy</NavLink>
              <NavLink to="/contact" className="text-sm text-slate-400 hover:text-cyan-300 transition">Contact</NavLink>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
