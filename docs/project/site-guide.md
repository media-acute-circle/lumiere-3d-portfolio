# Lumière Concept Site — Technical Guide

**Status**: Current as of 2026-10-12. Describes the static concept site
(`index.html`, `styles.css`, `app.js`). Scope comes from
`../../reference-doc.md`; this file covers only *how* the site is built.

---

## 1. Architecture

| File | Role |
|---|---|
| `index.html` | Access screen at the root URL (§7) |
| `gate.css`, `gate.js` | Access screen styles; password check, attempt limit, modal and 3D backdrop |
| `portfolio.html` | The portfolio. One `<section>` per feature, each with an `id` for in-page navigation and an `aria-labelledby` heading. An inline guard at the top of `<head>` redirects locked sessions to `index.html` |
| `styles.css` | Whole design system in 20 numbered sections (see the index comment at the top of the file) |
| `app.js` | One IIFE. Sample data, SVG product renders, and every interaction except the hero |
| `hero3d.js` | The WebGL hero (§3.1). Loaded after Three.js r128 from cdnjs, pinned with an SRI hash |

- **No build step and no framework.** External requests: Google Fonts
  (eight families, three per design direction plus the dashboard's Inter)
  and Three.js r128 from cdnjs.
- **Product art is generated SVG** (`lampSVG()` and `roomSVG()` in
  `app.js`), so the page has no image files and every finish recolours
  instantly.
- **`html.js`** is set by an inline script in `<head>`. Anything hidden for
  animation is scoped to `.js`, so the page stays readable without JS.

---

## 2. Design system

### 2.1 Design directions

The `<body data-theme>` attribute selects the direction. `setTheme()` in
`app.js` changes it, stores it in `localStorage` (`pl-theme`), updates
`<meta name="theme-color">` and re-renders the SVG.

| Direction | `data-theme` | Display / body fonts | Accent | Radius |
|---|---|---|---|---|
| 01 Warm Atelier | `atelier` (default) | Cormorant Garamond / Karla | `#7E5F32` | Cards 16 px, buttons pill |
| 02 Dark Gallery | `gallery` | Bodoni Moda / Manrope | `#D9C7A3` | Cards 4 px, buttons 2 px, uppercase tracked labels |
| 03 Studio Light | `studio` | Space Grotesk / IBM Plex Sans | `#3B6E8F` | Cards 10 px, buttons 8 px |

Shape is a deliberate part of each direction, not a global constant. Use
`--radius`, `--radius-lg`, `--r-inner` and `--btn-radius`; never hard-code a
radius outside the dashboard.

Two areas carry their own fixed tokens, so they look the same in every
direction: **`.admin`** (neutral product UI, Inter) and **`.closing`**
(always dark).

### 2.2 Tokens (`styles.css` §01)

| Group | Tokens |
|---|---|
| Colour | `--bg --surface --fg --muted --line --accent --accent-ink --danger --glow` |
| Type size | `--fs-xs` 12 · `--fs-sm` 14 · `--fs-base` 16 · `--fs-md` 18 · `--fs-lg` 20 · `--fs-xl` 24 px |
| Line height | `--lh-tight` 1.08 · `--lh-snug` 1.25 · `--lh-ui` 1.4 · `--lh-body` 1.65 |
| Spacing | `--s1…--s9` = 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 / 96 px |
| Layout | `--gutter` (16–32 px fluid) · `--card-pad` (20–32 px) · `--section-y` (72–136 px) · `--nav-h` |
| Shape and depth | `--radius --radius-lg --r-inner --btn-radius --shadow-md --shadow-lg` |
| Motion | `--ease` = `cubic-bezier(.2, .8, .2, 1)` |

**Contrast** (computed 2026-10-12): body, muted and accent text measure at
least 5.0:1 against `--bg` and `--surface` in all three directions and the
dashboard.

### 2.3 Type hierarchy

| Class | Use | Size |
|---|---|---|
| `.hero-title` | Hero headline, sized per direction so it stays at three lines | 38–76 px fluid |
| `.h-display` | Closing headline | 44–116 px fluid |
| `.h-2` | Section headings | 32–60 px fluid |
| `.h-3` | Card and sub-section headings | 24 px |
| `.lead` | Section intro paragraph, max 52ch | 16–18 px, line-height 1.7 |
| `.eyebrow` | Section label: `<span class="idx">02</span>Collections` renders as *02 / COLLECTIONS* | 12 px mono, uppercase, 0.08em tracking |
| `.mono` | Codes, labels, metadata | 14 px IBM Plex Mono |

### 2.4 Breakpoints (`styles.css` §19)

| Max width | Changes |
|---|---|
| 1180 px | Hero product panel goes compact (spec row hidden) so it never covers the pendant |
| 1080 px | Nav collapses into the *Menu* panel |
| 960 px | Dashboard sidebar becomes a scrolling tab strip; KPIs in 2 columns; ring scaled to 0.85 |
| 860 px | Hero stacks: copy, 3D stage, panel, facts; splits and timeline stack; collections use a 6-column span |
| 600 px | Mobile type scale; full-width buttons; ring at 0.62; showroom at 4:5; short dock labels |
| 380 px | Specs in 1 column; ring at 0.54 |

---

## 3. Sections and interactions

| Section | `id` | Interaction (`app.js`) |
|---|---|---|
| Hero | `home` | WebGL pendant (§3.1) |
| Collections | `collections` | Hover zoom on the art (CSS only) |
| 3D ring | `range` | `ringLoop()` auto-turns; drag with momentum; <kbd>←</kbd>/<kbd>→</kbd> adds a velocity impulse (~60° per press) |
| Product / 360° | `view360` | Drag to rotate; wheel, buttons or <kbd>+</kbd>/<kbd>−</kbd> to zoom (1–2.6×); <kbd>←</kbd>/<kbd>→</kbd> rotate 15°; <kbd>0</kbd>, <kbd>Home</kbd> or double-click to reset; finish swatches; WAI-ARIA tabs |
| Showroom | `showroom` | Range input drives the `--dark` veil opacity |
| Gaps | `why` | Static |
| Quote | `quote` | Three steps; per-step validation with `aria-invalid` and inline messages; live step label; focus moves to the first field of each step, then to "Thank you" |
| Dashboard | `admin-intro` | View switcher, price uplift, live/draft toggles, editor preview, drag-and-drop photo, leads kanban, page toggles. All in memory; nothing persists |
| Phases | `phases` | Progress bars animate in view |
| Launch plan | `plan` | Static |

### 3.1 The 3D hero (`hero3d.js`)

- **Scene.** A lathe-built shade with radial fluting, a seam at 0° and a
  maker's plate at 180°, so a 360° turn is legible on a symmetric object. PBR
  materials are lit by a procedural softbox environment (PMREM), plus a key
  light that casts a soft shadow, a warm point light inside the shade, and a
  light pool on the floor. Dark Gallery adds a volumetric cone and drifting
  dust.
- **Controls.** Drag (horizontal only, so vertical page scroll still works on
  touch), <kbd>←</kbd>/<kbd>→</kbd>, previous/next model (the pendant lifts
  out of frame and is lowered back in), four finishes (colours ease between
  values), and a light switch and dimmer that also drive the CSS `--lit` bloom.
- **Per direction.** `THEMES` sets exposure, key light, shadow strength, pool
  colour and blending, cone and dust. A `MutationObserver` on
  `body[data-theme]` applies them live.
- **Cost control.** Pixel ratio capped at 2. The loop runs only while the
  stage is on screen and the tab is visible. Reduced motion stops auto-spin,
  sway and drift.
- **Fallback.** If Three.js or WebGL is unavailable, `.is-fallback` shows an
  inline SVG and every control still updates the text.

**Global chrome:** scroll progress bar; the header goes glassy after 24 px;
scrollspy sets `aria-current` on the nav link for the section in view; the
mobile menu closes on <kbd>Esc</kbd>, an outside click or choosing a link;
the custom cursor and magnetic buttons run on fine pointers only.

> **The 3D ring and 360° viewer logic is intentionally unchanged** from the
> original build. The visual upscale is CSS only (edge fade, floor
> reflection, card lighting, turntable, vignette, glass controls). Keyboard
> handlers are additive.

---

## 4. Accessibility checklist

- The hero stage is focusable with an `aria-label` that names the model and
  finish; the rotation dial is decorative; finish and light controls are
  native buttons, a switch and a range.
- Skip link to `#main`; `header`, `nav`, `main` and `footer` landmarks;
  every section is labelled by its heading.
- Every interactive control is a native `button`, `a`, `input` or `select`,
  or has `tabindex="0"` with a key handler (ring, viewer, drop zone).
- Tabs follow the WAI-ARIA pattern: `role="tab"` and `tabpanel`,
  `aria-controls`, a roving `tabindex`, and arrow, Home and End keys.
- Live regions: the finish name, the quote step label, the form
  confirmation and the toast.
- Decorative SVG, glow layers and the marquee are `aria-hidden`.
- `prefers-reduced-motion` turns off all animation and shows content
  immediately.
- The touch layout hides keyboard hints (`@media (hover: none)`).

**Not yet done:** a test with VoiceOver or NVDA. Treat the ARIA as
spec-correct but unverified with real assistive technology.

---

## 5. Customising

| Change | Where |
|---|---|
| Add or edit a product | `PRODUCTS` in `app.js`. The ring shows the first six |
| Add a finish | `FINISH` in `app.js` and a `.swatch` button in `index.html` |
| Add a direction | A `body[data-theme="x"]` token block (`styles.css` §01), entries in `NAMES` and `THEME_COLOR` (`app.js`), and a dock button |
| Real product photos | Replace the `lampSVG()` output in `renderViewer()` and `renderRing()` with `<img>` frames |
| Real 3D models | Load a glTF into the hero rig in place of `buildShade()` (needs `GLTFLoader`). Proposal §6 limits 3D to products that have models |
| Hero models | `MODELS` (copy) and `PROFILES` (lathe points `[radius, y]`) in `hero3d.js` |
| Form backend | Replace the `submit` handler in `app.js` with a `fetch()` to the dashboard API |
| Brand WhatsApp number | The `wa.me` link in `#quote` (currently Acute Circle's number as a placeholder) |

---

## 6. Access screen (`index.html`)

**Status**: Built 2026-10-12. **It is a client-side gate, not access control.**
It keeps casual visitors and link-sharers out of the preview. Anyone who
reads `portfolio.html`'s source or disables JavaScript can still see the page.
Real protection needs a server: Cloudflare Access, Netlify or Vercel password
protection, or HTTP basic auth on the host. Use one of those for anything
confidential.

| Item | Behaviour |
|---|---|
| Password check | `gate.js` hashes the input with SHA-256 (pure JS, so it works on `file://`) and compares it with `ACCESS_HASH`. The plain password never ships in the code |
| Session | On success the hash is stored in `sessionStorage['lumiere-access']` (with a `window.name` fallback for storage-blocked browsers), then the page goes to `portfolio.html`. Closing the tab locks it again |
| Guards | `index.html` skips straight to the portfolio if the session is already unlocked; `portfolio.html` sends locked sessions to `index.html`. Both are inline scripts at the top of `<head>`, so there is no flash of content |
| Errors | Empty input and wrong passwords show an inline message (`role="alert"`), a shake, `aria-invalid`, and the attempts left |
| Attempt limit | `MAX_ATTEMPTS = 3`, counted per session. The 3rd wrong attempt opens the support modal (focus-trapped, <kbd>Esc</kbd> closes); later wrong attempts open it again |
| Support CTA | `wa.me/918791694160` with a pre-filled message asking for the authorization password, on the card and in the modal |
| 3D backdrop | Three.js r128: a 360-node neural sphere (teal to violet), three orbit rings with satellites echoing the emblem, a starfield, and pointer parallax. It pulses rose on an error and surges teal on success; it pauses when the tab is hidden; reduced motion renders a single frame; there is a CSS fallback without WebGL |
| Brand | Colours and type from acutecircle.com (read 2026-10-12): `#080C10` / `#0F1822`, teal `#00D4B8`, violet `#7C3AED`, slate `#94A3B8`, Inter. The emblem is cut from `reference/AcuteCircle Updated Logo.png` with a feathered circular mask |

**Changing the password.** Compute the new hash
(`python3 -c "import hashlib;print(hashlib.sha256(b'NEW').hexdigest())"`)
and replace the old hash in three places: `ACCESS_HASH` in `gate.js`, the
inline guard in `index.html`, and the inline guard in `portfolio.html`. Also
`tools/og/render.mjs` if you regenerate share images.

> ⚠️ An unsalted SHA-256 of a short password can be brute-forced offline in
> minutes if someone wants to. That is acceptable for a preview gate only.

---

## 7. Sharing, SEO and answer-engine metadata

| Page | Title | Share image |
|---|---|---|
| `index.html` | Lumière 3D Portfolio · Private Preview by Acute Circle | `assets/og/og-access.jpg`: Acute Circle brand, *Private preview* pill, pendant, feature pills |
| `portfolio.html` | Lumière · Premium Lighting 3D Portfolio by Acute Circle | `assets/og/og-portfolio.jpg`: Dark Gallery, the live WebGL pendant, feature pills |

- **Both pages carry:** a description of ≤ 160 characters, keywords,
  author/publisher, robots with `max-image-preview:large`, a canonical URL,
  `og:*` (type, site_name, locale, url, title, description, image +
  secure_url/type/width/height/alt), and `twitter:*` (summary_large_image,
  with image alt).
- **JSON-LD.** `Organization` (Acute Circle), `WebSite`, `WebPage`. The
  portfolio is also a `CreativeWork` with `isAccessibleForFree: false` and a
  `.gated` `cssSelector`, which is Google's documented markup for gated
  content.
- **Share images** are 1200×630 JPEG at about 64 KB, under WhatsApp's
  ~300 KB preview limit. They are produced by `tools/og/render.mjs` from the
  HTML templates in `tools/og/`. The pendant is a live capture of the WebGL
  hero.
- **Absolute URLs** use `https://media-acute-circle.github.io/lumiere-3d-portfolio/`
  (assumed GitHub Pages; **not yet confirmed**). Crawlers ignore relative
  `og:image` values, so swap the base when the domain is final (see README →
  *Deploying and sharing*).
- **Indexing.** Both pages are `index, follow` because SEO was requested.
  For a confidential client preview, switch both to `noindex, nofollow` and
  drop `sitemap.xml`.

---

## 8. Testing

No test suite is committed. On 2026-10-12 we checked the site with a
throwaway Playwright script in headless Chrome. The script was not kept;
the results are in `../progress/PROGRESS.md`. Re-run before a client
review:

Tests on `portfolio.html` must pre-set the session
(`sessionStorage['lumiere-access'] = <hash>` via `addInitScript`), or the
guard redirects them to the gate.

1. `document.documentElement.scrollWidth === clientWidth` at 320, 375, 414,
   768, 1024, 1280, 1440 and 1920 px, in all three directions.
2. Every `.btn` renders on one line (height ≤ 56 px, no inner overflow).
3. No console errors.
4. Hero: model, finish, light switch, arrow keys and drag all change the view.
5. Keyboard: tab through the whole page; use the ring, viewer and tabs with
   the arrow keys.
6. All three directions at mobile and desktop widths.
7. Gate: direct `portfolio.html` → `index.html`; eye toggle; empty and
   wrong messages; the modal on the 3rd wrong attempt; <kbd>Esc</kbd> closes
   it; the correct password → `portfolio.html`; revisiting the gate in the
   same session skips it.
