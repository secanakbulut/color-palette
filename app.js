// hex -> rgb. parses the three pairs.
function hexToRgb(hex) {
  let h = hex.replace('#', '').trim();
  if (h.length === 3) {
    h = h.split('').map(c => c + c).join('');
  }
  if (!/^[0-9a-fA-F]{6}$/.test(h)) return null;
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}

// rgb -> hex
function rgbToHex(r, g, b) {
  const to = n => Math.round(n).toString(16).padStart(2, '0');
  return '#' + to(r) + to(g) + to(b);
}

// rgb -> hsl. standard formula using max/min and a luminance check.
function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h *= 60;
  }
  return { h: Math.round(h), s: Math.round(s * 100), l: Math.round(l * 100) };
}

// hsl -> rgb. chroma + X + m method, much cleaner than the hue-to-rgb helper.
function hslToRgb(h, s, l) {
  h = ((h % 360) + 360) % 360;
  s /= 100; l /= 100;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0, g = 0, b = 0;
  if (h < 60)       { r = c; g = x; b = 0; }
  else if (h < 120) { r = x; g = c; b = 0; }
  else if (h < 180) { r = 0; g = c; b = x; }
  else if (h < 240) { r = 0; g = x; b = c; }
  else if (h < 300) { r = x; g = 0; b = c; }
  else              { r = c; g = 0; b = x; }
  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255),
  };
}

// rotate the hue by deg, keep s and l. returns a full color object.
function rotate(hsl, deg) {
  const h = ((hsl.h + deg) % 360 + 360) % 360;
  return makeColor(h, hsl.s, hsl.l);
}

function makeColor(h, s, l) {
  const rgb = hslToRgb(h, s, l);
  const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
  return { h, s, l, ...rgb, hex };
}

// palette generators
function analogous(hsl) {
  return [rotate(hsl, -30), rotate(hsl, 0), rotate(hsl, 30)];
}
function complementary(hsl) {
  return [rotate(hsl, 0), rotate(hsl, 180)];
}
function triadic(hsl) {
  return [rotate(hsl, 0), rotate(hsl, 120), rotate(hsl, 240)];
}
function tetradic(hsl) {
  return [rotate(hsl, 0), rotate(hsl, 90), rotate(hsl, 180), rotate(hsl, 270)];
}

// dom
const colorPicker = document.getElementById('colorPicker');
const hexInput = document.getElementById('hexInput');
const baseSwatch = document.getElementById('baseSwatch');
const baseInfo = document.getElementById('baseInfo');
const hint = document.getElementById('hint');

const rows = {
  analogous: document.querySelector('[data-row="analogous"]'),
  complementary: document.querySelector('[data-row="complementary"]'),
  triadic: document.querySelector('[data-row="triadic"]'),
  tetradic: document.querySelector('[data-row="tetradic"]'),
};

function render(hex) {
  const rgb = hexToRgb(hex);
  if (!rgb) return;
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  const base = makeColor(hsl.h, hsl.s, hsl.l);

  baseSwatch.style.background = base.hex;
  baseInfo.innerHTML =
    `<div>${base.hex}</div>` +
    `<div>rgb(${base.r}, ${base.g}, ${base.b})</div>` +
    `<div>hsl(${base.h}, ${base.s}%, ${base.l}%)</div>`;

  drawRow(rows.analogous, analogous(hsl));
  drawRow(rows.complementary, complementary(hsl));
  drawRow(rows.triadic, triadic(hsl));
  drawRow(rows.tetradic, tetradic(hsl));
}

function drawRow(el, colors) {
  el.innerHTML = '';
  colors.forEach(c => {
    const div = document.createElement('div');
    div.className = 'swatch';
    div.innerHTML =
      `<div class="color" style="background:${c.hex}"></div>` +
      `<div class="meta">` +
        `<div class="hex">${c.hex}</div>` +
        `<div>rgb(${c.r}, ${c.g}, ${c.b})</div>` +
        `<div>hsl(${c.h}, ${c.s}%, ${c.l}%)</div>` +
      `</div>`;
    div.addEventListener('click', () => copyHex(c.hex, div));
    el.appendChild(div);
  });
}

function copyHex(hex, el) {
  navigator.clipboard.writeText(hex).then(() => {
    el.classList.add('copied');
    hint.textContent = 'copied ' + hex;
    hint.classList.add('flash');
    setTimeout(() => {
      el.classList.remove('copied');
      hint.textContent = 'click any swatch to copy its hex';
      hint.classList.remove('flash');
    }, 1100);
  }).catch(() => {
    hint.textContent = 'copy failed, your browser blocked it';
  });
}

// events
colorPicker.addEventListener('input', e => {
  hexInput.value = e.target.value;
  render(e.target.value);
});

hexInput.addEventListener('input', e => {
  let v = e.target.value.trim();
  if (!v.startsWith('#')) v = '#' + v;
  if (hexToRgb(v)) {
    colorPicker.value = v;
    render(v);
  }
});

// first paint
render(colorPicker.value);
