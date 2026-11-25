# Taunton Redemption Center site

One page, no build step. Files:

- `index.html`: the page
- `site-data.js`: **everything that changes** (hours, phone, closures, deposit lists, rules, verified date)
- `status.js`: the open/closed logic
- `status.test.js`: tests for that logic (`node status.test.js`)
- `CONTEXT.md`: the project glossary

## Before launch
1. In `site-data.js`, set the real `phone` and `hours`, then change `hoursArePlaceholder` to `false`.
2. Check the deposit lists against the mass.gov page and update `lastVerified`.

## Closures (emergencies, holidays, anything planned)
In `site-data.js`, add one entry per closure to the `closures` list (dates are YYYY-MM-DD):

    closures: [
      { start: "2026-11-26", end: "2026-11-26", message: "Closed for Thanksgiving" },
      { start: "2026-12-01", end: "2026-12-02", message: "Closed for inventory" }
    ],

- A closure shows in the "Upcoming closures" strip from 14 days before it starts (change `closureNoticeDays` to adjust) until its last day is over, then it disappears by itself. You can leave old entries in or delete them.
- On the closure days, the banner says "Closed" with the message, and the shop reopens by itself afterward.
- For an emergency today, add `{ message: "Closed today: power outage", start: "2026-11-27", end: "2026-11-27" }`. With no `end`, the shop stays closed until you remove the entry.
- For a half day, add `openUntil` (24-hour time): `{ start: "2026-11-25", end: "2026-11-25", openUntil: "12:30", message: "Half day before Thanksgiving" }`. The shop shows Open until that time, then Closed. It can only shorten a day, never extend the normal hours.
- Commit the change. The site updates in a minute or two.

## Publishing on GitHub Pages
1. Create the repo under the client’s account, named `<username>.github.io`.
2. Add these files to the repo root and commit to `main`.
3. In the repo, go to Settings > Pages and choose "Deploy from a branch", branch `main`, folder `/ (root)`.
4. The site appears at `https://<username>.github.io`.

## Preview on your computer
Double-click `index.html`. Times use Massachusetts time whatever your computer’s time zone is.