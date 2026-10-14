# RESTful API Specification & Exception Protocols
**Team Venator (ID: 60358412) • AI Synergy Hackathon 2026**  
**Base URL:** `http://localhost:3000`

---

## 1. Endpoint Directory

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/v1/feasibility/search` | Core pipeline: intent parse, spatial retrieval, math feasibility & pruning |
| `POST` | `/api/v1/intent/parse` | Standalone Gemini 1.5 Flash NLP intent extraction |
| `GET` | `/api/v1/pois` | Dumps authoritative curated Gwalior pilot POI registry |
| `GET` | `/health` | System health check & active service metadata |

---

## 2. Core Endpoint: `POST /api/v1/feasibility/search`

Executes the full end-to-end decision pipeline: Multilingual Gemini intent parsing, spatial candidate filtering, deterministic inequality verification with +25% buffer, and candidate pruning.

### Request Headers
```http
Content-Type: application/json
Accept: application/json
```

### Request Body Schema
```json
{
  "query": "string (Required) - Multilingual freeform text in Hindi, Hinglish, or English",
  "time_budget_minutes": "number (Optional) - User available window in minutes [30 - 600]. Default: 180",
  "origin": {
    "lat": "number (Optional) - Latitude between -90 and 90. Default: 26.2298",
    "lng": "number (Optional) - Longitude between -180 and 180. Default: 78.1733",
    "label": "string (Optional) - Origin label, e.g., 'Gwalior Fort Main Gate'"
  }
}
```

### Sample Request
```json
{
  "query": "Mujhe local authentic khana aur Bedai khana hai, 3 ghante hain",
  "time_budget_minutes": 180,
  "origin": {
    "lat": 26.2298,
    "lng": 78.1733,
    "label": "Gwalior Fort Main Gate"
  }
}
```

### Success Response (`200 OK`)
```json
{
  "status": "success",
  "project": "Time-Aware Digital Discoverability: Beyond the Fort",
  "team": "Team Venator (ID: 60358412)",
  "request": {
    "raw_query": "Mujhe local authentic khana aur Bedai khana hai, 3 ghante hain",
    "origin": {
      "lat": 26.2298,
      "lng": 78.1733,
      "label": "Gwalior Fort Main Gate"
    },
    "time_budget_minutes": 180
  },
  "intent_parsed": {
    "category": "culinary",
    "normalized_query": "Mujhe local authentic khana aur Bedai khana hai, 3 ghante hain",
    "time_budget_minutes": 180,
    "origin_label": "Gwalior Fort Main Gate",
    "language": "hinglish"
  },
  "summary": {
    "candidates_screened": 3,
    "candidates_feasible": 3,
    "safety_buffer_rate": "25% of roundtrip transit + dwell time",
    "pruning_policy": "Strictly eliminated over-budget candidates"
  },
  "results": [
    {
      "id": "poi_gwl_002",
      "name": "Naya Bazar Heritage Culinary Lane - SS Kachori & Bedai",
      "hindiName": "नया बाज़ार बेड़ई एवं कचौड़ी परंपरा",
      "category": "culinary",
      "subCategory": "traditional_breakfast",
      "description": "Century-old culinary landmark preparing Urad-dal stuffed Bedai with spicy hing potato sabzi.",
      "coordinates": { "lat": 26.2088, "lng": 78.1610 },
      "calculated_distance_km": 2.66,
      "transit_outbound_mins": 10,
      "transit_return_mins": 10,
      "is_transit_verified": true,
      "transit_verification_tag": "[Live Transit Matrix]",
      "min_dwell_time_mins": 30,
      "verification_status": "VERIFIED_AUDITOR",
      "last_audited": "2026-09-01",
      "feasibility": {
        "t_outbound": 10,
        "t_return": 10,
        "t_round_trip": 20,
        "t_visit": 30,
        "t_buffer": 13,
        "t_total": 63,
        "t_available": 180,
        "slack_minutes": 117,
        "feasible": true,
        "inequality_formula": "10m + 10m + 30m + 13m = 63m <= 180m"
      }
    }
  ]
}
```

---

## 3. Dedicated Intent Endpoint: `POST /api/v1/intent/parse`

### Request Body
```json
{
  "query": "Chanderi sarees aur master weavers dekhna hai",
  "fallback_minutes": 180
}
```

### Success Response (`200 OK`)
```json
{
  "status": "success",
  "input": "Chanderi sarees aur master weavers dekhna hai",
  "parsed_intent": {
    "category": "crafts",
    "normalized_query": "Chanderi sarees aur master weavers dekhna hai",
    "time_budget_minutes": 180,
    "origin_label": "Gwalior Fort Main Gate",
    "language": "hinglish"
  }
}
```

---

## 4. Error Codes & Protocols

### Parameter Validation Failure (`400 Bad Request`)
```json
{
  "status": "error",
  "code": "INVALID_PARAMETERS",
  "errors": [
    "Field \"query\" is required and must be a non-empty string.",
    "Field \"time_budget_minutes\" must be a number between 30 (0.5h) and 600 (10h)."
  ]
}
```

### Transit API Outage Protocol
When Distance Matrix API encounters a network severance or timeout, the engine:
1. Calculates transit times via calibrated geometric fallback.
2. Emits `"is_transit_verified": false`.
3. Mandatorily stamps `"transit_verification_tag": "[Travel-Time Unverified]"`.
4. Attaches `"transit_warning": "Transit time calculated via calibrated geometric modeling. Live municipal traffic data is unverified."`.
