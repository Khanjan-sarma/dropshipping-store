# Product Seed Data

> **For Kiro IDE:** Use this data for the database seed step (Section 10, Step 2 of WEBSITE_SPEC.md). All prices are in **paise** (integers) to match the Prisma schema — ₹499 = `49900`. Replace image placeholder URLs with real Cloudinary URLs once uploaded. Descriptions are sell-focused but honest; adjust freely.

---

## Store Identity (suggestions — pick one)

- **Store name ideas:** `KwikKart`, `NestNook`, `ChillCart`, `DailyDose`, `SnapKart`
- **Tagline:** "Everyday upgrades, delivered fast — Cash on Delivery available across India."
- **Brand voice:** Friendly, practical, value-for-money. Emphasize COD, fast 3–5 day delivery, and easy returns.

---

## Products

### 1. Portable Rechargeable Neck Fan
| Field | Value |
|-------|-------|
| slug | `portable-neck-fan` |
| category | `cooling` |
| price (sell) | `54900` (₹549) |
| compareAt (MRP) | `129900` (₹1,299) |
| costPrice | `16500` (₹165) |
| stock | `999` |

**Description:**
Beat the heat hands-free. This lightweight, bladeless neck fan wraps comfortably around your neck and keeps cool air flowing for up to 4 hours on a single USB charge. Three adjustable speeds, whisper-quiet motor, and a flexible design that fits everyone. Perfect for commutes, gaming marathons, outdoor work, and long summer days. Rechargeable via any USB port — no batteries to replace.

**Bullet highlights:**
- Up to 4 hours of cooling per charge
- Bladeless & safe — no hair tangling
- 3 speed settings, ultra-quiet
- USB-C rechargeable, lightweight & travel-friendly

---

### 2. Mini USB Personal Air Cooler
| Field | Value |
|-------|-------|
| slug | `mini-usb-air-cooler` |
| category | `cooling` |
| price (sell) | `109900` (₹1,099) |
| compareAt (MRP) | `199900` (₹1,999) |
| costPrice | `40000` (₹400) |
| stock | `999` |

**Description:**
Your personal cooling zone, anywhere. Fill the water tank, plug it in, and enjoy cool, misted air right at your desk, bedside, or study table. Runs on USB power, features multiple fan speeds, and a soft LED night light. Compact enough to carry room to room. Note: this is a personal evaporative cooler designed for close-range cooling — not a replacement for an air conditioner.

**Bullet highlights:**
- Water-cooled misting for instant relief
- USB powered — works with power banks & laptops
- Multi-speed with 7-color LED night light
- Compact, quiet, and portable

---

### 3. Fridge Organizer Bins (Set of 4)
| Field | Value |
|-------|-------|
| slug | `fridge-organizer-bins-set` |
| category | `kitchen` |
| price (sell) | `99900` (₹999) |
| compareAt (MRP) | `179900` (₹1,799) |
| costPrice | `30000` (₹300) |
| stock | `999` |

**Description:**
Turn your messy fridge into a satisfyingly organized space. This set of 4 clear, stackable bins with cut-out handles makes it easy to store fruits, veggies, drinks, and leftovers — and pull them out in one motion. Durable, BPA-free, and easy to wash. Also great for pantry shelves, bathroom cabinets, and desk drawers.

**Bullet highlights:**
- Set of 4 stackable, clear bins
- Easy-grip handles, pull out in one motion
- BPA-free, washable, food-safe
- Works in fridge, pantry, bathroom & more

---

### 4. Sensory Squeeze Stress Toy
| Field | Value |
|-------|-------|
| slug | `sensory-squeeze-toy` |
| category | `toys` |
| price (sell) | `44900` (₹449) |
| compareAt (MRP) | `99900` (₹999) |
| costPrice | `15000` (₹150) |
| stock | `999` |

**Description:**
The oddly satisfying squeeze everyone's talking about. This super-soft sensory toy squishes, stretches, and slowly returns to shape — perfect for stress relief, focus, and fidgeting during study or gaming. A great desk companion and a fun gift. Colors may vary.

**Bullet highlights:**
- Ultra-satisfying slow-rise squish
- Great for stress relief & focus
- Soft, durable, and travel-sized
- Fun gift for all ages (color may vary)

> ⚠️ **Trademark note:** Do NOT use the brand name "NeeDoh" (or any brand name) in the title, description, ads, or metadata. Market it generically as a "Sensory Squeeze Toy" / "Stress Relief Squish".

---

## Bundle (optional upsell product)

### Summer Cooling Combo (Neck Fan + Mini Cooler)
| Field | Value |
|-------|-------|
| slug | `summer-cooling-combo` |
| category | `cooling` |
| price (sell) | `139900` (₹1,399) |
| compareAt (MRP) | `329800` (₹3,298) |
| costPrice | `56500` (₹565) |
| stock | `999` |

**Description:**
The ultimate personal cooling kit — get the Portable Neck Fan AND the Mini USB Air Cooler together and save big. Stay cool at your desk and on the move. Perfect gift for the summer.

