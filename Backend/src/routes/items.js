const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getItems, addItem, deleteItem } = require('../controllers/itemCotroller');


router.get('/', auth, getItems);      
router.post('/', auth, addItem);      
router.delete('/:id', auth, deleteItem); 

module.exports = router;
