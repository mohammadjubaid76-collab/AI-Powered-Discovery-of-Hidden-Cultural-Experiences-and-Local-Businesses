/**
 * Google Gemini 1.5 Flash Multilingual Intent Extraction Service
 * Team Venator (ID: 60358412) - AI Synergy Hackathon 2026
 * 
 * STRICT ARCHITECTURAL PRINCIPLE:
 * "Gemini interprets user intent into structured JSON tokens.
 *  Gemini NEVER invents venues, opening hours, coordinates, or travel durations."
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');
const config = require('../config/env');
const schemaValidator = require('../utils/schemaValidator');

class GeminiService {
  constructor() {
    this.apiKey = config.geminiApiKey;
    this.genAI = this.apiKey ? new GoogleGenerativeAI(this.apiKey) : null;
    this.modelName = 'gemini-1.5-flash';
  }

  /**
   * Parses freeform natural language query (Hindi, Hinglish, English) into structured JSON tokens.
   * 
   * @param {string} rawQuery - User input text (e.g. "Mujhe local khana khana hai, 3 ghante hain")
   * @param {number} fallbackMinutes - Stated time slider minutes if not mentioned in text
   * @returns {Promise<Object>} Structured intent object
   */
  async extractIntent(rawQuery, fallbackMinutes = 180) {
    if (!this.genAI) {
      // Offline / zero-setup heuristic fallback for immediate evaluation without requiring cloud credentials
      return this.heuristicFallback(rawQuery, fallbackMinutes);
    }

    const systemInstruction = `You are a strict Intent Extraction Engine for heritage cultural tourism in Gwalior, India.
Your task is ONLY to translate the visitor's natural language request (in Hindi, Hinglish, or English) into structured JSON.

CRITICAL CONSTRAINTS:
1. NEVER invent, generate, or suggest any specific places, artisan names, coordinates, or travel durations.
2. Output ONLY a valid JSON object matching the schema below. Zero markdown preamble.
3. Available categories: "crafts", "culinary", "textile", "heritage", "music", "all".

JSON SCHEMA:
{
  "category": "crafts" | "culinary" | "textile" | "heritage" | "music" | "all",
  "normalized_query": "short english summary of intent",
  "time_budget_minutes": number (integer minutes extracted from text, or null if unmentioned),
  "origin_label": "Gwalior Fort Main Gate",
  "language": "hi" | "en" | "hinglish"
}`;

    try {
      const model = this.genAI.getGenerativeModel({
        model: this.modelName,
        systemInstruction
      });

      const prompt = `Visitor query: "${rawQuery}"\nDefault time budget: ${fallbackMinutes} minutes.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text().trim();

      // Clean markdown code blocks if returned
      const cleanJsonStr = text.replace(/```json/gi, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJsonStr);

      if (!parsed.time_budget_minutes) {
        parsed.time_budget_minutes = fallbackMinutes;
      }

      return schemaValidator.validateParsedIntent(parsed).sanitized;
    } catch (err) {
      console.warn(`[Gemini Service] Live API call failed or timed out (${err.message}). Using deterministic heuristic fallback.`);
      return this.heuristicFallback(rawQuery, fallbackMinutes);
    }
  }

  /**
   * Deterministic NLP heuristic parser for offline hackathon testing or network failures.
   */
  heuristicFallback(query, fallbackMinutes = 180) {
    const q = (query || '').toLowerCase();
    let category = 'all';

    if (q.includes('khana') || q.includes('food') || q.includes('bedai') || q.includes('kachori') || q.includes('gajak') || q.includes('sweet') || q.includes('mithai')) {
      category = 'culinary';
    } else if (q.includes('chanderi') || q.includes('weaver') || q.includes('bunkar') || q.includes('saree') || q.includes('fabric') || q.includes('khadi')) {
      category = 'crafts';
    } else if (q.includes('craft') || q.includes('pottery') || q.includes('stone') || q.includes('metal') || q.includes('zari') || q.includes('jewel') || q.includes('shilp')) {
      category = 'crafts';
    } else if (q.includes('music') || q.includes('tansen') || q.includes('sangeet') || q.includes('rag') || q.includes('instrument')) {
      category = 'music';
    } else if (q.includes('temple') || q.includes('mandir') || q.includes('sun temple') || q.includes('heritage')) {
      category = 'heritage';
    }

    // Extract hours if mentioned in text (e.g. "3 ghante", "2 hours", "3h")
    let extractedMinutes = fallbackMinutes;
    const hourMatch = q.match(/(\d+(\.\d+)?)\s*(ghante|hour|hr|h)\b/i);
    if (hourMatch && hourMatch[1]) {
      extractedMinutes = Math.round(parseFloat(hourMatch[1]) * 60);
    }

    return {
      category,
      normalized_query: query.trim(),
      time_budget_minutes: extractedMinutes,
      origin_label: 'Gwalior Fort Main Gate',
      language: /[अ-ह]/.test(query) ? 'hi' : (q.includes('hai') || q.includes('mujhe') ? 'hinglish' : 'en'),
      extracted_via: 'deterministic_heuristic_fallback'
    };
  }
}

module.exports = new GeminiService();