---

## Coupons

| code | type | value | source | notes |
|------|------|-------|--------|-------|
| `MLBB10` | `percent` | `10` | `influencer:mlbb_friend` | 10% off — for the gaming influencer partner. Track uses + revenue for commission. |
| `WELCOME50` | `flat` | `5000` | `site:welcome` | ₹50 off first order (paise value `5000`). Optional. |
| `PREPAID5` | `percent` | `5` | `site:prepaid_nudge` | 5% off to nudge customers toward prepaid over COD. Optional. |

---

## JSON (drop-in for a Prisma seed script)

```json
{
  "products": [
    {
      "slug": "portable-neck-fan",
      "title": "Portable Rechargeable Neck Fan",
      "category": "cooling",
      "price": 54900,
      "compareAt": 129900,
      "costPrice": 16500,
      "stock": 999,
      "images": ["https://REPLACE_WITH_CLOUDINARY_URL/neck-fan-1.jpg"],
      "description": "Beat the heat hands-free. This lightweight, bladeless neck fan wraps comfortably around your neck and keeps cool air flowing for up to 4 hours on a single USB charge. Three adjustable speeds, whisper-quiet motor, and a flexible design that fits everyone. Rechargeable via any USB port.",
      "active": true
    },
    {
      "slug": "mini-usb-air-cooler",
      "title": "Mini USB Personal Air Cooler",
      "category": "cooling",
      "price": 109900,
      "compareAt": 199900,
      "costPrice": 40000,
      "stock": 999,
      "images": ["https://REPLACE_WITH_CLOUDINARY_URL/mini-cooler-1.jpg"],
      "description": "Your personal cooling zone, anywhere. Fill the water tank, plug it in, and enjoy cool, misted air at your desk or bedside. USB powered, multiple fan speeds, soft LED night light. A personal evaporative cooler for close-range cooling (not an AC replacement).",
      "active": true
    },
    {
      "slug": "fridge-organizer-bins-set",
      "title": "Fridge Organizer Bins (Set of 4)",
      "category": "kitchen",
      "price": 99900,
      "compareAt": 179900,
      "costPrice": 30000,
      "stock": 999,
      "images": ["https://REPLACE_WITH_CLOUDINARY_URL/fridge-bins-1.jpg"],
      "description": "Turn your messy fridge into a satisfyingly organized space. Set of 4 clear, stackable bins with cut-out handles for fruits, veggies, drinks, and leftovers. BPA-free, washable, food-safe. Great for pantry, bathroom, and drawers too.",
      "active": true
    },
    {
      "slug": "sensory-squeeze-toy",
      "title": "Sensory Squeeze Stress Toy",
      "category": "toys",
      "price": 44900,
      "compareAt": 99900,
      "costPrice": 15000,
      "stock": 999,
      "images": ["https://REPLACE_WITH_CLOUDINARY_URL/squeeze-toy-1.jpg"],
      "description": "The oddly satisfying squeeze everyone's talking about. Super-soft sensory toy that squishes, stretches, and slowly returns to shape. Great for stress relief, focus, and fidgeting. Colors may vary.",
      "active": true
    },
    {
      "slug": "summer-cooling-combo",
      "title": "Summer Cooling Combo (Neck Fan + Mini Cooler)",
      "category": "cooling",
      "price": 139900,
      "compareAt": 329800,
      "costPrice": 56500,
      "stock": 999,
      "images": ["https://REPLACE_WITH_CLOUDINARY_URL/combo-1.jpg"],
      "description": "The ultimate personal cooling kit - Portable Neck Fan AND Mini USB Air Cooler together, at a bundle price. Stay cool at your desk and on the move.",
      "active": true
    }
  ],
  "coupons": [
    { "code": "MLBB10", "type": "percent", "value": 10, "source": "influencer:mlbb_friend", "active": true },
    { "code": "WELCOME50", "type": "flat", "value": 5000, "source": "site:welcome", "active": true },
    { "code": "PREPAID5", "type": "percent", "value": 5, "source": "site:prepaid_nudge", "active": true }
  ]
}
```

---

### Notes on pricing (your margins)
| Product | Sell | Cost | Approx shipping | Gross profit/order |
|---------|------|------|-----------------|--------------------|
| Neck Fan | ₹549 | ₹165 | ₹70 | ~₹314 |
| Mini Cooler | ₹1,099 | ₹400 | ₹80 | ~₹619 |
| Fridge Bins | ₹999 | ₹300 | ₹80 | ~₹619 |
| Squeeze Toy | ₹449 | ₹150 | ₹60 | ~₹239 |
| Cooling Combo | ₹1,399 | ₹565 | ₹90 | ~₹744 |

> These are starting numbers based on our earlier research. Confirm actual supplier cost + shipping once your IndiaMART/Baapstore suppliers reply, then adjust. Remember to factor in ad cost per order (~₹50–₹150) and Razorpay's ~2% fee on prepaid.
