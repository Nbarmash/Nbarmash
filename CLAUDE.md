# Notes for Claude

The PaintQuote app lives in `paint-quote/`. The root `README.md` is the owner's GitHub
profile page: leave it alone.

**Project tracking:** `paint-quote/PROGRESS.md` is the step-by-step tracker. Read it at the
start of every session. Whenever work is finished or a decision is made, update it in the
same commit:
- tick off steps (✅ done, 🔄 in progress, ⬜ not started)
- update the "Where we are now" line
- add any decision to "Decisions made"
- add a dated entry to the "Log"

Tests: `node --test paint-quote/tests/pricing.test.js`
