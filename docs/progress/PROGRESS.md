# Progress

> Update at the end of every working session. Phases follow
> `../../reference-doc.md` §6.

## Status (2026-10-12)

| Area | Status |
|---|---|
| Concept site: layout, three design directions | ✅ Done |
| WebGL 3D hero (3 models, 4 finishes, dimmer, 360° rotation, per-direction lighting) | ✅ Done. **Not yet tested on a real phone GPU** |
| 3D ring and 360° viewer (visual upscale, keyboard support) | ✅ Done |
| Responsive pass, 320–1920 px, all three directions, no wrapped buttons | ✅ Done, verified in headless Chrome (24/24 combinations) |
| Accessibility pass (landmarks, keyboard, ARIA, contrast) | ✅ Done. **Not yet tested with a real screen reader** |
| Proposal content on the page (gaps, plan, roles, needs) | ✅ Done |
| Access screen (password gate, 3-attempt modal, WhatsApp CTA, 3D backdrop) | ✅ Done. **Client-side gate only** (site-guide §6) |
| OG / X cards, JSON-LD, robots.txt, sitemap.xml | ✅ Done. **Base URL assumed** (GitHub Pages), **not yet validated in Facebook or X debuggers** |
| Documentation (README, proposal, docs/) | ✅ Done |
| Production build (CMS, real data, form backend) | ⬜ Not started. Phase 1 per proposal |

## Verified working (2026-10-12, headless Chrome 1440×900 and 390×844)

- No horizontal overflow at 320, 375, 414, 768, 1024, 1280, 1440 and 1920 px.
- No console errors.
- Spec tabs: arrow keys move focus and switch panels.
- 360° viewer: arrow keys rotate by 15°, `+` zooms to 1.3.
- Quote form: empty fields show "Please fill this in.", a bad email shows a
  specific message, and the step label advances to "Step 2 of 3".
- Mobile menu opens and closes on <kbd>Esc</kbd>.

## Known stubs / placeholders

- All products, prices, KPIs and leads are sample data (`app.js` `PRODUCTS`,
  `leads`).
- The quote form does not send anything. It shows a local confirmation with
  a random reference.
- The WhatsApp link uses Acute Circle's number (see `CHALLENGES.md` → Ahead).

## Session log

### 2026-10-12 (scope update)

- **Client decision (2026-10-12):** launch scope cut to **5 to 7 products**
  (was 10 to 15). Updated in `portfolio.html` (MVP phase, plan to
  20 October, client checklist, trust stat now 7) and in `reference-doc.md`
  (§6, §7, §8), with a revision note at the top of the proposal.
- **Free ACM support clarified:** the 60 hours cover maintenance only (site
  health checkups, security patches, content changes, text tweaks). New
  pages, new features and new change requests are billed separately. Added a
  highlighted *Support after launch* panel to the dashboard section;
  corrected the Support card, which had said the hours covered new pages;
  rewrote proposal §5 as an included / billed table.
- QA:
  - no "10 to 15" left anywhere
  - responsive sweep 24/24 OK
  - portfolio and hero interactions pass, no errors
  - gate flow passes in Chromium, WebKit and Firefox over HTTP and `file://`
  - support panel checked in all three directions at 1440 px and at 375 px

### 2026-10-12 (fix)

- The user reported a dead access screen. Root cause: `gate.js` had been
  truncated to 0 bytes by a doc-update script (`CHALLENGES.md` #15).
  Restored and hardened.
- Re-verified with the full flow (eye toggle, 3-attempt modal, correct
  password → portfolio) in Chromium, WebKit and Firefox, each over HTTP and
  `file://`: 6/6 pass, with no console errors.

### 2026-10-12 (third pass)

- Moved the portfolio to `portfolio.html`. `index.html` is now the Acute
  Circle access screen (`gate.css`, `gate.js`), with a head guard on both
  pages.
- Brand read from acutecircle.com in headless Chrome (palette, Inter, meta).
  The emblem was cut from `reference/AcuteCircle Updated Logo.png` into
  `assets/brand/`.
- Verified in headless Chrome:
  - direct `portfolio.html` redirects to `index.html`
  - the eye toggle switches the type and label
  - wrong attempts show "2 attempts left" and then "1 attempt left"; the 3rd
    opens the modal, with focus on the WhatsApp CTA; <kbd>Esc</kbd> closes it
  - the correct password opens `portfolio.html`, and revisiting the gate skips it
  - no console errors
  - no horizontal scroll at 320×568, 375×812, 414×896, 768×1024, 1024×768,
    812×375 and 1920×1080
- The JS SHA-256 matches Node `crypto` on 5 inputs, including Unicode.
- Added full OG and X meta, JSON-LD, canonical, robots.txt and sitemap.xml.
  Rendered `og-access.jpg` and `og-portfolio.jpg` (1200×630, ~64 KB each)
  with `tools/og/render.mjs`.
- Re-ran the portfolio sweep with a pre-set session: 24/24 OK.

### 2026-10-12 (second pass)

- Replaced the tilt-card hero with a WebGL hero (`hero3d.js`, Three.js r128
  pinned with SRI): lathe-built pendants (Halo, Orbit, Atrium), PBR finishes,
  softbox environment, soft shadow, light pool, and a volumetric cone and dust
  in Dark Gallery. Controls: drag, arrow keys, model switcher, finishes, light
  switch and dimmer, rotation dial.
- Design pass against the "template" look: indexed section labels
  (`02 / Collections`), per-direction shape tokens (pill, sharp, soft), the
  scrolling marquee replaced by a collections index, drawn metallic artwork on
  the collection cards, film grain in the hero, a four-column footer, and a
  consistent nav taxonomy.
- Buttons set to `nowrap` and swept: 24/24 width × direction combinations
  pass with no wrapped or overflowing button, no horizontal scroll and no
  console errors.
- Verified the hero controls in headless Chrome: model 02 shows Orbit and
  1,500 lm; the light switch sets `--lit` to 0; four <kbd>→</kbd> presses
  turn 9° to 54°; a 200 px drag turns about 100°.

### 2026-10-12

- Reviewed `index.html`, `styles.css` and `app.js` against the proposal.
- Removed the Tailwind CDN, which was breaking buttons and the ring
  (`CHALLENGES.md` #1–2).
- Rewrote `styles.css` into a single 20-section system: tokens, a type and
  spacing scale, and responsive breakpoints at 1080, 960, 860, 600 and
  380 px.
- Upscaled the 3D visuals in CSS only (ring edge fade, floor reflection,
  card lighting; viewer turntable, vignette, glass controls). The JS logic
  of the ring and viewer is unchanged.
- Added proposal content to the page: §2 gaps, §4.2 roles, §7 plan, §8 needs.
  Corrected the phase lists to match §6.
- Added keyboard and ARIA support, scrollspy, form error messages and focus
  management.
- Wrote the README, refurbished `reference-doc.md`, and created `docs/`.
