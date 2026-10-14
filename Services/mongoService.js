/**
 * MongoDB / Curated POI Retrieval Service
 * Team Venator (ID: 60358412) - AI Synergy Hackathon 2026
 * 
 * Provides spatial bounding (3-8 km micro-corridor) and category filtering
 * from the authoritative human-verified Gwalior dataset.
 */

const db = require('../config/db');
const distanceMatrixService = require('./distanceMatrixService');

class MongoService {
  /**
   * Finds candidate POIs within 3-8 km of the specified origin and matching category.
   * 
   * @param {Object} options
   * @param {string} options.category - 'crafts', 'culinary', 'textile', 'heritage', 'music', or 'all'
   * @param {Object} options.origin - { lat, lng }
   * @param {number} options.minDistanceKm - Default 3.0 km
   * @param {number} options.maxDistanceKm - Default 8.0 km
   * @returns {Promise<Array<Object>>} Enriched candidate POIs
   */
  async findCandidates({ category = 'all', origin, minDistanceKm = 0, maxDistanceKm = 10 }) {
    const allPois = db.getAllPOIs();

    // 1. Filter by category if not 'all'
    let filtered = allPois;
    if (category && category !== 'all') {
      filtered = allPois.filter(poi => {
        return (
          poi.category.toLowerCase() === category.toLowerCase() ||
          (poi.subCategory && poi.subCategory.toLowerCase().includes(category.toLowerCase()))
        );
      });

      // If category filter results in 0 items, gracefully fall back to all items so user is not left empty-handed
      if (filtered.length === 0) {
        filtered = allPois;
      }
    }

    // 2. Compute spatial distance to each candidate from provided origin
    const candidates = [];
    for (const poi of filtered) {
      const transit = await distanceMatrixService.getTransitTime(origin, poi.coordinates);

      // We focus on the peripheral cultural corridor (around 3 to 8 km)
      if (transit.distance_km >= minDistanceKm && transit.distance_km <= maxDistanceKm) {
        candidates.push({
          ...poi,
          calculated_distance_km: transit.distance_km,
          transit_outbound_mins: transit.outbound_minutes,
          transit_return_mins: transit.return_minutes,
          is_transit_verified: transit.is_verified,
          transit_verification_tag: transit.verification_tag,
          transit_warning: transit.warning
        });
      }
    }

    // Sort by proximity
    return candidates.sort((a, b) => a.calculated_distance_km - b.calculated_distance_km);
  }

  /**
   * Retrieves single POI by ID
   */
  getById(id) {
    const all = db.getAllPOIs();
    return all.find(p => p.id === id) || null;
  }
}

module.exports = new MongoService();
