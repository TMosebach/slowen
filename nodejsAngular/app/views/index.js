const express = require('express');
const getHauptbuch = require('./hauptbuch');
const getAssets = require('./assets');

const router = express.Router();
router.get('/hauptbuch', (req, res) => res.send(getHauptbuch()));
router.get('/assets', (req, res) => res.send(getAssets()));

module.exports = router;
