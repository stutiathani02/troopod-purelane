# AI workflow notes

## What I delegated

- **Liquid conversion of each hardcoded prototype section.** Fed the agent one prototype fragment plus the target contract (schema, metafields/metaobjects, edge cases: sold-out, no-image, long-title) and asked for a section file. Ran once per section.
- **Reusable card snippet design.** Prompt was: "these three sections all render similar cards — write one snippet with `variant_style` and defaults so the same file serves all three."
- **Breakpoint audit.** Handed the agent all 18 media queries from the prototype and asked for a 3-tier collapse (`640`, `900`, `960`) that preserved visible output at each width from 375 up.
- **Accessibility sweep.** Ran an axe-style checklist per section: SVG labels, focus-visible states, contrast on the amber accent, `prefers-reduced-motion` fallbacks, `aria-labelledby` on section landmarks.

## Where it broke

- **Shopify architecture decisions.** Metaobject vs section blocks for combos — the agent produced two plausible answers with no reason to pick one. I chose metaobjects because combo content is merchant-owned and reusable across pages; the agent's default (section blocks) would have locked combos to a single section instance and lost them when the section was removed.
- **Metaobject field access patterns.** The agent kept using `entry.field.value` for scalar types where the correct pattern for Integer / Boolean is `entry.field` directly. I only caught this after seeing `Rs. 0.00` in the preview and adding a debug probe — the agent's typed guess would have shipped broken savings math.
- **Field-key vs field-name drift.** When I renamed a metaobject field's display name from `prices` to `price`, Shopify kept the original key. The agent assumed key = display name and wrote `combo.price`; the correct access is `combo.prices`. Failed silently until I printed both to the DOM.
- **`for p in p1,p2,p3` shorthand.** The agent tried a comma-separated iteration syntax that isn't valid Shopify Liquid; the section registered but shipped without previews. Replaced with `for i in (1..5) { key = 'product_' | append: i }`.
- **`money` filter and currency units.** The agent mixed rupees (from metaobject Integer field) with paisa (from `product.price`), producing wrong totals. Fixed by converting rupees → paisa (`| times: 100`) so `| money` renders consistently.
- **Schema validation strictness.** Every setting needs a `label`; every `range` default must land on a step multiple. The agent shipped `label`-less settings on the first Reviews section and Shopify rejected the file silently on sync — visible only in the git integration log.

## What I'd systematise if I did twenty more of these

1. **A `PROMPTS/` folder** with one signed contract per operation: card conversion, breakpoint collapse, a11y sweep, metaobject wiring. Each contract lists the target file, the params it accepts, the edge cases it must handle, and one worked example.
2. **A `seed-store` script.** Shopify CLI + REST that idempotently stamps out the 8 products, the collection, all metafield definitions, both metaobject definitions with their fields, and the seed entries. Cuts hours off the "before we can start" phase.
3. **A `verify-sync` step.** After every git push, tail the Shopify GitHub integration log and fail fast on any red line. Would have caught the "label required" and the "step multiple" schema failures immediately instead of after the sync.
4. **Type-first metaobject access.** Any Liquid the agent generates that touches metaobject fields must inline a comment stating the field type and the correct accessor (`entry.field` for Integer/Boolean; `entry.field.value` for Product/Money; `entry.field.value` for lists returning an array).
5. **Visual diff harness.** Prototype in an iframe next to the live Shopify preview at 375 / 768 / 1180 side-by-side. Would have caught the currency mismatch and the missing product images before the human reviewer did.
6. **A one-shot metafield-key resolver.** Before writing Liquid, the agent fetches the actual field keys from Shopify's Admin API and pins them into the prompt. Kills the "display name changed, key didn't" bug class.
