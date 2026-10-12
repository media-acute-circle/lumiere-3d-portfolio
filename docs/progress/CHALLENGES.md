# Challenges Log

Real problems hit during development, with root causes, so nobody debugs
them twice, and known challenges ahead. Update whenever something bites.

## Solved (till 2026-10-12)

| # | Challenge | Root cause & fix |
|---|---|---|
| 1 | "Continue" buttons in the quote form rendered with no fill, leaving light text on a light card | The Tailwind Play CDN (`cdn.tailwindcss.com`) injected its Preflight reset. Its `[type='button'] { background-color: transparent }` has the same specificity as `.btn-solid` and loaded later, so it won. **Fix:** removed the CDN. The page uses no Tailwind utilities (verified by listing every class in `index.html`). |
| 2 | A 3px blue box-shadow outline around the 3D ring container | Tailwind generates a `.ring` utility, which collided with our `.ring` class on `#ring`. Same fix as #1. |
| 3 | Malformed document head: no `lang`, `charset=utf8`, `<title>` inside `<body>`, no meta description | Line 1 held injected boilerplate, including a `body { font: 14px …; background: #fff }` rule and safe-area padding on `:root` that duplicated `.nav`'s own. **Fix:** rewrote the `<head>` with `lang="en"`, meta description, `theme-color` (synced per direction in `app.js`) and an inline SVG favicon. |
| 4 | Content invisible when JS fails or loads slowly | `.reveal` set `opacity: 0` unconditionally. **Fix:** an inline script adds `html.js` and the hiding is scoped to `.js .reveal`. |
| 5 | The native caret disappeared in form fields on desktop | `body.has-cursor { cursor: none }` is inherited by inputs. **Fix:** restored `cursor: text` / `pointer` on fields, selects and ranges (`styles.css` §07). |
| 6 | Muted and eyebrow text failed WCAG AA in *Warm Atelier* | `#7A7166` and `#8A6A3B` on `#F4EFE6` measure about 4.2:1. **Fix:** darkened to `#665E53` and `#7E5F32`. Every theme's core text pairs now measure ≥ 5.0:1 (computed 2026-10-12). |
| 7 | Three stacked CSS passes ("v2", "review pass", "v4") redefined the same selectors, so the effective value of a rule was hard to predict | Rewrote `styles.css` as one ordered system with numbered sections. Checked visually in Warm Atelier (375, 1440 px), Dark Gallery (1440 px) and Studio Light (1280 px). |

| 8 | The hero 3D stage stopped at 560 px instead of filling the hero, leaving a hard horizontal edge on the light | `.hero-grid` uses `align-items: start`, so the stage took its `min-height` rather than its grid area. **Fix:** `align-self: stretch` on `.hero-stage`. |
| 9 | Light pool and studio grid ended on a hard vertical line where the stage met the copy column | The stage bleeds under the copy. **Fix:** feathered left and bottom edges with a composited `mask-image` (`mask-composite: intersect`). |
| 10 | Bodoni Moda and Space Grotesk set the hero headline in five lines, pushing the facts row under the dock | The faces are wider than Cormorant at the same size. **Fix:** per-direction `.hero-title` sizes, so all three hold at three lines at 1440 px. |
| 11 | "Atrium" overflowed the backdrop word area | The word size was fixed for four letters. **Fix:** `--fit = min(1, 4.4 / length)` scales it. |

| 12 | The first OG images were 435–565 KB PNGs | WhatsApp often drops previews over ~300 KB. **Fix:** render JPEG at quality 86, about 64 KB each. |
| 13 | Meta descriptions were 238 and 255 characters | Google truncates around 155–160. **Fix:** rewritten to 152 and 150. |
| 14 | `location.replace('./')` from `portfolio.html` opened a directory listing on `file://` | `./` only resolves to `index.html` on a web server. **Fix:** redirect to `index.html` explicitly. |
| 15 | Access screen dead: eye toggle, errors, modal and unlock all did nothing, and the password appeared in the URL (`?password=…`) | A doc-update script ran `open('gate.js','w').write(open('gate.js').read()…)`. The write handle truncates the file before the read runs, so `gate.js` became 0 bytes, and the browser fell back to a native GET submit. Reproduced 2026-10-12 in Chromium, WebKit and Firefox over HTTP and `file://`. **Fix:** restored `gate.js`. The form now has `onsubmit="return false;"`, so it can never leak the password into the URL; an inline check shows a message if `gate.js` fails to load; the 3D scene runs in a `try` so it cannot take the form down; assets are cache-busted (`?v=3`). |

Checking that a class *works* is not checking that nothing else *also*
defines it. A runtime CSS framework loaded "just in case" can override a
hand-written system silently.

A test pass is only as current as the last edit it ran after (#15). Re-run
the gate and portfolio checks after *any* change, including doc-only
passes.

## Ahead

- ⚠️ **The access screen is not security.** It is client-side (site-guide
  §6). Use host-level protection before putting anything confidential behind
  it.
- **Share base URL.** The OG and canonical URLs assume
  `media-acute-circle.github.io/lumiere-3d-portfolio`. Confirm or swap them
  at deploy, then re-scrape in the Facebook Sharing Debugger.

- **WhatsApp number.** The quote section links to Acute Circle's number as a
  placeholder. Swap in the brand's number before any client-facing deploy.
- **Real 3D models.** The hero uses procedural lathe models, and the ring
  and viewer use generated SVG. Real products need glTF files loaded into the
  hero rig (proposal §6, Phase 2).
- **Phone GPUs.** The hero has only been rendered in headless Chrome
  (SwiftShader/ANGLE). Check frame rate on a mid-range Android before a client
  demo; lowering the pixel ratio cap to 1.5 is the first lever.
