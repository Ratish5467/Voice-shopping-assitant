import React, { createContext, useState, useEffect } from "react";

function getApiBase() {
  if (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_BASE) {
    return import.meta.env.VITE_API_BASE;
  }
  if (typeof window !== "undefined" && window.REACT_APP_API_BASE) {
    return window.REACT_APP_API_BASE;
  }
  if (typeof window !== "undefined" && window.__API_BASE__) {
    return window.__API_BASE__;
  }
  return "";
}

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(localStorage.getItem("token") || "");

  useEffect(() => {
    if (user && token) {
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("token", token);
    } else {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    }
  }, [user, token]);

  function login(userObj, tkn) {
    setUser(userObj);
    setToken(tkn);
  }

  function logout() {
    setUser(null);
    setToken("");
  }

  async function updateProfile(payload, photoFile) {
    const form = new FormData();
    if (payload.name) form.append("name", payload.name);
    if (payload.phone) form.append("phone", payload.phone);
    if (payload.bio) form.append("bio", payload.bio);
    if (photoFile) form.append("photo", photoFile);

    const url = `${getApiBase()}/api/users/me`;

    const res = await fetch(url, {
      method: "PATCH",
      body: form,
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      credentials: "include",
    });

    const json = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(`Update failed: HTTP ${res.status}`);
    }

    const updatedUser = json.user || json;
    setUser(updatedUser);
    return updatedUser;
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}
