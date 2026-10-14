/**
 * Intent Controller - Standalone NLP Intent Extraction Endpoint
 * Team Venator (ID: 60358412) - AI Synergy Hackathon 2026
 */

const geminiService = require('../services/geminiService');
const schemaValidator = require('../utils/schemaValidator');

class IntentController {
  async parseIntentApi(req, res) {
    try {
      const query = req.body.query;
      if (!query || typeof query !== 'string') {
        return res.status(400).json({
          status: 'error',
          code: 'MISSING_QUERY',
          message: 'Field "query" is required as a string.'
        });
      }

      const defaultMinutes = req.body.fallback_minutes || 180;
      const parsedIntent = await geminiService.extractIntent(query, defaultMinutes);

      res.status(200).json({
        status: 'success',
        input: query,
        parsed_intent: parsedIntent
      });
    } catch (err) {
      res.status(500).json({
        status: 'error',
        message: err.message
      });
    }
  }
}

module.exports = new IntentController();
