const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');

// In-memory storage for settings (in production, use a database)
let systemSettings = {
  currency: 'USD'
};

// Get current currency setting
router.get('/currency', authenticateToken, async (req, res) => {
  try {
    res.json({
      success: true,
      currency: systemSettings.currency || 'USD'
    });
  } catch (error) {
    console.error('Error fetching currency settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch currency settings'
    });
  }
});

// Update currency setting
router.put('/currency', authenticateToken, async (req, res) => {
  try {
    const { currency } = req.body;

    // Validate currency
    const validCurrencies = ['USD', 'EUR', 'GBP', 'INR'];
    if (!currency || !validCurrencies.includes(currency)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid currency. Must be one of: USD, EUR, GBP, INR'
      });
    }

    // Check if user has admin permissions (optional - you can modify based on your auth system)
    if (req.user.role !== 'admin' && req.user.role !== 'hr') {
      return res.status(403).json({
        success: false,
        message: 'Only admin and HR users can change currency settings'
      });
    }

    // Update currency setting
    systemSettings.currency = currency;

    res.json({
      success: true,
      message: `Currency updated to ${currency} successfully`,
      currency: currency
    });
  } catch (error) {
    console.error('Error updating currency settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update currency settings'
    });
  }
});

// Get all system settings (for future expansion)
router.get('/', authenticateToken, async (req, res) => {
  try {
    res.json({
      success: true,
      settings: systemSettings
    });
  } catch (error) {
    console.error('Error fetching system settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch system settings'
    });
  }
});

module.exports = router;