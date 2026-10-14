/**
 * Deterministic Time-Space Feasibility Engine
 * Team Venator (ID: 60358412) - AI Synergy Hackathon 2026
 * 
 * Mathematical Model:
 *   T_outbound + T_return + T_visit + T_buffer <= T_available
 * 
 * Where:
 *   T_round_trip = T_outbound + T_return
 *   T_buffer     = ceil(0.25 * (T_round_trip + T_visit))
 *   T_total      = T_round_trip + T_visit + T_buffer
 */

const config = require('../config/env');

class FeasibilityMathEngine {
  constructor(bufferRatio = config.safetyBufferRatio) {
    this.bufferRatio = bufferRatio; // 0.25 (25% safety margin)
  }

  /**
   * Computes the mandatory safety buffer
   * T_buffer = ceil(bufferRatio * (T_round_trip + T_visit))
   * @param {number} roundTripMinutes 
   * @param {number} visitDwellMinutes 
   * @returns {number} buffer in minutes
   */
  calculateBuffer(roundTripMinutes, visitDwellMinutes) {
    const rawBuffer = this.bufferRatio * (roundTripMinutes + visitDwellMinutes);
    return Math.ceil(rawBuffer);
  }

  /**
   * Evaluates a single candidate point of interest against the user's available time budget.
   * 
   * @param {Object} params
   * @param {number} params.outboundMinutes - Travel time from origin to POI
   * @param {number} params.returnMinutes - Travel time from POI back to origin
   * @param {number} params.minDwellMinutes - Curated dwell time at the POI
   * @param {number} params.availableMinutes - User's stated available visiting window
   * @returns {Object} Feasibility breakdown and decision
   */
  evaluateCandidate({ outboundMinutes, returnMinutes, minDwellMinutes, availableMinutes }) {
    if (outboundMinutes < 0 || returnMinutes < 0 || minDwellMinutes < 0 || availableMinutes <= 0) {
      throw new Error('Invalid time parameters: all durations must be non-negative, available window must be positive.');
    }

    const roundTrip = outboundMinutes + returnMinutes;
    const buffer = this.calculateBuffer(roundTrip, minDwellMinutes);
    const totalEnvelope = roundTrip + minDwellMinutes + buffer;
    const remainingSlack = availableMinutes - totalEnvelope;
    const isFeasible = totalEnvelope <= availableMinutes;

    return {
      t_outbound: outboundMinutes,
      t_return: returnMinutes,
      t_round_trip: roundTrip,
      t_visit: minDwellMinutes,
      t_buffer: buffer,
      t_total: totalEnvelope,
      t_available: availableMinutes,
      slack_minutes: remainingSlack,
      feasible: isFeasible,
      inequality_formula: `${outboundMinutes}m + ${returnMinutes}m + ${minDwellMinutes}m + ${buffer}m = ${totalEnvelope}m <= ${availableMinutes}m`
    };
  }

  /**
   * Filters and ranks candidates, strictly pruning those that fail the feasibility inequality.
   * 
   * @param {Array<Object>} candidates - List of POI objects with distance/travel estimations
   * @param {number} availableMinutes - User's stated time budget
   * @param {boolean} includeViolations - If true, keeps over-budget items marked as infeasible (useful for diagnostics)
   * @returns {Array<Object>} Evaluated and sorted POIs
   */
  pruneAndRank(candidates, availableMinutes, includeViolations = false) {
    const evaluated = candidates.map(poi => {
      const outbound = poi.transit_outbound_mins || Math.ceil((poi.distance_from_fort_km / 22) * 60 * 1.3);
      const ret = poi.transit_return_mins || outbound;
      const visit = poi.min_dwell_time_mins || 45;

      const math = this.evaluateCandidate({
        outboundMinutes: outbound,
        returnMinutes: ret,
        minDwellMinutes: visit,
        availableMinutes
      });

      return {
        ...poi,
        feasibility: math
      };
    });

    if (includeViolations) {
      return evaluated.sort((a, b) => b.feasibility.slack_minutes - a.feasibility.slack_minutes);
    }

    // Prune violations strictly
    return evaluated
      .filter(item => item.feasibility.feasible)
      .sort((a, b) => b.feasibility.slack_minutes - a.feasibility.slack_minutes);
  }
}

module.exports = new FeasibilityMathEngine();
