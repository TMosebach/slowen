const express = require('express');
const getHauptbuch = require('./hauptbuch');

const router = express.Router();
router.get('/hauptbuch', (req, res) => res.send(getHauptbuch()));

module.exports = router;
