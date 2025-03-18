# color-palette

small thing i made over a few evenings. pick a color and it spits out the usual palette types based on hue rotation math.

what it does:

- native color picker plus a hex input
- shows the base color with hex, rgb, hsl
- generates analogous, complementary, triadic, tetradic palettes
- click any swatch to copy its hex

## the math part

it all runs through hsl. the four palette types are just hue rotations on the same color:

- analogous: base, base minus 30, base plus 30
- complementary: base and base plus 180
- triadic: base, plus 120, plus 240
- tetradic: base, plus 90, plus 180, plus 270

the conversion helpers are written from scratch in `app.js`. hex to rgb parses the three pairs, rgb to hsl uses the standard max/min approach with the luminance branch for saturation, hsl to rgb uses the chroma + X + m method (cleaner than the older hue-to-rgb helper imo).

## running it

no build, no deps. just open the file.

```
git clone https://github.com/secanakbulut/color-palette.git
cd color-palette
open index.html
```

or serve it with anything, python's `http.server` works fine.

## files

- `index.html` markup
- `style.css` dark layout
- `app.js` color math and render

## license

source-available under PolyForm Noncommercial 1.0.0. fine for personal and hobby use, not for resale. see `LICENSE`.
