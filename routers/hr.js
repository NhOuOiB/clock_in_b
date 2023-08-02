const express = require('express');
const router = express.Router();
const hrController = require('../controllers/hr');

router.get('/getCheckRecord', hrController.getCheckRecord)

router.post('/addCheckRecord', hrController.addCheckRecord);

module.exports = router;
