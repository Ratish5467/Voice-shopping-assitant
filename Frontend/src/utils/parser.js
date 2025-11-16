// src/utils/parser.js

const NUMBER_WORDS = {
  "one": 1,
  "two": 2, "to": 2, "too": 2,
  "three": 3,
  "four": 4, "for": 4,
  "five": 5,
  "six": 6,
  "seven": 7,
  "eight": 8,
  "nine": 9,
  "ten": 10,

  // Hindi numbers
  "ek": 1,
  "do": 2,
  "teen": 3,
  "char": 4,
  "paanch": 5,
  "chhe": 6,
  "sat": 7,
  "aath": 8,
  "nau": 9,
  "das": 10
};

function convertNumberWords(text) {
  const tokens = text.toLowerCase().split(" ");
  let qty = 1;
  let words = [];

  for (let t of tokens) {
    if (NUMBER_WORDS[t]) qty = NUMBER_WORDS[t];
    else words.push(t);
  }

  return { qty, item: words.join(" ").trim() };
}

export function parseVoice(text = "") {
  if (!text) return {};

  const s = text.toLowerCase().trim();

  // ADD
  if (s.startsWith("add") || s.startsWith("buy") || s.includes("add")) {
    const t = s.replace(/add|buy/g, "").trim();
    const { qty, item } = convertNumberWords(t);
    return { action: "add", quantity: qty, item };
  }

  // DELETE
  if (s.startsWith("delete") || s.startsWith("remove") || s.includes("delete")) {
    const t = s.replace(/delete|remove/g, "").trim();
    const { qty, item } = convertNumberWords(t);
    return { action: "delete", quantity: qty, item };
  }

  return {};
}

export default parseVoice;
