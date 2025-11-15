
const mongoose = require('mongoose');
const Item = require('../models/Item');

exports.getItems = async (req, res) => {
  try {
    const filter = req.user ? { owner: req.user._id } : {};
    const items = await Item.find(filter).sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    console.error('getItems error', err);
    res.status(500).json({ error: 'Could not fetch items' });
  }
};

exports.addItem = async (req, res) => {
  try {
    const { name, quantity = 1, price = 0 } = req.body;
    if (!name) return res.status(400).json({ error: 'Name required' });

    let item;
    if (req.user) {
      item = await Item.findOne({ owner: req.user._id, name: new RegExp(`^${name}$`, 'i') });
    } else {
      item = await Item.findOne({ name: new RegExp(`^${name}$`, 'i') });
    }

    if (item) {
      item.quantity += Number(quantity);
      if (price) item.price = price;
      await item.save();
      return res.json({ success: true, item });
    }

    const newItem = new Item({ name, quantity, price, owner: req.user ? req.user._id : undefined });
    await newItem.save();
    res.json({ success: true, item: newItem });
  } catch (err) {
    console.error('addItem error', err);
    res.status(500).json({ error: 'Could not add item' });
  }
};


exports.deleteItem = async (req, res) => {
  try {
    const id = req.params.id;
    console.log('[DELETE] request id=', id, 'user=', req.user ? req.user._id : null);

  
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      console.warn('[DELETE] invalid id format:', id);
      return res.status(400).json({ error: 'Invalid item id' });
    }

    
    const item = await Item.findById(id).lean(); 
    if (!item) {
      console.warn('[DELETE] item not found id=', id);
      return res.status(404).json({ error: 'Item not found' });
    }

    console.log('[DELETE] found item:', { id: item._id, name: item.name, owner: item.owner ? String(item.owner) : null });

  
    if (item.owner) {
      if (!req.user) {
        console.warn('[DELETE] auth required but no req.user');
        return res.status(401).json({ error: 'Authentication required' });
      }
      if (String(item.owner) !== String(req.user._id)) {
        console.warn('[DELETE] forbidden - owner mismatch', { itemOwner: String(item.owner), requestUser: String(req.user._id) });
        return res.status(403).json({ error: 'Forbidden: you cannot delete this item' });
      }
    }

   
    const result = await Item.deleteOne({ _id: id });
    if (result.deletedCount === 1) {
      console.log('[DELETE] removed item id=', id);
      return res.json({ success: true });
    } else {
      console.warn('[DELETE] deleteOne did not remove item id=', id, 'result=', result);
      return res.status(500).json({ error: 'Could not delete item' });
    }
  } catch (err) {
    console.error('[DELETE] unexpected error:', err && err.stack ? err.stack : err);
    return res.status(500).json({ error: 'Could not delete item', details: err?.message });
  }
};