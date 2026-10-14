/**
 * Input & Intent Schema Validator
 * Team Venator (ID: 60358412) - AI Synergy Hackathon 2026
 */

class SchemaValidator {
  /**
   * Validates client HTTP search payload
   * @param {Object} body 
   * @returns {{ valid: boolean, errors: string[] }}
   */
  validateSearchRequest(body) {
    const errors = [];

    if (!body || typeof body !== 'object') {
      return { valid: false, errors: ['Request body must be a valid JSON object.'] };
    }

    if (!body.query || typeof body.query !== 'string' || body.query.trim().length === 0) {
      errors.push('Field "query" is required and must be a non-empty string.');
    }

    if (body.time_budget_minutes !== undefined) {
      const budget = Number(body.time_budget_minutes);
      if (isNaN(budget) || budget < 30 || budget > 600) {
        errors.push('Field "time_budget_minutes" must be a number between 30 (0.5h) and 600 (10h).');
      }
    }

    if (body.origin) {
      if (typeof body.origin !== 'object') {
        errors.push('Field "origin" must be an object with lat and lng.');
      } else {
        const { lat, lng } = body.origin;
        if (lat !== undefined && (typeof lat !== 'number' || lat < -90 || lat > 90)) {
          errors.push('Origin latitude must be a valid number between -90 and 90.');
        }
        if (lng !== undefined && (typeof lng !== 'number' || lng < -180 || lng > 180)) {
          errors.push('Origin longitude must be a valid number between -180 and 180.');
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Validates Gemini structured intent extraction output
   * @param {Object} intent 
   * @returns {{ valid: boolean, sanitized: Object }}
   */
  validateParsedIntent(intent) {
    const allowedCategories = ['crafts', 'culinary', 'textile', 'heritage', 'music', 'all'];

    let category = 'all';
    if (intent && intent.category && typeof intent.category === 'string') {
      const catLower = intent.category.toLowerCase().trim();
      if (allowedCategories.includes(catLower)) {
        category = catLower;
      } else if (catLower.includes('food') || catLower.includes('khana') || catLower.includes('sweet')) {
        category = 'culinary';
      } else if (catLower.includes('cloth') || catLower.includes('saree') || catLower.includes('weav')) {
        category = 'crafts';
      } else if (catLower.includes('song') || catLower.includes('tansen')) {
        category = 'music';
      }
    }

    let timeBudget = 180; // default 3.0 hours
    if (intent && intent.time_budget_minutes) {
      const budget = Number(intent.time_budget_minutes);
      if (!isNaN(budget) && budget >= 30 && budget <= 600) {
        timeBudget = budget;
      }
    }

    return {
      valid: true,
      sanitized: {
        category,
        normalized_query: (intent && intent.normalized_query) || '',
        time_budget_minutes: timeBudget,
        origin_label: (intent && intent.origin_label) || 'Gwalior Fort Main Gate',
        language: (intent && intent.language) || 'hi'
      }
    };
  }
}

module.exports = new SchemaValidator();
