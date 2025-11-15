// models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  name: String,
  phone: String,
  bio: String,


  passwordHash: { type: String, required: true },

  photoURL: String,
  photoPublicId: String,

  createdAt: { type: Date, default: Date.now },
});


userSchema.virtual('password')
  .set(function (plain) {
    this._plainPassword = plain;
   
    this.markModified('passwordHash');
  })
  .get(function () {
    return this._plainPassword;
  });

// PRE-SAVE: only hash when a plain password was provided (this._plainPassword)
userSchema.pre('save', async function (next) {
  try {
    if (!this._plainPassword) return next(); // nothing to do
    // plain password exists — hash and store in passwordHash
    const salt = await bcrypt.genSalt(10);
    this.passwordHash = await bcrypt.hash(this._plainPassword, salt);
    // clear plain for safety
    this._plainPassword = undefined;
    next();
  } catch (err) {
    next(err);
  }
});

// Compare supplied candidate password with stored hash (safe)
userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.passwordHash) return false; // no hash => cannot match
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

module.exports = mongoose.model('User', userSchema);
