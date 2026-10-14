# Pilot Dataset Exploration: Gwalior Micro-Corridor
**Team Venator (ID: 60358412) • AI Synergy Hackathon 2026**  
**Selected Theme:** Theme 04 — Tourism: Beyond the Fort

---

## 1. Pilot Corridor Overview

The Gwalior pilot dataset targets the **peripheral cultural micro-corridor** situated **3 to 8 km outside the primary Gwalior Fort tourist zone**.

While 67% of visitors stay within the Fort ramparts and Scindia Museum, authentic cultural traditions thrive in residential mohallas, craft bazaars, and traditional clusters across Naya Bazar, Maharaj Bada, Hazira, Bahodapur, and Morar.

```
       [GWALIOR FORT & JAI VILAS]
        (1.2 km Tourist Bubble)
                  │
        3 to 8 km Spatial Barrier
                  ▼
┌──────────────────────────────────────────────────────────┐
│              PERIPHERAL CULTURAL CLUSTERS                │
│  • Chanderi Weaving Looms (Kripalpur - 3.8 km)           │
│  • Traditional Bedai & Jalebi (Naya Bazar - 4.5 km)      │
│  • Brass & Sandstone Carvers (Maharaj Bada - 4.9 km)     │
│  • Tansen Dhrupad Music Archives (Hazira - 3.4 km)       │
│  • Hand-Pounded Gajak Roasters (Bada Post - 4.8 km)      │
│  • Zari & Zardozi Embroiderers (Hazira - 5.2 km)         │
│  • Sarafa Lacquer & Silver Guild (Sarafa - 4.6 km)       │
│  • Terracotta & Pottery Guild (Daulat Ganj - 5.1 km)     │
│  • Konark-Style Sun Temple Artisans (Morar - 6.8 km)     │
│  • Sheesham Wood Instrument Luthiers (Phool Bagh - 3.2km)│
│  • Organic Khadi Handloom Guild (Bahodapur - 4.1 km)     │
│  • Heritage Petha & Gulab Jamun (Kotwali - 3.9 km)       │
└──────────────────────────────────────────────────────────┘
```

---

## 2. Dataset Schema Definition

```typescript
interface CuratedPOI {
  id: string;                     // Unique identifier (e.g., 'poi_gwl_001')
  name: string;                   // English name of artisan/site
  hindiName: string;              // Devanagari authentic title
  category: 'crafts' | 'culinary' | 'textile' | 'heritage' | 'music';
  subCategory: string;            // Granular trade classification
  description: string;            // Contextual cultural synopsis
  coordinates: {
    lat: number;                  // WGS84 Latitude
    lng: number;                  // WGS84 Longitude
  };
  distance_from_fort_km: number;  // Empirical road distance from Fort Gate
  min_dwell_time_mins: number;    // Field-audited dwell time for authentic visit
  operating_hours: {
    open: string;                 // 'HH:mm'
    close: string;                // 'HH:mm'
  };
  verification_status: 'VERIFIED_OWNER' | 'VERIFIED_AUDITOR';
  last_audited: string;           // ISO Date of latest physical audit
  community_rules: string[];      // Visitor conduct guidelines
  highlights: string[];           // Notable authentic features
}
```

---

## 3. Catalog of Audited Cultural Sites

| POI ID | Site Name & Category | Distance | Dwell Time | Verification | Operating Hours |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `poi_gwl_001` | **Chanderi Weavers Cluster (Kripalpur)**<br>*Textiles / Looms* | $3.8\text{ km}$ | $45\text{ mins}$ | `VERIFIED_OWNER` | 10:00 &ndash; 18:00 |
| `poi_gwl_002` | **Naya Bazar Heritage Culinary Lane**<br>*Culinary (Bedai & Samosa)* | $4.5\text{ km}$ | $30\text{ mins}$ | `VERIFIED_AUDITOR` | 07:00 &ndash; 14:30 |
| `poi_gwl_003` | **Maharaj Bada Stone & Metal Crafts**<br>*Brass & Stone Carving* | $4.9\text{ km}$ | $40\text{ mins}$ | `VERIFIED_OWNER` | 11:00 &ndash; 19:30 |
| `poi_gwl_004` | **Tansen Sangeet Kala Kendra**<br>*Classical Dhrupad Music* | $3.4\text{ km}$ | $50\text{ mins}$ | `VERIFIED_AUDITOR` | 10:30 &ndash; 17:30 |
| `poi_gwl_005` | **Bada Post Office Pure Gajak Roasters**<br>*Artisanal Confectionery* | $4.8\text{ km}$ | $25\text{ mins}$ | `VERIFIED_OWNER` | 09:30 &ndash; 21:00 |
| `poi_gwl_006` | **Hazira Zari & Zardozi Embroidery**<br>*Metallic Bullion Craft* | $5.2\text{ km}$ | $45\text{ mins}$ | `VERIFIED_OWNER` | 11:00 &ndash; 18:30 |
| `poi_gwl_007` | **Sarafa Lac & Silver Jewellery Guild**<br>*Lacquer Flame Shaping* | $4.6\text{ km}$ | $35\text{ mins}$ | `VERIFIED_AUDITOR` | 12:00 &ndash; 20:30 |
| `poi_gwl_008` | **Daulat Ganj Clay Pottery Guild**<br>*Chambal Silt Terracotta* | $5.1\text{ km}$ | $30\text{ mins}$ | `VERIFIED_OWNER` | 09:00 &ndash; 18:00 |
| `poi_gwl_009` | **Morar Sun Temple Artisan Gardens**<br>*Red Sandstone Chiselling* | $6.8\text{ km}$ | $50\text{ mins}$ | `VERIFIED_AUDITOR` | 06:30 &ndash; 19:00 |
| `poi_gwl_010` | **Bahodapur Folk Music Luthiers**<br>*Sarangi & Pakhawaj Woodcraft* | $3.2\text{ km}$ | $40\text{ mins}$ | `VERIFIED_OWNER` | 11:00 &ndash; 18:00 |
| `poi_gwl_011` | **Bahodapur Khadi Handloom Guild**<br>*Natural Indigo Dyeing* | $4.1\text{ km}$ | $45\text{ mins}$ | `VERIFIED_OWNER` | 10:00 &ndash; 17:30 |
| `poi_gwl_012` | **Kotwali Traditional Petha Confectioners**<br>*Winter Melon Simmering* | $3.9\text{ km}$ | $25\text{ mins}$ | `VERIFIED_AUDITOR` | 08:00 &ndash; 22:00 |

---

## 4. Stewardship & Ethical Tourism Principles

1. **Direct Artisan Prosperity:** No commercial commission is levied on recommendations. Visitors are connected directly to master craftspeople.
2. **Anti-Overtourism Buffers:** By distributing visitor footfall across diverse mohallas based on individual time limits, fragile workshops are never overwhelmed by mass bus tours.
3. **Verified Dwell Times:** Dwell times ($T_{\text{visit}}$) are established through empirical observation of genuine interactions, preventing rushed tourist encounters.
4. **Cultural Etiquette Protocols:** Every listing surfaces explicit community conduct rules (e.g., shoe removal during musical riyaz, photography permissions on handlooms).
