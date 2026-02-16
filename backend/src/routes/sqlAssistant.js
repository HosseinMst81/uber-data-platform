const express = require('express');
const router = express.Router();
const sqlAssistantController = require('../controllers/sqlAssistantController');

// Single endpoint: generate SQL from natural language
router.post('/generate', sqlAssistantController.generateSQL);

module.exports = router;