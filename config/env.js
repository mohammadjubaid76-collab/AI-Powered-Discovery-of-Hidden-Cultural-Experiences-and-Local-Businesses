/**
 * Environment configuration and validation module
 * Team Venator (ID: 60358412) - AI Synergy Hackathon 2026
 */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const config = {
  port: parseInt(process.env.PORT, 10) || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  distanceMatrixApiKey: process.env.DISTANCE_MATRIX_API_KEY || '',
  mongoUri: process.env.MONGODB_URI || '',
  transitTimeoutMs: parseInt(process.env.TRANSIT_API_TIMEOUT_MS, 10) || 3000,
  safetyBufferRatio: parseFloat(process.env.SAFETY_BUFFER_RATIO) || 0.25,
  // Gwalior Fort reference origin coordinates (Main Entrance)
  defaultOrigin: {
    lat: 26.2298,
    lng: 78.1733,
    label: 'Gwalior Fort Main Gate'
  }
};

module.exports = config;
