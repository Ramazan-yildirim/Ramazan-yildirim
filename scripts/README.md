# Terminal profile assets

Run `node scripts/build-terminal-assets.mjs` from this repository. The generator has no dependencies and rebuilds:

- Wide/compact logo-only headers with 1,708 small white cells, shaded extrusion and a transparent background. `ry-grid.json` contains a finer luminance sample of the original RY mark. Light variants use slightly stronger outlines so the white surface stays visible.
- Wide/compact About Me and Dijital Diş Dünyası panels.
- Command-style link buttons and technology package cards.

Edit the content, palette and geometry in `build-terminal-assets.mjs`, then regenerate the SVG files. The technology icons remain embedded, so they need no external requests. The original brand assets are retained.

Profile panels and buttons keep a dark terminal surface in both GitHub color schemes. The logo uses white faces in both schemes; the Vercel statistics service supports explicit dark and light palettes. Compact panels are selected below 600px using the existing README `<picture>` approach. CV and portfolio previews use GitHub's native disclosure immediately below the top link buttons. Edit `aboutFields` to update the profile content; both layouts and the SVG description share those values. The Linux penguin is a self-contained vector drawing.

The GitHub stats service lives in the sibling `ramazan-github-stats` repository. Its SVG templates and palettes are in `lib/cards.js`; data fetching, endpoint options and cache behavior are unchanged. Deploy that repository to update the live statistics images. The contribution snake picks up the new palette on the next workflow run after publishing this profile repository.
