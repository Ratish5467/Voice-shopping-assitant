const PRICE_MAP = {
  apple: 120,
  apples: 120,
  banana: 40,
  milk: 55,
  rice: 60,
  sugar: 45,
  honey: 450,
  masala: 80
};

exports.getPrice = async (req, res) => {
  try {
    const q = (req.query.q || '').toLowerCase().trim();
    if (!q) return res.json({ price: null });

   
    for (const k of Object.keys(PRICE_MAP)) {
      if (q.includes(k)) return res.json({ price: PRICE_MAP[k], source: 'map' });
    }

   
    const price = Math.floor(50 + Math.random() * 450);
    res.json({ price, source: 'random' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
