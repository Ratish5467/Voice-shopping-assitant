

import { parseVoice } from "./parser";

const HINDI_MAP = {
  "aloo": "potato",
  "aaloo": "potato",
  "pyaaz": "onion",
  "bhindi": "lady finger",
  "karela": "bitter gourd",
  "matar": "peas",
  "palak": "spinach",
  "gajar": "carrot",
  "kaddu": "pumpkin",
  "doodh": "milk",
  "chaas": "buttermilk",
  "lassi": "lassi",
  "seb": "apple",
  "kela": "banana",

  "chini": "sugar",
  "cheeni": "sugar",


  "jodo": "add",
  "addkaro": "add",
  "add karo": "add",
  "hatao": "delete",
  "hatado": "delete",
  "nikalo": "delete"
};

function normalHindi(s) {
  if (!s) return "";

  s = s.toLowerCase();

  
  s = s.replace(/[०१२३४५६७८९]/g, (m) =>
    "0123456789"["०१२३४५६७८९".indexOf(m)]
  );

  s = s.replace(/[^\w\s]/g, " ");
  s = s.replace(/\s+/g, " ");

  const tokens = s.split(" ");
  const out = tokens.map((t) => HINDI_MAP[t] || t);

  return out.join(" ").trim();
}

export default async function parseAndTranslateVoice(rawText) {
  if (!rawText)
    return { parsed: {}, translatedText: "" };

  const converted = normalHindi(rawText);

  const parsed = parseVoice(converted);

  return {
    parsed,
    translatedText: converted
  };
}
