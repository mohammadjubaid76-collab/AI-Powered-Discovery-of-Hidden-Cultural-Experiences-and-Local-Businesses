/**
 * Time-Aware Digital Discoverability - Beyond the Fort
 * Team Venator (ID: 60358412) | AI Synergy Hackathon 2026
 * 
 * Express Application Server
 */

const express = require('express');
const path = require('path');
const config = require('./config/env');
const db = require('./config/db');
const feasibilityController = require('./controllers/feasibilityController');
const intentController = require('./controllers/intentController');

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// View Engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Web Routes
app.get('/', (req, res) => feasibilityController.renderHome(req, res));
app.post('/search', (req, res) => feasibilityController.renderSearch(req, res));

// REST API Endpoints
app.post('/api/v1/feasibility/search', (req, res) => feasibilityController.searchApi(req, res));
app.post('/api/v1/intent/parse', (req, res) => intentController.parseIntentApi(req, res));

// Data Inspection Endpoint
app.get('/api/v1/pois', (req, res) => {
  res.json({
    status: 'success',
    count: db.getAllPOIs().length,
    data: db.getAllPOIs()
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    team: 'Team Venator (ID: 60358412)',
    pilot: 'Gwalior Beyond the Fort (Theme 04)',
    service: 'Time-Aware Feasibility Engine'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('[Global Error]', err);
  res.status(500).json({
    status: 'error',
    message: err.message || 'Internal Server Error'
  });
});

// Start Server
if (require.main === module) {
  db.connect().then(() => {
    app.listen(config.port, () => {
      console.log(`=======================================================`);
      console.log(`  Team Venator: Time-Aware Digital Discoverability`);
      console.log(`  AI Synergy Hackathon 2026 • Round 1`);
      console.log(`  Server listening on http://localhost:${config.port}`);
      console.log(`=======================================================`);
    });
  });
}

module.exports = app;
