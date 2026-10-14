# Automated Acceptance Test Suite & Quality Verification
**Team Venator (ID: 60358412) • AI Synergy Hackathon 2026**  
**Test Suite Path:** `tests/acceptanceTests.test.js`

---

## 1. Test Harness Philosophy

The Venator test harness is engineered to provide **100% deterministic, reproducible proof** of our technical architecture. Built using Node.js's native test runner (`node:test`) and strict assertion library (`node:assert/strict`), it requires zero external test framework bloat and executes in under 300ms.

---

## 2. Test Case Register

| ID | Category | Target Component | Verification Objective | Status |
| :--- | :--- | :--- | :--- | :--- |
| **TC-01** | Mathematical Proof | `utils/feasibilityMath.js` | Verifies that $T_{\text{outbound}} + T_{\text{return}} + T_{\text{visit}} + T_{\text{buffer}} \le T_{\text{available}}$ correctly tags candidates as feasible/infeasible. | `PASS` |
| **TC-02** | Buffer Formula | `utils/feasibilityMath.js` | Confirms dynamic injection of mandatory $25\%$ safety buffer: $T_{\text{buffer}} = \lceil 0.25 \times (T_{\text{round\_trip}} + T_{\text{visit}}) \rceil$. | `PASS` |
| **TC-03** | Candidate Pruning | `utils/feasibilityMath.js` | Enforces that candidates exceeding $T_{\text{available}}$ are strictly eliminated from the final recommendation array. | `PASS` |
| **TC-04** | Circuit-Breaker Failsafe | `services/distanceMatrixService.js` | Validates that transit API timeouts trigger fallback with mandatory `[Travel-Time Unverified]` tag. | `PASS` |
| **TC-05** | Schema Boundary Check | `utils/schemaValidator.js` | Verifies rejection of missing queries, negative time budgets, and malformed coordinates. | `PASS` |
| **TC-06** | Multilingual NLP Parser | `services/geminiService.js` | Tests normalization of Hindi/Hinglish requests (*"Mujhe local khana khana hai"*) into structured category tokens. | `PASS` |
| **TC-07** | Dataset Verification | `services/mongoService.js` | Asserts that at least 12 authentic Gwalior POIs are indexed with audited dwell times and coordinates. | `PASS` |

---

## 3. How to Execute Tests

```bash
# From repository root
npm test
```

### Verified Execution Log
```
> time-aware-tourism-gwalior@1.0.0 test
> node --test tests/acceptanceTests.test.js

[DB Layer] Loaded 12 curated Gwalior POIs from local authoritative dataset.
▶ Team Venator Acceptance Test Suite
  ✔ Test 1: Evaluates candidate feasibility via strict mathematical inequality (2.67ms)
  ✔ Test 2: Enforces mandatory 25% safety buffer calculation (0.14ms)
  ✔ Test 3: Pruning strictly eliminates candidates exceeding available time budget (0.33ms)
  ✔ Test 4: Transit API outage triggers unverified badge fallback without lying (1.04ms)
  ✔ Test 5: Validates request payloads and rejects malformed parameters (0.34ms)
  ✔ Test 6: Normalizes multilingual queries to structured categories (0.69ms)
  ✔ Test 7: Verified pilot dataset contains at least 12 audited Gwalior POIs (0.50ms)
✔ Team Venator Acceptance Test Suite (7.08ms)
ℹ tests 7
ℹ suites 1
ℹ pass 7
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 246.58
```

---

## 4. Manual Verification Walkthrough

### Test A: Web UI Experience
1. Start the server: `npm start`.
2. Navigate to `http://localhost:3000`.
3. Verify that the **Time Window Slider** dynamically updates the hours and minutes label.
4. Click on quick chip: `🧵 Chanderi Silk Weavers`.
5. Submit search and verify that all recommended cards show:
   - Dwell time & transit time breakdown.
   - The computed $25\%$ safety buffer.
   - The `[Live Transit Matrix]` or `[Travel-Time Unverified]` tag.
   - Verified artisan badge.

### Test B: Deterministic Pruning Edge Case
1. Set the time slider to **1.0 Hour (60 minutes)**.
2. Submit search.
3. Verify that distant artisans (e.g. Morar Sun Temple or Daulat Ganj) are strictly pruned out because their roundtrip transit ($>40\text{m}$) plus dwell time ($>30\text{m}$) plus $25\%$ buffer exceeds $60\text{ minutes}$.
4. Verify the zero-results educational state advising the user to increase their time window.

### Test C: REST API Feasibility Check
Execute via PowerShell or terminal:
```bash
curl -X POST http://localhost:3000/api/v1/feasibility/search `
  -H "Content-Type: application/json" `
  -d '{"query": "Chanderi weavers", "time_budget_minutes": 180}'
```
Confirm `status: "success"` and that every returned POI has `feasible: true` and a calculated `slack_minutes >= 0`.
