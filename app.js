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

// hsl -> rgb. chroma + X + m method.
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

// dom
const colorPicker = document.getElementById('colorPicker');
const hexInput = document.getElementById('hexInput');
const baseSwatch = document.getElementById('baseSwatch');
const baseInfo = document.getElementById('baseInfo');

function render(hex) {
  const rgb = hexToRgb(hex);
  if (!rgb) return;
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

  baseSwatch.style.background = hex;
  baseInfo.innerHTML =
    `<div>${hex}</div>` +
    `<div>rgb(${rgb.r}, ${rgb.g}, ${rgb.b})</div>` +
    `<div>hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)</div>`;
}

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

render(colorPicker.value);
