---
name: pitch-site
description: >
  Turn a local business's existing website into a live ScrollCraft demo and a
  personal pitch email saved as a Gmail draft. Use when Monty gives a business
  URL or Google Maps link (or picks one from /find-leads) and says pitch, demo,
  redo, rebuild, pitch-site, or "do the Nuova thing" for it. Audits the site,
  extracts the brand, asks four brief questions, builds and verifies a unique
  scroll site from the business's real photos with the scroll-craft skill,
  deploys it to Netlify, and drafts (never sends) the email.
argument-hint: <business website URL or Maps link> [notes]
---

# pitch-site

Input: one business website URL (or Google Maps link), plus optional notes from Monty.
Output: a live `https://<slug>-demo.netlify.app` and a Gmail draft to the
business. Nothing is sent.

The deliverable is a **real demo website built with scroll-craft**. An audit
report or a slide-style pitch page on its own is not the output of this skill.

Keep a task list. Tell Monty in one line when each stage finishes.

---

## Paths

This skill works from two layouts. Work out which one you are in first.

| | PC (`website-pitches` folder) | Cloud session (this repo) |
| --- | --- | --- |
| Project root `ROOT` | `website-pitches/` | the `scroll-craft` repo root |
| scroll-craft skill `SC` | `ROOT/scroll-craft/plugins/nateherk-design/skills/scroll-craft` | `ROOT/plugins/nateherk-design/skills/scroll-craft` |
| This skill's kit `KIT` | `ROOT/.claude/skills/pitch-site/kit` (or the older `ROOT/pitch-kit`) | `ROOT/.claude/skills/pitch-site/kit` |
| Builds and logs `STUDIO` | `ROOT/studio` | `ROOT/studio` (git-ignored, so it is lost when the session ends) |

`node KIT/paths.mjs` prints all four for the current folder.

Settings live in `ROOT/.claude/skills/pitch-site/config.md` (git-ignored).
If it doesn't exist, copy `templates/config.example.md` to it and ask Monty for
the missing values. Never commit `config.md`: this repo is public.

## Running in a cloud session

A cloud session is not Monty's PC. Before Stage 1:
- **Network.** The environment's allowlist must include the business's domain
  and its image CDN (Wix sites need `static.wixstatic.com`,
  `static.parastorage.com`, `siteassets.parastorage.com` and
  `video.wixstatic.com`). Ask for missing hosts with the environment tools,
  in one request.
- **Browser.** There is no browser pane. Use headless Chromium through
  `playwright` for everything the PC flow does in the pane
  (`KIT/brand.mjs`, `KIT/look.mjs`).
- **Netlify.** Deploying needs a Netlify personal access token for
  `api.netlify.com`. Ask for it with `request_credential` as soon as Stage 7 is
  in sight, never in chat. Without one, build `dist/` and hand Monty the
  folder for Netlify Drop.
- **Gmail.** The Gmail connector's `create_draft` works from the cloud.
- **Logs.** `STUDIO/pitches.md` and `STUDIO/FINGERPRINTS.md` from the PC are
  not here. Ask Monty to paste the latest FINGERPRINTS rows before Stage 3, or
  note in the report that the gate ran against an empty registry.

---

## Stage 0: Check before starting
1. Make a slug from the business name: lowercase, hyphens, max 24 characters (e.g. `nuova-beauty-bar`).
2. Read `STUDIO/pitches.md`. If this business is already there, stop and tell Monty the date and link.
3. Confirm the tools:
   - `node SC/scripts/doctor.mjs`
   - `npm i` in `KIT` if `KIT/node_modules` is missing
   - Netlify: `npx netlify-cli status` on the PC, or a saved credential in the cloud. Without it, Stage 7 falls back to a manual drag.

