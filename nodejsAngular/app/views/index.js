const express = require('express');
const hauptbuch = require('./hauptbuch');

const router = express.Router();
router.get('/hauptbuch', (req, res) => res.send(hauptbuch()));

module.exports = router;
