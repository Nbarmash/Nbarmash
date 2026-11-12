# Coatwright — Project Tracker

**Goal:** The go-to quoting app for up-and-coming painters. Enter the job details, get an
itemized price, send it to the customer. Free to start, paid plan later.

**Where we are now:** Phase 1 is built, plus job types, full commercial list and quick estimate. Renamed to **Coatwright** and merged into `main`. **Next: owner turns on GitHub Pages, then buys the domain and grabs the social handles.**

Legend: ✅ done · 🔄 in progress · ⬜ not started

---

## Phase 1 — Build the first version (MVP) ✅

- ✅ Choose the approach: phone-friendly web app, no AI fees, free hosting
- ✅ Pricing engine (walls, ceilings, trim, doors, coats, wall condition, ceiling height, paint gallons, supplies, markup, minimum job, tax, deposit)
- ✅ Tests for the pricing math (7 passing)
- ✅ Easy-to-use quote builder (tap-to-add rooms, size presets, live price)
- ✅ Itemized customer estimate (logo, line items, deposit, terms, signature line)
- ✅ Send options: email, text/share, save PDF, copy
- ✅ Private "Your numbers" panel (hours, cost, profit, margin)
- ✅ Settings: business info, logo, rates, paint prices, work speeds
- ✅ Quotes saved on the phone, works offline, installable on home screen
- ✅ Tested end to end on a simulated iPhone

## Phase 1b — Owner feature requests 🔄

- ✅ Choose Residential or Commercial when starting a quote
- ✅ Residential → House, Townhouse or Condo, then continue to the quote
- ✅ Commercial → 15 property types, big or small (office, retail, restaurant, medical, hotel, apartments/HOA, warehouse, school, church, gym, salon, bank, auto, government, other)
- ✅ 31 commercial area types (closets to warehouse floors); each property shows its common areas first, the rest under "More area types"
- ✅ Taller walls priced for scaffolding/lifts (16 ft+ and 20 ft+)
- ✅ Property type shown on the quote, email text and quote list; can be changed while editing
- ✅ Quick estimate from the total square footage (⚡ Quick / 📐 Room by room switch; quote says it's a ballpark)
- ✅ Property type does not change pricing rules for now (owner: "everything else is good")

## Phase 2 — Get it online and in painters' hands ⬜

- ✅ Merge the code into `main` (pull request #1)
- 🔄 Turn on GitHub Pages so the app has a public link (owner: Settings → Pages → `main` → Save)
- ⬜ Install it on your own phone and quote a real (or pretend) job
- ⬜ Check the default prices against real local numbers
- ✅ Pick a final name: **Coatwright** (first pick BidBrush was taken)
- ✅ Rename the app to Coatwright (folder is now `coatwright/`)
- 🔄 Name check: web search found no company, website or app using Coatwright (only a *cancelled* "COATRIGHT" trademark). Owner still to buy the domain, grab @coatwright handles and confirm at tmsearch.uspto.gov
- ⬜ Give it free to 5–10 local painters
- ⬜ Collect feedback: what's confusing, what's missing, what they'd pay

## Phase 3 — Make it better based on feedback ⬜

- ⬜ Exterior jobs (siding, trim, soffits, decks, fences)
- ⬜ Cabinets and other common add-ons
- ⬜ Fixes from painter feedback

## Phase 4 — Start making money ⬜

- ⬜ Accounts and cloud sync (quotes on any device)
- ⬜ Customer "Accept quote" link with e-signature
- ⬜ Deposit payments through Stripe
- ⬜ Room scanning with the iPhone's LiDAR sensor (needs a native iPhone app; Pro models only) — premium feature
- ⬜ Paid plan (e.g. free for 3 quotes/month, monthly fee for unlimited + logo)
- ⬜ Simple landing page explaining the app

## Phase 5 — Grow ⬜

- ⬜ Post in painter Facebook groups and subreddits
- ⬜ Video plan: 20–30 scripts with hooks, captions and hashtags (TikTok, Reels, Shorts, Facebook)
- ⬜ Real app demo videos recorded automatically (e.g. "quote a room in 60 seconds")
- ⬜ AI-generated videos (job-site scenes, voiceover) made from the scripts
- ⬜ Posting schedule: 1–3 videos a day, track which ones bring sign-ups
- ⬜ Reach out to local paint supply stores
- ⬜ Referral offer (free month for each painter referred)

---

## Decisions made

| Date | Decision | Why |
|---|---|---|
| 2026-11-12 | Web app instead of App Store app to start | Free, no app review, works on any phone |
| 2026-11-12 | No AI inside the app for now | Pricing is math; keeps running costs at $0 |
| 2026-11-12 | App lives in its own folder (now `coatwright/`) | Keeps the GitHub profile README separate |
| 2026-11-13 | Quotes start by picking Residential (House / Townhouse / Condo) or Commercial | Owner request; tailors room presets and shows the property on the quote |
| 2026-11-13 | Room scanning postponed to the native-app stage | Works well only on Pro iPhones in a native app (App Store fees, much more work); AI photo guesses are too rough for pricing |
| 2026-11-13 | Quick estimate treats the home as typical rooms (150 sq ft homes, 300 sq ft commercial) | Reuses the same pricing rules; lands around $3–6 per floor sq ft for walls + trim, in line with typical repaints |
| 2026-11-13 | Commercial covers every business type with its own common areas | Owner: "include everything, big or small" |
| 2026-11-13 | Drop the BidBrush name | Owner found bidbrush.pro; a painter estimating app called BrushBid also exists, so trademark and search confusion risk |
| 2026-11-13 | Name: **Coatwright** | "Wright" = skilled craftsman; sounds established, made-up word so easier to trademark; no painting app or business found with it |
| 2026-11-12 | Name: **BidBrush** (replaced) | Says what it does (bids) and who it's for (painters); short and works as a social handle |

## Log

- **2026-11-12** — Chose approach. Built and tested Phase 1 (pricing engine, quote builder,
  customer estimate, sending, settings, offline). Pushed to branch `claude/serene-carson-hods6d`.
  Created this tracker.
- **2026-11-12** — Name brainstorm: shortlist made, waiting for the owner to pick. Added the
  social-media video plan to Phase 5 (start when the app is ready to launch).
- **2026-11-12** — Owner picked **BidBrush**. Renamed the app, files and folder (`bidbrush/`).
- **2026-11-13** — Added the Residential/Commercial job type step with property types,
  commercial room presets, and the property on quotes. 9 tests passing; tested on a simulated iPhone.
- **2026-11-13** — Opened the pull request to merge into `main`. Looked into room scanning:
  postponed to Phase 4; added a whole-home square-footage quick estimate as a cheaper idea.
- **2026-11-13** — Built the square-footage quick estimate. 11 tests passing; tested on a simulated iPhone.
- **2026-11-13** — Expanded Commercial (15 property types, 31 area types, tall-wall pricing). 14 tests passing.
  Owner found bidbrush.pro; BrushBid also exists. Name to be changed before launch.
- **2026-11-13** — Checked ~20 replacement names (Quoter, Spackle, Hueprint, Tintwork and others were taken).
  Owner picked **Coatwright**. Renamed the app and folder (`coatwright/`). Added a small "Made with Coatwright" line to quotes.
- **2026-11-13** — Name check for Coatwright came up clear. Merged pull request #1 into `main`.
