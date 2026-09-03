# Purelane — Build notes

## Sections shipped

Five production sections, all merchant-editable from the theme editor, all reordering-safe:

1. **Purelane — Hero** — 2-col grid; 3-line headline with accent word; two CTAs; up to 3 badge blocks; hero product with LCP-optimised responsive image; price tag panel.
2. **Purelane — Shop grid** — collection-bound; renders `pl-product-card` snippet for each product; handles sold-out, no-image, long-title edge cases.
3. **Purelane — Combos rail** — metaobject-driven (`combo` type); horizontal snap-scroller; sums product prices for MRP and computes savings against the stored combo price at render time.
4. **Purelane — Bundles** — 3–4 tier blocks with per-tier product previews, qty, price, benefits list, and a "highlight" boolean that swaps the styling.
5. **Purelane — Reviews rail** — metaobject-driven (`review` type); infinite marquee; hover / focus / `prefers-reduced-motion` all pause or convert to a native scroller.

## Data model created

**Product metafields (namespace `custom`):**
- `badge` — Single line text ("Best seller", "Top rated", "New")
- `rating` — Decimal
- `review_count` — Integer
- `short_promise` — Single line text (used inside combo tiles)

**Metaobject: `review`** — title, body, author, product ref, rating (integer 1–5).

**Metaobject: `combo`** — title, subtitle, products (list of product refs), price (integer rupees), flag_label, save_label, is_highlight (bool), cta_url (single line text). Note: `price` field's Liquid key is `prices` (from an earlier rename — Shopify keeps the original key when you rename the display name).

## What I'd flag about the original file (`purelane-homepage.html`)

- **Two full palettes stacked.** V1 (dark purple) and V2 (light) both live in the file; V2 overrides V1 at parse order, so V1 is dead code. I built off V2 and dropped V1 from the production tokens.
- **Product artwork was CSS `background-image` on custom properties** (`--p-kitchen`, `--p-tap`, etc.). In the shop grid, cards 1–4 used those and cards 5–8 used raw inline `<svg>` for the same visual. Both are unshippable — a marketer can't change either. Replaced with `product.featured_media | image_tag`.
- **18 non-standardised media queries.** Consolidated to a 3-tier system in the new CSS (`640`, `900`, `960`).
- **Scroll effects wired at the page level.** `#scenes` cross-fades based on `data-scene` on each section; if a merchant reordered sections, animations broke. Dropped the global scene crossfade entirely.
- **Reviews rail marquee** assumed exact content duplication for a seamless loop but only ran one copy. Now render the metaobject list twice with `aria-hidden` on the clone.
- **No `<img>` tags anywhere** in the original — no `alt`, `loading`, `srcset`. All replaced with Shopify's `image_url` / `image_tag` filters.
- **Global JS handlers** for hero carousel, product rotator, water parallax, reveal-on-scroll — none of it survives being dropped into an editable Shopify theme.

## What I changed and why

| # | Change | Why |
|---|---|---|
| 1 | Introduced `purelane-tokens.css` with a single palette | Kill V1/V2 duplication; give every section one source of truth |
| 2 | Built a reusable `pl-product-card` snippet | Shop / Combos / Bundles share a card language — one snippet, three variants |
| 3 | Used `<img>` with `image_url` + `srcset` + `loading="lazy"` (with `fetchpriority="high"` on the hero image) | LCP + Core Web Vitals |
| 4 | Made stars a labelled span (`aria-label="Rated 4.8 out of 5"`) not literal `★` in text | Screen readers were speaking "black star black star…" |
| 5 | Kept marquee CSS but added `prefers-reduced-motion` fallback to native `overflow-x: auto` with scroll-snap | Motion accessibility |
| 6 | Dropped global scene crossfade; scoped atmosphere per-section | Theme-editor safety when merchant reorders sections |
| 7 | Consolidated breakpoints (18 → 3 tiers) | Predictable responsive behaviour |
| 8 | Metaobjects for reviews + combos | Content lives with content, not in Liquid — the actual "merchant-editable" bar |

## What I'd do with more time (priority order)

1. **Hero carousel** — 3 slides (1 / 2 / 3 bottles) as section blocks with dot navigation, autoplay, `prefers-reduced-motion` aware.
2. **Water / bubble atmosphere as an opt-in section** a merchant can drop between others.
3. **Real bundle discount at checkout via a Shopify Function** (`cart_transform`) so the flat-price promise holds at cart, not just at display.
4. **Trim CSS per section into `{% stylesheet %}` blocks** instead of separate asset files — reduces requests.
5. **Move review aggregate stats (4.8 / 12 lakh+) to computed** from metaobjects instead of section settings.
6. **Fix product images.** The 8 seeded products don't all carry photography yet — I built for the "no image" case, but merchants would upload real bottles.
7. **Currency formatting** — Shopify defaults to `Rs. 200.00` for INR; brand format is `₹200`. Change in Settings → General → Store defaults → Currency formatting.

## Gaps / honesty

- Currency displays as `Rs. 200.00` not `₹200`. Cosmetic; easy fix in store settings.
- Hero is v1 (static). No carousel, no mouse parallax, no water animation. All flagged above as v2.
- Combo prices assume all products are ₹200 each. If a merchant adds a product with a different price, the MRP sum stays correct but the "save" copy on the metaobject entry needs a manual update — or a Shopify Function to enforce it.
- AJAX add-to-cart on Shop cards uses a lightweight `fetch('/cart/add.js')`. It fires the correct event but does not open Dawn's cart drawer — reviewers can verify the item is in cart at `/cart`.
