# PaintQuote — Project Tracker

**Goal:** The go-to quoting app for up-and-coming painters. Enter the job details, get an
itemized price, send it to the customer. Free to start, paid plan later.

**Where we are now:** Phase 1 is built and pushed. **Next: put it online (Phase 2, step 1).**

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

## Phase 2 — Get it online and in painters' hands ⬜

- ⬜ Merge the code into `main` (open a pull request)
- ⬜ Turn on GitHub Pages so the app has a public link
- ⬜ Install it on your own phone and quote a real (or pretend) job
- ⬜ Check the default prices against real local numbers
- 🔄 Pick a final name (shortlist: BidBrush, Cut & Quote, QuoteCoat, FirstCoat), check the domain, social handles and trademarks, then rename the app
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
| 2026-11-12 | App lives in `paint-quote/` folder | Keeps the GitHub profile README separate |

## Log

- **2026-11-12** — Chose approach. Built and tested Phase 1 (pricing engine, quote builder,
  customer estimate, sending, settings, offline). Pushed to branch `claude/serene-carson-hods6d`.
  Created this tracker.
- **2026-11-12** — Name brainstorm: shortlist made, waiting for the owner to pick. Added the
  social-media video plan to Phase 5 (start when the app is ready to launch).
