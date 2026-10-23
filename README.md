# People in Blocks

A responsive 4 × 5 generative poster built from editable, clipped SVG vector shapes.
Independent GSAP timelines animate the circles, bodies, rows, columns, zoom, colors, and
gradients. The original poster and its quick Play, color-swap, shift, merge, and reset
actions remain available.

## Run

Open `index.html` in a browser, or serve this folder locally:

```powershell
python -m http.server 8765
```

Then visit `http://localhost:8765`. The page loads GSAP 3.13 and the Manrope / DM Mono
fonts from their CDNs, so those resources require an internet connection.

## Playground controls

Expand **More ways to play** for playback progress and loop settings, independently
adjustable motion speeds, block rearranging and rotation, shape controls, live per-block
color pickers, saved palettes, gradient styles, and eight animation presets. Use **Original
layout** to return blocks to their exact 4 × 5 arrangement or **Reset entire playground**
to restore the original animation and palette. Saved custom palettes are stored in the
current browser.

Edit the palette and 20 figure definitions at the top of `app.js`; customize the responsive
interface in `style.css`.
