
export function parseVoice(text = "") {
  if (!text) return {};
  const s = text.toLowerCase().trim();


  const addMatch = s.match(/(?:add|add to cart|put|i want|buy)\s*(\d+)?\s*(.+)/);
  if (addMatch) {
    const qty = addMatch[1] ? Number(addMatch[1]) : 1;
    const item = (addMatch[2] || "").replace(/to cart|in cart|please/g, "").trim();
    return { action: "add", quantity: qty, item };
  }

  const delMatch = s.match(/(?:delete|remove|remove from cart|discard)\s*(\d+)?\s*(.+)/);
  if (delMatch) {
    const qty = delMatch[1] ? Number(delMatch[1]) : 1;
    const item = (delMatch[2] || "").replace(/from cart|please/g, "").trim();
    return { action: "delete", quantity: qty, item };
  }

  if (s.includes("add")) {
    const words = s.split(" ").filter(Boolean);
    const qty = words.find(w => /^\d+$/.test(w)) ? Number(words.find(w=>/^\d+$/.test(w))) : 1;
    const item = words.filter(w=>isNaN(Number(w)) && w !== "add").slice(1).join(" ");
    return { action: "add", quantity: qty, item: item || s };
  }
  return {};
}

export default parseVoice;