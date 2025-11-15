
import axios from "axios";


const BASE_URL = (import.meta.env.VITE_API_URL || "").trim();

console.log("Using API Base URL:", BASE_URL || "(same-origin)");

const api = axios.create({
  baseURL: BASE_URL || "",   
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
 
});

/* ---- PRICE MAP ---- */
const PRICE_MAP = {
  apple: 120,
  apples: 120,
  banana: 40,
  milk: 55,
  rice: 60,
  sugar: 45,
  honey: 450,
  masala: 80,
};

function authHeaders() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function sleep(ms = 150) {
  return new Promise((r) => setTimeout(r, ms));
}

/* ---- Price ---- */
export async function fetchPrice(query) {
  const q = (query || "").toLowerCase().trim();

 
  if (BASE_URL) {
    try {
      const res = await api.get("/api/price", { params: { q } });
      if (res?.data?.price != null) return Number(res.data.price);
    } catch (e) {
      console.warn("Price API failed → fallback", e.message);
    }
  }

  for (const k of Object.keys(PRICE_MAP)) {
    if (q.includes(k)) return PRICE_MAP[k];
  }

  return Math.floor(50 + Math.random() * 400);
}

/* ---- Auth ---- */
export async function login({ email, password }) {
  if (!BASE_URL) {
    await sleep(200);
    const token = "mock-token";
    const user = { email, name: email.split("@")[0] };
    localStorage.setItem("token", token);
    return { token, user };
  }

  const res = await api.post("/api/login", { email, password });
  const payload = res.data;
  if (payload?.token) localStorage.setItem("token", payload.token);
  return payload;
}

export async function register({ name, email, password }) {
  if (!BASE_URL) {
    await sleep(200);
    const token = "mock-token";
    const user = { name, email };
    localStorage.setItem("token", token);
    return { token, user };
  }

  const res = await api.post("/api/register", { name, email, password });
  const payload = res.data;
  if (payload?.token) localStorage.setItem("token", payload.token);
  return payload;
}

/* ---- Items ---- */
export async function fetchItems() {
  if (!BASE_URL) {
    await sleep(120);
    const raw = localStorage.getItem("vc_items_v1");
    return raw ? JSON.parse(raw) : [];
  }

  const res = await api.get("/api/items", { headers: authHeaders() });
  return res.data;
}

export async function addItem({ name, quantity = 1, price = 0 }) {
  if (!BASE_URL) {
    await sleep(120);
    const raw = localStorage.getItem("vc_items_v1");
    const arr = raw ? JSON.parse(raw) : [];
    const found = arr.find((i) => i.name.toLowerCase() === name.toLowerCase());
    if (found) found.quantity += quantity;
    else arr.unshift({ _id: Date.now().toString(), name, quantity, price });
    localStorage.setItem("vc_items_v1", JSON.stringify(arr));
    return { success: true };
  }

  const res = await api.post(
    "/api/items",
    { name, quantity, price },
    { headers: authHeaders() }
  );
  return res.data;
}

export async function deleteItem(id) {
  if (!BASE_URL) {
    await sleep(80);
    const raw = localStorage.getItem("vc_items_v1");
    const arr = raw ? JSON.parse(raw) : [];
    const filtered = arr.filter((i) => i._id !== id);
    localStorage.setItem("vc_items_v1", JSON.stringify(filtered));
    return { success: true };
  }

  const res = await api.delete(`/api/items/${id}`, { headers: authHeaders() });
  return res.data;
}

export default api;
