
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: 'email & password required' });

  
    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ error: 'User already exists' });

   
    const saltRounds = 10;
    const hashed = await bcrypt.hash(password, saltRounds);

    
    const user = new User({
      name,
      email,
      passwordHash: hashed,   
    });

    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'devsecret', { expiresIn: '7d' });

    res.status(201).json({
      user: { id: user._id, name: user.name, email: user.email },
      token,
    });
  } catch (err) {
    console.error('REGISTER ERROR:', err && (err.stack || err.message || err));
    next(err);
  }
});



router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: 'email & password required' });

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });


    const hash = user.passwordHash || user.password;
    const match = await bcrypt.compare(password, hash);
    if (!match) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'devsecret', { expiresIn: '7d' });

    res.json({ user: { id: user._id, name: user.name, email: user.email }, token });
  } catch (err) {
    console.error('LOGIN ERROR:', err && (err.stack || err.message || err));
    next(err);
  }
});



module.exports = router;
