# Local stats design preview

Open `index.html` in a browser. It selects light/dark and wide/compact SVGs using the same picture sources as the profile README. Resize below 600px to inspect the compact layout. No server, credentials or commit is required.

These files are design snapshots from the existing production cards, captured during the 2026-10-25 redesign. They are not a second data source and do not update automatically. Activity values were read from the current stats SVG; language proportions were recovered from the exact widths of its language chart segments, preserving the live byte ratios without inventing values.

The implementation is in `../../../ramazan-github-stats/lib/cards.js` (the sibling repository). Publishing that repository updates the two production endpoints used by the profile. The PNG files show the verified browser renderings. `empty*.svg` and `error*.svg` cover the no-data and unavailable states.
