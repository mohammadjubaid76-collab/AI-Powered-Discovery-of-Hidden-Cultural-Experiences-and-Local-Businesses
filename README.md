# AI-Powered-Hidden-Cultural-Discovery
**AI Synergy Hackathon 2026 • Round 1 Submission**  
**Team Identity:** Team Venator (ID: `60358412`) | ITM University Gwalior  
**Selected Theme:** Theme 04 — Tourism: Beyond the Fort (Gwalior Micro-Corridor Pilot)  
**Live Repository:** `https://github.com/ayankhan96686-create/Time-Aware-Digital-Discoverability-Beyond-the-Fort`

---

## 📌 Executive Summary

Heritage cities across India suffer from severe tourism hyper-concentration. In Gwalior, **67% of day-visitor footfall remains trapped in a 1.2 km bubble** around Gwalior Fort and Jai Vilas Palace. Meanwhile, authentic master artisans—Chanderi silk weavers in Kripalpur, brass founders in Maharaj Bada, and classical Dhrupad musicians in Hazira—sit just **3 to 8 km away**, invisible to visitors.

Visitors do not avoid these cultural gems due to lack of interest; they avoid them due to **travel-time anxiety**. Day-visitors operate within rigid **5 to 8 hour schedules**. Without guaranteed return times, visiting a peripheral artisan risks missing an evening train or flight.

### The Venator Solution
A decoupled, 3-tier web platform where:
1. **Google Gemini 1.5 Flash** parses multilingual (Hindi, Hinglish, English) requests into structured intent tokens without hallucinating venues.
2. **Node.js Feasibility Engine** calculates deterministic travel-space arithmetic, applying a mandatory **25% dynamic safety buffer**.
3. **Curated POI Store** serves human-audited artisan records with verified dwell times and community etiquette guidelines.

> **Core Axiom:** *"A place is useful only if visitors trust it fits their schedule."*

---

## 📐 The Feasibility Inequality

A candidate cultural experience is certified and recommended *if and only if* it satisfies:

$$T_{\text{outbound}} + T_{\text{return}} + T_{\text{visit}} + T_{\text{buffer}} \le T_{\text{available}}$$

Where:
- $T_{\text{outbound}}$ = Transit duration from origin to the artisan site.
- $T_{\text{return}}$ = Transit duration from artisan site back to origin/hub.
- $T_{\text{visit}}$ = Curated minimum dwell time for authentic engagement.
- $T_{\text{buffer}} = \lceil 0.25 \times (T_{\text{round\_trip}} + T_{\text{visit}}) \rceil$ = Mandatory 25% safety margin protecting against urban transit variances.
- $T_{\text{available}}$ = Visitor's stated available visiting window.

---

## 🏗 System Architecture (Decoupled 3 Tiers)

```
+-------------------------------------------------------------------------+
|                       TIER 1: CLIENT PRESENTATION                       |
|   • Mobile-First Responsive EJS & Vanilla CSS (Bento Box Design)        |
|   • Multilingual Conversational Query Bar ("Mujhe local khana...")      |
|   • Dynamic Time-Budget Slider (1.0h to 8.0h)                           |
+-------------------------------------------------------------------------+
                                    │
                         POST /api/v1/feasibility/search
                                    ▼
+-------------------------------------------------------------------------+
|                    TIER 2: BACKEND FEASIBILITY ENGINE                   |
|   • Node.js & Express API                                               |
|   • Input Boundary & Schema Validation (schemaValidator.js)            |
|   • Deterministic Feasibility Evaluation (feasibilityMath.js)           |
|   • Over-Budget Candidate Pruning (Zero Hallucination)                  |
+-------------------------------------------------------------------------+
        │                                                  │
        ▼                                                  ▼
+───────────────────────────+             +───────────────────────────────+
|     TIER 3A: AI INTENT    |             |     TIER 3B: DATA & TRANSIT   |
| • Google Gemini 1.5 Flash |             | • Curated POI Store (12 POIs) |
| • Translates natural lang |             | • Distance Matrix Service     |
| • Negative constraint:    |             | • Outage Circuit Breaker:     |
|   NEVER generates venues  |             |   Tag: [Travel-Time           |
|                           |             |        Unverified]            |
+───────────────────────────+             +───────────────────────────────+
```

---

## 🚀 Quickstart Guide

### Prerequisites
- Node.js `v18+` (Tested on `v24.14.0`)
- npm `v9+`

### Installation
```bash
# Clone the repository
git clone https://github.com/ayankhan96686-create/Time-Aware-Digital-Discoverability-Beyond-the-Fort.git
cd time-aware-tourism-gwalior

# Install dependencies
npm install

# Configure environment variables (optional for local demo)
cp .env.example .env
```

### Running the Test Suite
The repository includes a 100% deterministic test suite covering feasibility math, buffer calculations, pruning, transit outage handling, and schema validation:
```bash
npm test
```
*Expected output: `✔ 7 pass, 0 fail`*

### Starting the Application
```bash
npm start
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📂 Repository Layout

```
├── README.md                      # Project overview, quickstart & team roster
├── ARCHITECTURE.md                # Decoupled 3-tier architecture & system boundaries
├── FEASIBILITY_MATH.md            # Formal mathematical proofs & buffer formulation
├── API_SPEC.md                    # RESTful API documentation & error handling
├── DATASET_EXPLORATION.md         # Gwalior pilot dataset audit & schema specifications
├── ACCEPTANCE_TESTS.md            # Test harness architecture & validation criteria
├── server.js                      # Application entry point
├── package.json                   # Dependency and script manifests
├── .env.example                   # Environment variable template
├── config/
│   ├── env.js                     # Environment validation with safe defaults
│   └── db.js                      # DB layer with hybrid local authoritative fallback
├── controllers/
│   ├── feasibilityController.js   # Orchestrates search, intent, math & pruning
│   └── intentController.js        # Dedicated NLP intent parser endpoint
├── services/
│   ├── geminiService.js           # Gemini 1.5 Flash intent client (Strict NLP prompt)
│   ├── distanceMatrixService.js   # Transit computation with outage circuit-breaker
│   └── mongoService.js            # Curated POI geospatial retrieval & corridor filtering
├── utils/
│   ├── feasibilityMath.js         # Deterministic inequality evaluation & pruning
│   └── schemaValidator.js         # Input sanitization & JSON schema validation
├── data/
│   └── gwalior_curated_pois.json  # 12 audited authentic Gwalior cultural POIs
├── tests/
│   └── acceptanceTests.test.js    # Comprehensive automated test suite
├── views/
│   ├── index.ejs                  # Bento Box UI landing & search interface
│   └── results.ejs                # Feasibility envelopes, badges & breakdown view
└── public/
    ├── css/style.css              # Ultra-sleek Bento / Swiss Minimalist CSS
    └── js/main.js                 # Interactive time slider & chip bindings
```

---

## 👥 Team Venator Roster

| Member Name | Institutional Affiliation | Project Role |
| :--- | :--- | :--- |
| **Mohammad Jubaid** | ITM University Gwalior | Team Lead & AI Architecture Specialist |
| **Ayan Khan** | ITM University Gwalior | Backend Systems & Deterministic Math Engine |
| **Arjun Singh Bhadoriya** | ITM University Gwalior | Geospatial Engineering & Data Stewardship |
| **Mohith Ch** | ITM University Gwalior | Frontend Architecture & Bento UI/UX Design |

---

## 📄 License & Attribution
This project is licensed under the MIT License for the AI Synergy Hackathon 2026.
