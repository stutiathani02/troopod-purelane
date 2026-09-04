# Purelane — Build notes

## Sections shipped

Five production sections, all merchant-editable from the theme editor, all reordering-safe:

1. **Purelane — Hero** — 2-col grid; 3-line headline with accent word; two CTAs; up to 3 badge blocks. **3-slide product carousel** (1 → 2 → 3 bottles) with per-slide price tag; auto-advance, hover-pause, dot navigation with keyboard arrows, IntersectionObserver pauses when off-screen, `prefers-reduced-motion` stays on slide 1. Animated wave layers at hero base (loaded as static SVG assets for browser reliability).
2. **Purelane — Shop grid** — collection-bound; renders `pl-product-card` snippet for each product; two-pass render so badged products (Best seller / Top rated / New) show first; handles sold-out (disabled Add-to-cart, struck-through price), no-image (striped placeholder), long-title (2-line clamp with hover tooltip) edge cases; AJAX add-to-cart with per-button feedback state.
3. **Purelane — Combos rail** — metaobject-driven (`combo` type); horizontal snap-scroller; sums product prices for MRP and computes savings against the stored combo price at render time. Highlight variant with amber outline.
4. **Purelane — Bundles** — 3–4 tier blocks with per-tier product previews (up to 5), qty, price, benefits list, and a "highlight" boolean that swaps the styling.
5. **Purelane — Reviews rail** — metaobject-driven (`review` type); infinite marquee; hover / focus / `prefers-reduced-motion` all pause or convert to a native scroller.

## Bonus sections shipped

- **Purelane — Header** — rounded glass pill nav with brand mark, tagline, `link_list`-picked menu, search / account / cart icons (with live cart badge). Sticky, slides in on load, condenses on scroll. Hides Dawn's default header via `body:has(.pl-hdr)` selector.
- **Purelane — Ticker** — scrolling announcement marquee with block-based messages (highlight + text pairs), hover-pause, reduced-motion falls back to centred static line.
- **Purelane — Footer** — 4-column (brand + 3 configurable link columns), textarea-based items with `Label|/url` syntax for links or plain text, copyright + comma-separated legal links.
- **Purelane — Feature grid** — flexible N-block section covering three presets (Ingredients, Why bundles, Proof stats) with 2/3/4/5 column layouts, optional glass panel wrap, per-block accent-icon or stat-ring variant.
- **Purelane — Sticky CTA** — fixed-bottom pill for the flat-price bundle offer with animated entrance.
- **Global reveal-on-scroll** — sections fade + slide + unblur into view via `IntersectionObserver`; header gets `.pl-scrolled` class past 40px scroll; all short-circuited under `prefers-reduced-motion`.
- **8 custom brand-consistent product mockups** — SVGs generated from a Python template (`product-mockups/_generate.py`); tall purple bottle silhouette + coloured label band + descriptor lines + volume + cap style varying per product (spray / trigger / pump / sachet / angled). Uploaded to Shopify as product media.

## Palette + type system

- Two-family type: Outfit (display, 700/800) + Inter (body, 400/600/700), loaded from Google Fonts.
- Palette: lavender surfaces (`#f1ecfa`, `#e0d4f2`), mint accent bg (`#dff0dc`), aubergine ink (`#241a3d`, `#17102b`), lavender brand (`#6a52b3`, `#8a75c9`), amber accent (`#b8701c` — LASTS word, prices, ornament leaf, save chips), leaf green (`#4f8f3e` — check icons, badge pills), dark teal-green CTA (`#124f42`, `#1a6e5c` — primary buttons).
- Body background: 5-stop lavender → mint gradient with fixed attachment so no visible bands as you scroll.

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

- AJAX add-to-cart on Shop cards uses a lightweight `fetch('/cart/add.js')`. It fires the correct event and updates the header cart badge on next reload, but does not open Dawn's cart drawer — reviewers can verify the item is in cart at `/cart`.
- Combo "Save" copy is manually authored on each metaobject entry alongside the computed savings; a Shopify Function would enforce the discount at checkout.
- No mouse-parallax on hero (a small nicety from the prototype). All other hero motion (carousel + waves + product float) is in.
- Header's mobile menu (below 900px) currently toggles a class but doesn't render a drawer — the nav collapses, burger toggles `body.pl-menu-open` but no drawer template is included. Next iteration would ship a native `<dialog>` drawer.
