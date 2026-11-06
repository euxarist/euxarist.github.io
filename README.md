# euxarist.github.io

my little corner of the internet

## what's here

- **personal site** — a responsive HTML/CSS homepage with cascading Matrix rain
- **minecraft map** — an interactive map viewer powered by [uNmINeD](https://github.com/UnminedIO/Unmined)
- **matrix rain** — because i thought it was cool in 2006 and i still do

## previewing

The homepage needs no build step. Serve the repository with any static web server:

```bash
python -m http.server 8765 --bind 127.0.0.1
```

Open http://localhost:8765. Edit `index.html` for content and `style.css` for layout and styling. The homepage stacks its content on phone widths, supports keyboard navigation, and respects reduced-motion preferences.

## building

The rain is authored in `src/matrix.ts`; browsers run the checked-in `matrix.js`. The map also has TypeScript sources under `src/map/`. To compile changes to those sources, install the development dependencies with Bun, then run:

```bash
bun install
bun run build
bun run typecheck
bun run watch
```

The compiled output lives alongside the pages. HTML/CSS edits do not require recompiling TypeScript.

## tech

- plain HTML and CSS for the homepage
- TypeScript compiled to JavaScript for the Matrix rain and map
- Google Fonts: Syne and IBM Plex Mono, with local font fallbacks
- [OpenLayers](https://openlayers.org) for the map
- [uNmINeD](https://github.com/UnminedIO/Unmined) for Minecraft map rendering
