# Terminal profile assets

Run `node scripts/build-terminal-assets.mjs` from this repository. The generator has no dependencies and rebuilds:

- Wide/compact logo-only headers using the original RY silhouette and its 1,708 small white square cells. `ry-grid.json` is the original 88×58 sample, preserved without changing the letter shapes. Compared with the initial treatment, cells are slightly fuller, silver depth is reduced to four pixels (three in compact), and placement is centered on the occupied cell bounds. Light variants have a slightly stronger outline. The background stays transparent; the original brand mark is retained in `assets/brand/ry.svg`.
- Wide/compact About Me and Dijital Diş Dünyası panels.
- Compact bracket-style link buttons in dark/light variants and technology package cards. All links share the same neutral style and transparent background. Links are 36px high, with vector arrows and separate clickable README targets.

Edit the content, palette and geometry in `build-terminal-assets.mjs`, then regenerate the SVG files. The technology icons remain embedded, so they need no external requests. The original brand assets are retained.

Profile panels retain their dark terminal surface. Headers and link buttons select explicit light/dark variants through README `<picture>` elements; the Vercel statistics service also supports explicit dark/light palettes. Compact headers and panels are selected below 600px. The wide logo header is 900×304; the compact header is 360×236. Both use the original silhouette with different cell sizes. The five top links total 630px before spacing and wrap naturally on smaller screens. CV and portfolio previews use GitHub's native disclosure immediately below the top link buttons. Edit `aboutFields` to update the profile content; both layouts and the SVG description share those values. The Linux penguin is a self-contained vector drawing.

The GitHub stats service lives in the sibling `ramazan-github-stats` repository. Its SVG templates and palettes are in `lib/cards.js`; data fetching, endpoint options and cache behavior are unchanged. Deploy that repository to update the live statistics images. The contribution snake picks up the new palette on the next workflow run after publishing this profile repository.
