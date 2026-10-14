# Mathematical Feasibility Model & Time Budget Mechanics
**Team Venator (ID: 60358412) • AI Synergy Hackathon 2026**  
**Theme:** Theme 04 — Tourism: Beyond the Fort

---

## 1. Formal Inequality Formulation

In heritage day-trips, a tourist cannot afford open-ended exploration. Every recommended detour must guarantee return to their departure hub (e.g. railway station or hotel) before their departure window closes.

A candidate Point of Interest (POI) $P_i$ is mathematically eligible for recommendation if and only if its total time envelope satisfies:

$$T_{\text{outbound}}(P_i) + T_{\text{return}}(P_i) + T_{\text{visit}}(P_i) + T_{\text{buffer}}(P_i) \le T_{\text{available}}$$

### Parameter Definitions

| Variable | Description | Source | Unit |
| :--- | :--- | :--- | :--- |
| $T_{\text{outbound}}(P_i)$ | Transit duration from origin to $P_i$ | Distance Matrix / Velocity Model | Minutes |
| $T_{\text{return}}(P_i)$ | Transit duration from $P_i$ back to origin | Distance Matrix / Velocity Model | Minutes |
| $T_{\text{visit}}(P_i)$ | Curated minimum dwell time required for authentic engagement | Human Auditor / Field Survey | Minutes |
| $T_{\text{buffer}}(P_i)$ | Dynamic safety cushion protecting against unpredictable delays | Computed ($25\%$ Safety Rule) | Minutes |
| $T_{\text{available}}$ | Visitor's stated maximum visiting window | User UI Slider / Gemini Parse | Minutes |

---

## 2. Dynamic Safety Buffer Rationale

$$T_{\text{buffer}}(P_i) = \left\lceil 0.25 \times \left(T_{\text{round\_trip}}(P_i) + T_{\text{visit}}(P_i)\right) \right\rceil$$

Where:
$$T_{\text{round\_trip}}(P_i) = T_{\text{outbound}}(P_i) + T_{\text{return}}(P_i)$$

### Why a 25% Multiplier?
1. **Urban Road Dynamics:** Central Gwalior transit corridors (e.g. Naya Bazar, Maharaj Bada, Hazira) encounter periodic bottleneck delays caused by narrow bazaar streets, e-rickshaw traffic, and pedestrian crossings.
2. **First-and-Last-Mile Navigation:** Parking an auto-rickshaw or car near traditional artisan clusters requires an extra 4–8 minutes of foot navigation through narrow alleys.
3. **Artisan Interaction Slack:** Observing master handloom weaving or traditional brass casting is an unhurried cultural activity; conversational engagement typically fluctuates by $\pm 10\text{–}15$ minutes.

---

## 3. Total Time Envelope & Slack Calculation

The total commitment time $T_{\text{total}}(P_i)$ is:
$$T_{\text{total}}(P_i) = T_{\text{round\_trip}}(P_i) + T_{\text{visit}}(P_i) + T_{\text{buffer}}(P_i)$$

The remaining visitor slack $\sigma(P_i)$ is:
$$\sigma(P_i) = T_{\text{available}} - T_{\text{total}}(P_i)$$

- If $\sigma(P_i) \ge 0 \implies \text{Feasible (Passes Gate)}$
- If $\sigma(P_i) < 0 \implies \text{Infeasible (Pruned by Engine)}$

---

## 4. Concrete Worked Examples

### Example 1: Feasible Cultural Experience
- **Candidate:** Chanderi Weavers Cluster - Kripalpur ($3.8\text{ km}$ from Fort)
- **Visitor Time Window:** $3.0\text{ Hours}$ ($T_{\text{available}} = 180\text{ mins}$)
- **Parameters:**
  - $T_{\text{outbound}} = 18\text{ mins}$
  - $T_{\text{return}} = 18\text{ mins} \implies T_{\text{round\_trip}} = 36\text{ mins}$
  - $T_{\text{visit}} = 45\text{ mins}$ (curated dwell time)
- **Calculations:**
  $$T_{\text{base}} = 36 + 45 = 81\text{ mins}$$
  $$T_{\text{buffer}} = \lceil 0.25 \times 81 \rceil = \lceil 20.25 \rceil = 21\text{ mins}$$
  $$T_{\text{total}} = 81 + 21 = 102\text{ mins}$$
  $$\sigma = 180 - 102 = +78\text{ mins (Slack)}$$
- **Decision:** **FEASIBLE**. Candidate is displayed with guaranteed return time and $+78\text{ mins}$ margin.

---

### Example 2: Infeasible (Violates Boundary)
- **Candidate:** Morar Sun Temple & Sandstone Chisellers ($6.8\text{ km}$ from Fort)
- **Visitor Time Window:** $1.5\text{ Hours}$ ($T_{\text{available}} = 90\text{ mins}$)
- **Parameters:**
  - $T_{\text{outbound}} = 28\text{ mins}$
  - $T_{\text{return}} = 28\text{ mins} \implies T_{\text{round\_trip}} = 56\text{ mins}$
  - $T_{\text{visit}} = 50\text{ mins}$ (curated dwell time)
- **Calculations:**
  $$T_{\text{base}} = 56 + 50 = 106\text{ mins}$$
  $$T_{\text{buffer}} = \lceil 0.25 \times 106 \rceil = \lceil 26.5 \rceil = 27\text{ mins}$$
  $$T_{\text{total}} = 106 + 27 = 133\text{ mins}$$
  $$\sigma = 90 - 133 = -43\text{ mins}$$
- **Decision:** **PRUNED (INFEASIBLE)**. Total required duration ($133\text{ mins}$) exceeds user window ($90\text{ mins}$). Candidate is eliminated to prevent the tourist from missing their departure.

---

## 5. Pruning Decision Logic & Pseudocode

```javascript
function evaluateFeasibility(poi, t_available) {
  const t_roundtrip = poi.transit_outbound_mins + poi.transit_return_mins;
  const t_visit = poi.min_dwell_time_mins;
  
  // Mandatory 25% safety buffer
  const t_buffer = Math.ceil(0.25 * (t_roundtrip + t_visit));
  const t_total = t_roundtrip + t_visit + t_buffer;
  const slack = t_available - t_total;

  if (t_total <= t_available) {
    return {
      feasible: true,
      t_total,
      t_buffer,
      slack_minutes: slack
    };
  } else {
    return {
      feasible: false,
      t_total,
      t_buffer,
      slack_minutes: slack // negative
    };
  }
}
```
