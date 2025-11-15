
import { parseVoice } from "./parser";

const OFFLINE_DICT = {
 
  "सेब": "apple", "seb": "apple", "sebko": "apple", "seb ko": "apple",
  "दूध": "milk", "doodh": "milk", "doodh ko": "milk",
  "केला": "banana", "kela": "banana", "kelaa": "banana",
  "आलू": "potato", "aaloo": "potato", "aloo": "potato",
  "अंडा": "egg", "ande": "egg", "anda": "egg",
  "चावल": "rice", "chawal": "rice", " chawal": "rice",
  "चीनी": "sugar", "cheeni": "sugar", "chini": "sugar",
  "तेल": "oil", "tel": "oil",
  "रोटी": "bread", "roti": "bread",

  "जोड़ो": "add", "जोडो": "add", "jodo": "add", "addkaro": "add", "add karo": "add",
  "हटाओ": "remove", "hatado": "remove", "nikalo": "remove", "hatao": "remove",
 
};


function simpleTransliterate(s) {
  if (!s) return s;
  return s
    .replace(/दूध/g, "doodh")
    .replace(/सेब/g, "seb")
    .replace(/केला/g, "kela")
    .replace(/आलू/g, "aaloo")
    .replace(/अंडा/g, "anda")
    .replace(/चावल/g, "chawal")
    .replace(/चीनी/g, "cheeni")
    .replace(/तेल/g, "tel")
    .replace(/[०१२३४५६७८९]/g, (m) => "0123456789"["०१२३४५६७८९".indexOf(m)]);
}


function applyOfflineDict(text) {
  if (!text) return text;
  let s = simpleTransliterate(text.toLowerCase());

  s = s.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?؟]/g, " ");
  s = s.replace(/\s+/g, " ").trim();

  const tokens = s.split(" ");
  const out = tokens.map((tok) => {
    if (OFFLINE_DICT[tok]) return OFFLINE_DICT[tok];
    
    const stripped = tok.replace(/(karo|ko|ko|ko:|ke|ka|ki|se|mein|please)$/i, "");
    if (OFFLINE_DICT[stripped]) return OFFLINE_DICT[stripped];
    return tok;
  });

  return out.join(" ");
}


async function onlineTranslate(text, opts = {}) {
  const url = opts.url || "https://libretranslate.com/translate";
  const body = { q: text, source: "auto", target: "en", format: "text" };
  if (opts.apiKey) body.api_key = opts.apiKey;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Translate failed: ${res.status}`);
  const j = await res.json();
 
  if (j.translatedText) return j.translatedText;
 
  const v = Object.values(j).find((x) => typeof x === "string");
  return v || text;
}



export default async function parseAndTranslateVoice(rawText, opts = { useOnline: false, onlineOpts: {} }) {
  const src = String(rawText || "").trim();
  if (!src) return { parsed: { action: "unknown", quantity: 1, item: "" }, translatedText: "", usedOnline: false };

  let translated = src;
  let usedOnline = false;

s
  const hasDeva = /[ऀ-९]/.test(src) || /क्यो|क्यों|करो|हटा|हटाओ|निकाल|दूध|सेब|केला/.test(src.toLowerCase());

  if (opts.useOnline && hasDeva) {
    try {
      translated = await onlineTranslate(src, opts.onlineOpts);
      usedOnline = true;
    } catch (err) {
      console.warn("Online translate failed — falling back to offline:", err);
      translated = applyOfflineDict(src);
      usedOnline = false;
    }
  } else {
    
    translated = applyOfflineDict(src);
  }


  translated = translated.replace(/\s+/g, " ").trim();

  
  let parsed;
  try {
    parsed = parseVoice(translated);
    
    if (!parsed || typeof parsed !== "object") parsed = { action: "unknown", quantity: 1, item: translated };
    if (!parsed.quantity) parsed.quantity = 1;
  } catch (err) {
    console.warn("parseVoice failed, returning fallback:", err);
    parsed = { action: "unknown", quantity: 1, item: translated };
  }

  return { parsed, translatedText: translated, usedOnline };
}
