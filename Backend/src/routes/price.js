const express = require('express');
const router = express.Router();
const { getPrice } = require('../controllers/priceController');

router.get('/', getPrice);

module.exports = router;
