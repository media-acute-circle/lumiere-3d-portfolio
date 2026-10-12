<div align="center">

# Lumière · Premium Lighting Concept

**A 3D product showcase and quote-led catalogue for a premium lighting brand.**
WebGL 3D hero · interactive 3D ring · 360° product viewer · light-level showroom · admin dashboard demo

![HTML](https://img.shields.io/badge/HTML5-static-E34F26?logo=html5&logoColor=white)
![CSS](https://img.shields.io/badge/CSS3-no%20framework-1572B6?logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-vanilla-F7DF1E?logo=javascript&logoColor=black)
![Three.js](https://img.shields.io/badge/Three.js-r128-000000?logo=threedotjs&logoColor=white)
![Build](https://img.shields.io/badge/build-none%20required-2B2823)
![Status](https://img.shields.io/badge/status-concept%20mockup-8A6A3B)

</div>

---

## Overview

Lumière is a **concept website** that Acute Circle built to pitch a premium
lighting brand ahead of its store opening on **20 October 2026**. It shows
what a product page can do when it answers buyers the way a salesperson
would: real finishes in 360°, full specifications, a light-on preview, and
a three-step quote form that says when the buyer will hear back.

The page also includes a working **admin dashboard demo**, so the client can
try the tools their team will use every day.

> **Concept, not production.** Products, prices and stats are sample data.
> Anything marked with `*` on the page is an assumption we will confirm with
> the client. The full proposal is in [`reference-doc.md`](reference-doc.md).

## Highlights

| Feature | What it does |
|---|---|
| **Immersive 3D hero** | A physically lit WebGL pendant. Drag or use the arrow keys to turn it through 360°, switch between three models, change the finish, and dim the light. A rotation dial tracks the angle |
| **Three design directions** | *Warm Atelier*, *Dark Gallery* and *Studio Light*, switchable live from the bottom dock and remembered between visits. Each has its own type, colour and shape language, and the 3D lighting adapts to each |
| **Interactive 3D ring** | A CSS 3D carousel of the range. Drag, swipe or use the arrow keys; it turns on its own when idle |
| **360° product viewer** | Turn the product, zoom with the buttons, wheel or `+`/`−`, and change the finish |
| **Light-level showroom** | Slide a room from dark to fully lit |
| **Three-step quote form** | Inline validation, a live step indicator and a reference number when sent |
| **Admin dashboard demo** | KPIs, a product table with bulk price uplift, an editor with live preview and photo upload, a leads kanban and page visibility toggles |
| **Access screen** | Acute Circle-branded password gate with a WebGL neural sphere and orbit rings. Includes a show/hide password toggle, inline errors, a support modal after 3 wrong attempts, and a WhatsApp CTA with a pre-filled message |
| **Share-ready** | Open Graph and X (Twitter) cards with pre-rendered images, canonical URLs, JSON-LD (Organization, WebSite, WebPage, CreativeWork), robots.txt and sitemap.xml |
| **Proposal content** | Reference-site gaps, delivery phases, the launch plan to 20 October, and what we need from the client |

## Quality bar

- **Responsive from 320 px to 4K**, with no horizontal scroll at any width
  (verified at 320, 375, 414, 768, 1024, 1280, 1440 and 1920 px, in all
  three directions).
- **Accessible**: skip link, landmarks, keyboard support for the 3D ring,
  360° viewer and tabs, a roving tabindex on the tabs, `aria-invalid` and
  error messages on the form, live regions, visible focus rings, and
  WCAG AA contrast (≥ 5:1) for body, muted and accent text in every theme.
- **Smooth navigation**: smooth scrolling with offsets for the fixed header,
  a scroll progress bar, active-section highlighting in the nav, and a
  mobile menu that closes on <kbd>Esc</kbd> or an outside click.
- **Respects user settings**: `prefers-reduced-motion` turns off animation,
  and the custom cursor only appears on fine-pointer devices.
- **No build step, no framework.** The only runtime dependency is Three.js
  r128 from cdnjs, pinned with an SRI hash. If WebGL is unavailable, the
  hero falls back to a static illustration.
- **No wrapped buttons**: every button is checked to stay on one line, in
  all three directions, at every tested width.

## Quick start

```bash
git clone <repo-url> lumiere-3d-portfolio
cd lumiere-3d-portfolio

# Any static server works. For example:
python3 -m http.server 8080
# then open http://localhost:8080
```

You can also open `index.html` directly in a browser.

> **Private preview.** The root URL opens an Acute Circle access screen. The
> password is shared privately by Acute Circle and is not stored anywhere in
> this repo. Visitors who are stuck can request it on WhatsApp from the access
> screen.

## Project structure

```text
lumiere-3d-portfolio/
├── index.html          # Access screen (root URL): Acute Circle branding, password gate, 3D backdrop
├── gate.css / gate.js  # Access screen styles; password check, attempt limit, support modal, 3D scene
├── portfolio.html      # The portfolio, one section per feature (redirects to the gate if locked)
├── styles.css          # Design system: tokens, themes, components, responsive
├── app.js              # Interactions: themes, 3D ring, 360 viewer, form, dashboard
├── hero3d.js           # WebGL hero: pendant models, finishes, dimmer, 360° rotation
├── assets/
│   ├── brand/          # Acute Circle emblem (cut from reference/, WebP + PNG)
│   ├── icons/          # Favicon and touch icon
│   └── og/             # Pre-rendered 1200×630 share images (JPEG, ~64 KB)
├── tools/og/           # OG image templates and render script (Playwright)
├── robots.txt, sitemap.xml
├── reference/          # Source logo from Acute Circle
├── reference-doc.md    # Client proposal (source of truth for scope)
├── README.md           # You are here
└── docs/
    ├── README.md               # Documentation index
    ├── project/site-guide.md   # Technical guide: architecture, tokens, a11y, customising
    └── progress/
        ├── PROGRESS.md         # Status and session log
        └── CHALLENGES.md       # Problems hit, with root cause and fix
```

## Page map

| # | Section | Anchor | Purpose |
|---|---|---|---|
| 1 | Hero | `#home` | Brand promise, WebGL 3D pendant with model, finish and light controls |
| — | Collections index | — | Quick links to the five categories |
| 2 | Collections | `#collections` | Product families with drawn artwork |
| 3 | Interactive 3D | `#range` | Rotating ring of the range |
| 4 | Product page | `#view360` | 360° viewer, finishes, specs tabs, quote CTA |
| 5 | Showroom | `#showroom` | Dark-to-lit room preview |
| 6 | What other sites miss | `#why` | Eight gaps from the reference review |
| 7 | Request a quote | `#quote` | Three-step enquiry form |
| 8 | Trust | — | Stats, client note, store visit |
| 9 | Admin dashboard | `#admin-intro` | Interactive dashboard demo |
| 10 | Delivery phases | `#phases` | MVP, post-MVP, later phases |
| 11 | Launch plan | `#plan` | Day-by-day plan to 20 October, client checklist |
| 12 | Closing | — | Choose a direction, contact details |

## Customising

| Want to change… | Edit |
|---|---|
| Colours or fonts of a direction | Theme tokens at the top of `styles.css` (§01) |
| Spacing or type scale | `--s1…--s9` and `--fs-*` tokens in `styles.css` (§01) |
| Products in the ring, table and viewer | The `PRODUCTS` array in `app.js` |
| Hero models, finishes and per-direction lighting | `MODELS`, `FINISHES` and `THEMES` in `hero3d.js` |
| Finishes and swatches | `FINISH` in `app.js`, plus the swatch buttons in `index.html` |
| Copy and sections | `index.html` |

See [`docs/project/site-guide.md`](docs/project/site-guide.md) for the full
guide.

## Deploying and sharing

Every share URL is absolute and points at
`https://media-acute-circle.github.io/lumiere-3d-portfolio/`, which assumes
GitHub Pages on this repo. If the site goes live on another domain, replace
that string across `index.html`, `portfolio.html`, `robots.txt` and
`sitemap.xml`:

```bash
grep -rl "media-acute-circle.github.io/lumiere-3d-portfolio" --include="*.html" --include="*.txt" --include="*.xml" . \
  | xargs sed -i '' "s#https://media-acute-circle.github.io/lumiere-3d-portfolio/#https://YOUR-DOMAIN/#g"
```

After deploying, refresh the preview caches:
[Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/) (also used by WhatsApp and Instagram),
and [LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/).
X has no public card validator; paste the link into a draft post to preview
it.

To regenerate the share images after a design change:

```bash
npm i -D playwright && npx playwright install chromium
node tools/og/render.mjs
```

## Browser support

The latest two versions of Chrome, Edge, Safari (macOS and iOS) and
Firefox. The page relies on WebGL, `color-mix()`, CSS `scale`,
`overflow: clip`, `mask-composite` and `backdrop-filter`, all supported in
those browsers.

## Credits

Designed and built by **[Acute Circle](https://acutecircle.com)**, *Built
by Builders, For Builders*.
Proposal by Harshit Joshi, Techno-Functional and Solution Consultant.
[info.acutecircle@gmail.com](mailto:info.acutecircle@gmail.com) ·
[+91 87916 94160](tel:+918791694160)