## Input can be a Google Maps link
If Monty pastes a `maps.app.goo.gl` link:
1. Resolve it with `curl -sI <link>`. The `Location` header has the place name and coordinates.
2. Open the place and read the rating, review count, address, phone, hours, menu link and website.
3. If there's a website, carry on with that URL.
4. If there's **no website**, it's a "no-website lead" (often the best kind). Its content comes from:
   - the Maps listing
   - their menu PDF (QR menus are often on getqr.com and similar sites)
   - the FSA hygiene rating
   - third-party listings

   Read a menu PDF by rendering its pages with pdf.js in headless Chrome, then read the PNGs. The text extracted from a PDF jumbles price columns, so never trust prices from the text alone.

## Stage 1: Audit (subagent)
Spawn the `site-auditor` agent with the URL and slug. For several URLs, spawn
one per URL in parallel. It writes `STUDIO/builds/<slug>/AUDIT.md`.
Then run `node KIT/brand.mjs <url>` (computed colours and fonts; agents can't
read computed styles from HTML) and add its output to AUDIT.md.

**Qualify.** Stop and tell Monty (don't build) if any of these is true:
- The site is already modern and good. Say why. This is a bad lead.
- It's a chain or franchise. The decision is made elsewhere.
- There's no public business email. Ask Monty how he'll pitch: **visit in person** (common for local shops), phone, or stop. For a visit, Stage 8 becomes a visit kit instead of an email.

**Photos.** Google Maps photos belong to the customers who took them, and they can't be downloaded reliably anyway. With no website photos, offer these options:
- illustrated SVG (free and unique; worked well for Mèbi)
- Monty photographs on the visit
- kie.ai
- stock

## Stage 2: Brief (ask Monty, one AskUserQuestion call)
Show what the audit found in two lines (colours, the weak spots, photo count),
then ask:
1. **Vibe.** Three options drawn from this business's own feel, plus "Use your judgment".
2. **The one wow moment.** Three bespoke ideas drawn from this brand's logo, name, product or place. Never reuse an earlier signature move. Check `STUDIO/FINGERPRINTS.md`.
3. **Images.** Their real photos (recommended when there are 10 or more decent ones) / AI-generated with kie.ai (needs a key, costs money) / free stock.
4. **Structure.** Separate scenes (default) / one continuous journey (needs video and ffmpeg).

If Monty says "use your judgment", don't ask again. Write the brief as
`Self-authored under explicit creative delegation`.

## Stage 3: Design (follow ScrollCraft exactly)
Read `SC/SKILL.md` and the references it names, in particular
`uniqueness.md`, `devices.md`, `taste.md`, `feel.md` and `hero-depth.md`.
Then write `STUDIO/builds/<slug>/BRIEF.md` with:
- the brief answers
- the grammar, and why the other grammars lost
- the journey (4 to 7 beats)
- the feeling curve and the one peak
- the signature move
- the score table

**Fingerprint gate.** The plan must differ from every row in
`STUDIO/FINGERPRINTS.md` on at least 4 of 6 dimensions. Repeating Nuova's
shape on a new client fails, so change the plan, not the log.

## Stage 4: Assets
1. Download images to `STUDIO/builds/<slug>/raw/` as **short numeric names** (`00.jpg`, `01.png` ...). Long names break on Windows.
2. Build a contact sheet (`node KIT/contact-sheet.mjs <rawDir> <out.png>`) and look at it. Pick the shots for each act.
3. Write a job file and run `node KIT/prep-images.mjs <jobs.json>` to write `assets/*.webp`. Keep the total under about 2 MB.
4. Note the gaps (no photo for a service, low-res logo) for the "Before you pitch" list.

## Stage 5: Build
- Copy `SC/engine/scrollcraft.{js,css}` into the build folder. Never edit the engine.
- Write one `index.html`: real markup, tokens for colours, two font families at most.
- Every demo must have all of these:
  - `<meta name="robots" content="noindex, nofollow">`
  - LocalBusiness (or a more specific type, e.g. `VeterinaryCare`) JSON-LD with the real address and phone
  - every booking or contact CTA pointing at their real booking link, phone or WhatsApp
  - tap-to-call links
  - a map
  - `TODO` comments where prices or hours are unknown
- Real copy only. You can lightly trim their own reviews and attribute them as "First name, initial". Never invent reviews, numbers, awards or prices.

## Stage 6: Verify
1. Serve the builds in the background:
   ```
   node SC/scripts/serve.mjs --root STUDIO/builds --port 4600
   ```
   The page is at `http://localhost:4600/<slug>/index.html`.
2. `node KIT/look.mjs <url> <outDir> <w> <h> "y:0,#act:0.5,..."` takes headless screenshots at scroll points and reports console errors and horizontal scroll. Run it at 1440x900 and 390x844, then read the combined sheet it writes.
3. Run the harness from `KIT` (it has playwright-core):
   ```
   node SC/scripts/shoot.mjs --url http://localhost:4600/<slug>/index.html --out <abs>/lab/shots
   ```
   Repeat with `--width 390 --height 844` and with `--reduced-motion`. Fix every dead-scroll or contrast line.
4. Check by hand:
   - a sideways rail has positive overflow
   - no horizontal page scroll at 375px
   - the signature move works and reverses
   - the console has no errors

## Stage 7: Deploy
```
bash KIT/deploy.sh <slug>
```
This copies only the site files to `STUDIO/builds/<slug>/dist`, deploys with
`netlify deploy --prod` to the site `<slug>-demo` (creating it if needed), and
prints the live URL and a public HTTP check. The check must say 200.

New sites on Monty's Netlify account can sit behind a visitor-login wall. If
the check says 401, Monty switches off visitor access for that site in the
Netlify dashboard (Site configuration, then Access & security), then re-run
the check with `bash KIT/deploy.sh <slug> --check`.

Check as a **logged-out stranger**: load it with playwright from `KIT` at 1440
and 390 wide, and check:
- images load
- the console is clean
- booking links are right
- there's no horizontal scroll

Without Netlify access, give Monty the `dist` folder and the Netlify Drop
steps (drag, then **claim**, then paste the link back).

## Stage 8: Draft the email (Gmail, never send)
Fill `templates/email.md` with:
- one real, specific compliment
- the two biggest weak spots of their current site, said kindly
- the live link
- how to view it (phone, scroll slowly, where the wow moment is)
- three short benefits
- the honesty line (it's a demo, prices and hours are placeholders)
- the soft ask
- the signature and opt-out line from `config.md`

Save it with Gmail `create_draft` (`includeSignature: false` when config has a
signature). Give Monty the draft link. **Never call `send_message`.**

Before drafting, flag in one line if the business looks like a sole trader
(RUNBOOK §4 on the PC: UK PECR rules on emailing individuals).

### Stage 8b: Visit kit (when there's no email)
Use `STUDIO/builds/mebi-sushi/` (on the PC) or `templates/visit-card.html` as the model:
- `VISIT.md`: when to go (a quiet weekday afternoon), a 30-second script built on one true compliment, the "hand them your phone" moment, what to ask for (email or WhatsApp, hours, photos), and what to say on a no.
- `visit-card.html` plus `visit-card.pdf`: an A6 card in their brand with an inline QR code (`node KIT/qr.mjs <url>` prints the SVG; inline it so the card works when opened from disk), the demo URL, and Monty's details from `config.md`.

Log the status as `ready to visit`.

## Stage 9: Log and report
- Append a row to `STUDIO/FINGERPRINTS.md` and to `STUDIO/pitches.md`. The pitches.md columns are: date, business, URL, demo link, contact, status = drafted.
- In a cloud session, also print both new rows in the report so Monty can paste them into the PC copies.
- Report to Monty briefly:
  - the live link
  - the draft link
  - what the wow moment is
  - "Before you pitch" items (missing prices, hours, logo, photos)
  - anything not verified
