# BidBrush — Project Tracker

**Goal:** The go-to quoting app for up-and-coming painters. Enter the job details, get an
itemized price, send it to the customer. Free to start, paid plan later.

**Where we are now:** Phase 1 is built, plus job types and the square-footage quick estimate. **Next: owner merges the pull request, then we turn on GitHub Pages.**

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
- ✅ Commercial → Office, Retail, Restaurant, Warehouse or Other (owner to confirm this list)
- ✅ Commercial room presets (Office, Conference Room, Open Floor, Lobby, Restroom, Break Room, Hallway)
- ✅ Property type shown on the quote, email text and quote list; can be changed while editing
- ✅ Quick estimate from the total square footage (⚡ Quick / 📐 Room by room switch; quote says it's a ballpark)
- ⬜ Decide if property type should change pricing (e.g. condo building rules, commercial rates or after-hours work)

## Phase 2 — Get it online and in painters' hands ⬜

- 🔄 Merge the code into `main` (pull request opened, owner to merge)
- ⬜ Turn on GitHub Pages so the app has a public link
- ⬜ Install it on your own phone and quote a real (or pretend) job
- ⬜ Check the default prices against real local numbers
- ✅ Pick a final name: **BidBrush**
- ✅ Rename the app to BidBrush (folder is now `bidbrush/`)
- ⬜ Check bidbrush.com / bidbrush.app, social handles (TikTok, Instagram, Facebook) and the US trademark search, then grab them
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
| 2026-11-12 | App lives in `bidbrush/` folder | Keeps the GitHub profile README separate |
| 2026-11-13 | Quotes start by picking Residential (House / Townhouse / Condo) or Commercial | Owner request; tailors room presets and shows the property on the quote |
| 2026-11-13 | Room scanning postponed to the native-app stage | Works well only on Pro iPhones in a native app (App Store fees, much more work); AI photo guesses are too rough for pricing |
| 2026-11-13 | Quick estimate treats the home as typical rooms (150 sq ft homes, 300 sq ft commercial) | Reuses the same pricing rules; lands around $3–6 per floor sq ft for walls + trim, in line with typical repaints |
| 2026-11-12 | Name: **BidBrush** | Says what it does (bids) and who it's for (painters); short and works as a social handle |

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
