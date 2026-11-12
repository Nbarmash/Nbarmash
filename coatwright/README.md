# Coatwright

Price an interior paint job in minutes on your phone and send the customer a professional, itemized estimate.

## How it works (for painters)

1. **Set up once** (⚙️): business name, logo, labor rate, markup and paint prices.
2. **New Quote**: pick Residential (House / Townhouse / Condo) or Commercial, enter the customer.
   Add **Outside & floors**: whole-house exterior, deck, fence, doors, shutters, garage floor (paint, epoxy or flakes).
   Use **⚡ Quick** for a ballpark from the total square footage, or **📐 Room by room**: tap room types (Bedroom, Kitchen…).
   Pick Small / Medium / Large or type exact measurements, tap what's being painted
   (walls, ceiling, trim, doors), and choose coats and wall condition. The price updates as you go.
3. **Track the job**: mark it Sent → Won → Scheduled → Completed → Paid, log payments and the real costs.
   📊 **Stats** shows what you made this year, money owed, win rate, monthly chart and insights.
   Export spreadsheets for your accountant and back up your data in ⚙️ Settings.
4. **Review & Send**: email, text, save as PDF or copy the itemized quote.
   A private "Your numbers" panel shows hours, crew days, cost, profit and margin.

Quotes are saved on the device and the app works offline after the first visit.
Add it to the home screen ("Add to Home Screen" on iPhone, "Install app" on Android).

## How the price is calculated

- Wall area = room perimeter × height − 20 sq ft per door − 15 sq ft per window
- Labor hours = area × coats ÷ production rate, adjusted for wall condition
  (Fair +15%, Rough +35% plus patch & prime) and ceilings 10 ft+ (+15%) / 12 ft+ (+30%)
- Paint = area × coats ÷ coverage, rounded up to whole gallons; supplies = % of paint cost
- Line prices = (labor or material cost) × (1 + markup)
- Then extras, discount, minimum job charge, sales tax and deposit

All of this lives in `pricing.js`. Every rate is adjustable in Settings.

## Run it locally

```bash
cd coatwright
python3 -m http.server 8000   # then open http://localhost:8000
node --test tests/pricing.test.js tests/stats.test.js
```

## Put it online free

It's a static site with no build step. Any of these work:

- **GitHub Pages**: repo Settings → Pages → deploy from branch → the app is at `/coatwright/`
- **Netlify / Vercel / Cloudflare Pages**: drag and drop the `coatwright` folder

## Ideas for next versions

- Exterior jobs (siding, soffits, decks), cabinets
- Accounts + cloud sync (e.g. Supabase) so quotes follow you across devices
- Customer "Accept quote" link with e-signature and deposit payment (Stripe)
- Paid plan: free for 3 quotes a month, unlimited + logo for a monthly fee
