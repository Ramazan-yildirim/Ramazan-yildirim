# Terminal profile assets

Run `node scripts/build-terminal-assets.mjs` from this repository. The generator has no dependencies and rebuilds:

- Dark/light, wide/compact terminal headers with the original RY mark translated into vector character cells.
- Wide/compact About Me and Dijital Diş Dünyası panels.
- Command-style link buttons and technology package cards.

Edit the content, palette and geometry in `build-terminal-assets.mjs`, then regenerate the SVG files. The technology icons remain embedded, so they need no external requests. The original brand assets are retained.

Profile panels and buttons keep a dark terminal surface in both GitHub color schemes. The hero and the Vercel statistics service support explicit dark and light themes. Compact panels are selected below 600px using the existing README `<picture>` approach.

The GitHub stats service lives in the sibling `ramazan-github-stats` repository. Its SVG templates and palettes are in `lib/cards.js`; data fetching, endpoint options and cache behavior are unchanged. Deploy that repository to update the live statistics images. The contribution snake picks up the new palette on the next workflow run after publishing this profile repository.
