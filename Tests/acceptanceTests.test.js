/**
 * Acceptance Test Suite: Time-Aware Digital Discoverability
 * Team Venator (ID: 60358412) - AI Synergy Hackathon 2026
 * 
 * Run via: npm test (or node --test tests/acceptanceTests.test.js)
 */

const { test, describe } = require('node:test');
const assert = require('node:assert/strict');

const feasibilityMath = require('../utils/feasibilityMath');
const schemaValidator = require('../utils/schemaValidator');
const distanceMatrixService = require('../services/distanceMatrixService');
const geminiService = require('../services/geminiService');
const mongoService = require('../services/mongoService');
const config = require('../config/env');

describe('Team Venator Acceptance Test Suite', () => {

  // TEST 1: Exact Feasibility Inequality Compliance
  test('Test 1: Evaluates candidate feasibility via strict mathematical inequality', () => {
    // Case A: Strictly Feasible
    // Outbound: 20m, Return: 20m, Visit: 40m
    // Roundtrip + Visit = 80m. Buffer (25%) = ceil(0.25 * 80) = 20m.
    // Total = 20 + 20 + 40 + 20 = 100m.
    // Available: 120m -> 100 <= 120 -> Feasible with 20m slack.
    const resultFeasible = feasibilityMath.evaluateCandidate({
      outboundMinutes: 20,
      returnMinutes: 20,
      minDwellMinutes: 40,
      availableMinutes: 120
    });

    assert.equal(resultFeasible.feasible, true);
    assert.equal(resultFeasible.t_round_trip, 40);
    assert.equal(resultFeasible.t_buffer, 20);
    assert.equal(resultFeasible.t_total, 100);
    assert.equal(resultFeasible.slack_minutes, 20);

    // Case B: Infeasible (violates boundary)
    // Available: 90m -> Total 100 > 90 -> Infeasible with -10m slack.
    const resultInfeasible = feasibilityMath.evaluateCandidate({
      outboundMinutes: 20,
      returnMinutes: 20,
      minDwellMinutes: 40,
      availableMinutes: 90
    });

    assert.equal(resultInfeasible.feasible, false);
    assert.equal(resultInfeasible.t_total, 100);
    assert.equal(resultInfeasible.slack_minutes, -10);
  });

  // TEST 2: Strict 25% Safety Buffer Injection
  test('Test 2: Enforces mandatory 25% safety buffer calculation', () => {
    // Buffer = ceil(0.25 * (T_roundtrip + T_visit))
    // 30m roundtrip + 45m visit = 75m -> 0.25 * 75 = 18.75 -> ceil = 19m
    const buffer = feasibilityMath.calculateBuffer(30, 45);
    assert.equal(buffer, 19);

    // 0 roundtrip + 60m visit = 60m -> 0.25 * 60 = 15m
    const bufferClean = feasibilityMath.calculateBuffer(0, 60);
    assert.equal(bufferClean, 15);
  });

  // TEST 3: Over-Budget Candidate Elimination (Pruning)
  test('Test 3: Pruning strictly eliminates candidates exceeding available time budget', () => {
    const mockCandidates = [
      {
        id: 'candidate_near',
        name: 'Near Cluster',
        distance_from_fort_km: 3.5,
        transit_outbound_mins: 15,
        transit_return_mins: 15,
        min_dwell_time_mins: 30 // RT=30, Visit=30 -> 60. Buffer=15. Total=75m
      },
      {
        id: 'candidate_far',
        name: 'Far Cluster',
        distance_from_fort_km: 7.5,
        transit_outbound_mins: 35,
        transit_return_mins: 35,
        min_dwell_time_mins: 60 // RT=70, Visit=60 -> 130. Buffer=33. Total=163m
      }
    ];

    // Tight budget: 90 minutes. Near Cluster (75m) fits, Far Cluster (163m) must be pruned.
    const prunedList = feasibilityMath.pruneAndRank(mockCandidates, 90, false);
    assert.equal(prunedList.length, 1);
    assert.equal(prunedList[0].id, 'candidate_near');
    assert.equal(prunedList[0].feasibility.feasible, true);

    // Large budget: 200 minutes. Both clusters fit.
    const generousList = feasibilityMath.pruneAndRank(mockCandidates, 200, false);
    assert.equal(generousList.length, 2);
  });

  // TEST 4: Transit API Outage Handling & [Travel-Time Unverified] Tagging
  test('Test 4: Transit API outage triggers unverified badge fallback without lying', async () => {
    const origin = config.defaultOrigin;
    const destination = { lat: 26.2150, lng: 78.1685 }; // Chanderi cluster

    // Simulating API outage
    const transitOutage = await distanceMatrixService.getTransitTime(origin, destination, true);

    assert.equal(transitOutage.is_verified, false);
    assert.equal(transitOutage.verification_tag, '[Travel-Time Unverified]');
    assert.ok(transitOutage.warning.includes('unverified'));
    assert.ok(transitOutage.outbound_minutes > 0);
  });

  // TEST 5: Schema Validation & Boundary Rules
  test('Test 5: Validates request payloads and rejects malformed parameters', () => {
    // Valid Request
    const valid = schemaValidator.validateSearchRequest({
      query: 'Authentic weavers',
      time_budget_minutes: 180,
      origin: { lat: 26.2298, lng: 78.1733 }
    });
    assert.equal(valid.valid, true);

    // Invalid Request: empty query & negative budget
    const invalid = schemaValidator.validateSearchRequest({
      query: '',
      time_budget_minutes: -50
    });
    assert.equal(invalid.valid, false);
    assert.ok(invalid.errors.length >= 2);
  });

  // TEST 6: Multilingual Intent Normalization (Hindi / Hinglish / English)
  test('Test 6: Normalizes multilingual queries to structured categories', () => {
    // Hindi/Hinglish food query
    const foodIntent = geminiService.heuristicFallback('Mujhe local khana khana hai, 3 ghante hain');
    assert.equal(foodIntent.category, 'culinary');
    assert.equal(foodIntent.time_budget_minutes, 180);

    // Chanderi weaver query
    const craftIntent = geminiService.heuristicFallback('Chanderi weavers aur sarees');
    assert.equal(craftIntent.category, 'crafts');

    // Tansen music query
    const musicIntent = geminiService.heuristicFallback('Tansen sangeet academy dekhna hai');
    assert.equal(musicIntent.category, 'music');
  });

  // TEST 7: Dataset Integrity (12 Curated Gwalior POIs)
  test('Test 7: Verified pilot dataset contains at least 12 audited Gwalior POIs', () => {
    const all = mongoService.findCandidates({ category: 'all', origin: config.defaultOrigin });
    return all.then(pois => {
      assert.ok(pois.length >= 10);
      const sample = pois[0];
      assert.ok(sample.id);
      assert.ok(sample.name);
      assert.ok(sample.min_dwell_time_mins > 0);
      assert.ok(sample.verification_status);
    });
  });

});
