/**
 * Feasibility Controller - Core Pipeline Orchestrator
 * Team Venator (ID: 60358412) - AI Synergy Hackathon 2026
 * 
 * Pipeline Execution:
 * 1. Request Sanitization & Boundary Check
 * 2. Gemini Multilingual Intent Extraction
 * 3. Spatial Candidate Retrieval (3-8 km corridor)
 * 4. Deterministic Feasibility Inequality Evaluation (+25% Buffer)
 * 5. Candidate Pruning & Ranking
 * 6. Verification Status Badging
 */

const schemaValidator = require('../utils/schemaValidator');
const geminiService = require('../services/geminiService');
const mongoService = require('../services/mongoService');
const feasibilityMath = require('../utils/feasibilityMath');
const config = require('../config/env');

class FeasibilityController {
  /**
   * REST API Endpoint: POST /api/v1/feasibility/search
   */
  async searchApi(req, res) {
    try {
      const validation = schemaValidator.validateSearchRequest(req.body);
      if (!validation.valid) {
        return res.status(400).json({
          status: 'error',
          code: 'INVALID_PARAMETERS',
          errors: validation.errors
        });
      }

      const rawQuery = req.body.query;
      const explicitTimeBudget = req.body.time_budget_minutes ? Number(req.body.time_budget_minutes) : 180;
      const origin = req.body.origin || config.defaultOrigin;

      // 1. Gemini NLP intent extraction
      const intent = await geminiService.extractIntent(rawQuery, explicitTimeBudget);

      // Effective time budget (from user slider or extracted by Gemini)
      const effectiveBudget = explicitTimeBudget || intent.time_budget_minutes || 180;

      // 2. Spatial candidate retrieval from curated POI database
      const candidates = await mongoService.findCandidates({
        category: intent.category,
        origin
      });

      // 3. Deterministic feasibility inequality computation and pruning
      const includeViolations = req.query.include_infeasible === 'true';
      const evaluatedResults = feasibilityMath.pruneAndRank(candidates, effectiveBudget, includeViolations);

      return res.status(200).json({
        status: 'success',
        project: 'Time-Aware Digital Discoverability: Beyond the Fort',
        team: 'Team Venator (ID: 60358412)',
        request: {
          raw_query: rawQuery,
          origin,
          time_budget_minutes: effectiveBudget
        },
        intent_parsed: intent,
        summary: {
          candidates_screened: candidates.length,
          candidates_feasible: evaluatedResults.filter(r => r.feasibility.feasible).length,
          safety_buffer_rate: '25% of roundtrip transit + dwell time',
          pruning_policy: 'Strictly eliminated over-budget candidates'
        },
        results: evaluatedResults
      });
    } catch (error) {
      console.error('[Feasibility Controller] Search API error:', error);
      return res.status(500).json({
        status: 'error',
        code: 'INTERNAL_EVALUATION_ERROR',
        message: error.message
      });
    }
  }

  /**
   * Web UI Render: GET /
   */
  async renderHome(req, res) {
    const allPois = await mongoService.findCandidates({
      category: 'all',
      origin: config.defaultOrigin
    });

    res.render('index', {
      title: 'Time-Aware Digital Discoverability | Team Venator',
      defaultOrigin: config.defaultOrigin,
      poiCount: allPois.length,
      samplePois: allPois.slice(0, 4)
    });
  }

  /**
   * Web UI Search Results: POST /search
   */
  async renderSearch(req, res) {
    try {
      const rawQuery = req.body.query || 'Authentic artisan workshops';
      const timeBudgetHours = parseFloat(req.body.time_budget_hours) || 3.0;
      const timeBudgetMinutes = Math.round(timeBudgetHours * 60);
      const origin = config.defaultOrigin;

      // 1. Gemini NLP Intent extraction
      const intent = await geminiService.extractIntent(rawQuery, timeBudgetMinutes);

      // 2. Spatial candidates
      const candidates = await mongoService.findCandidates({
        category: intent.category,
        origin
      });

      // 3. Feasibility math evaluation & pruning
      const evaluatedResults = feasibilityMath.pruneAndRank(candidates, timeBudgetMinutes, false);

      res.render('results', {
        title: 'Feasibility Results | Team Venator',
        query: rawQuery,
        timeBudgetHours,
        timeBudgetMinutes,
        origin,
        intent,
        results: evaluatedResults,
        totalScreened: candidates.length
      });
    } catch (err) {
      console.error('[Feasibility Controller] Web render error:', err);
      res.render('results', {
        title: 'Error | Team Venator',
        query: req.body.query || '',
        timeBudgetHours: 3.0,
        timeBudgetMinutes: 180,
        origin: config.defaultOrigin,
        intent: { category: 'all', normalized_query: 'Error fallback' },
        results: [],
        totalScreened: 0,
        error: err.message
      });
    }
  }
}

module.exports = new FeasibilityController();
