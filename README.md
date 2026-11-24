# Taunton Redemption Center site

One page, no build step. Files:

- `index.html`: the page
- `site-data.js`: **everything that changes** (hours, phone, closure override, deposit lists, rules, verified date)
- `status.js`: the open/closed logic
- `status.test.js`: tests for that logic (`node status.test.js`)
- `CONTEXT.md`: the project glossary

## Before launch
1. In `site-data.js`, set the real `phone` and `hours`, then change `hoursArePlaceholder` to `false`.
2. Check the deposit lists against the mass.gov page and update `lastVerified`.

## Closing for an emergency or holiday
In `site-data.js`, replace `override: null` with, for example:

    override: { message: "Closed today: power outage", start: "2026-11-27", end: "2026-11-27" },

Commit the change. The site updates in a minute or two. After the end date it returns to normal hours by itself. To end it early, set it back to `null`.

## Publishing on GitHub Pages
1. Create the repo under the client’s account, named `<username>.github.io`.
2. Add these files to the repo root and commit to `main`.
3. In the repo, go to Settings > Pages and choose "Deploy from a branch", branch `main`, folder `/ (root)`.
4. The site appears at `https://<username>.github.io`.

## Preview on your computer
Double-click `index.html`. Times use Massachusetts time whatever your computer’s time zone is.
