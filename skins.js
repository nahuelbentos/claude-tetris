'use strict';

// Temas visuales. Cargar ANTES de game.js.
// Cada skin: colors[] (índice 1-7), boardBg, gridColor, pageBg, drawBlock(ctx,x,y,color,size,alpha)

const SKIN_STORAGE_KEY = 'tetris.skin';

function skinRoundRect(c, x, y, w, h, r) {
  c.beginPath();
  if (typeof c.roundRect === 'function') {
    c.roundRect(x, y, w, h, r);
  } else {
    c.moveTo(x + r, y);
    c.arcTo(x + w, y, x + w, y + h, r);
    c.arcTo(x + w, y + h, x, y + h, r);
    c.arcTo(x, y + h, x, y, r);
    c.arcTo(x, y, x + w, y, r);
    c.closePath();
  }
}

const SKINS = {
  retro: {
    name: 'Retro',
    colors: [null, '#4dd0e1', '#ffd54f', '#ba68c8', '#81c784', '#e57373', '#7986cb', '#ffb74d'],
    boardBg: '#1a1a25',
    gridColor: '#22222e',
    pageBg: '#0f0f17',
    drawBlock(c, x, y, color, size, alpha) {
      c.globalAlpha = alpha ?? 1;
      c.fillStyle = color;
      c.fillRect(x * size + 1, y * size + 1, size - 2, size - 2);
      c.fillStyle = 'rgba(255,255,255,0.12)';
      c.fillRect(x * size + 1, y * size + 1, size - 2, 4);
      c.globalAlpha = 1;
    },
  },

  neon: {
    name: 'Neon',
    colors: [null, '#00f0ff', '#fff200', '#d500ff', '#39ff14', '#ff1744', '#4d6bff', '#ff9100'],
    boardBg: '#000000',
    gridColor: '#14141c',
    pageBg: '#000000',
    drawBlock(c, x, y, color, size, alpha) {
      c.globalAlpha = alpha ?? 1;
      c.shadowColor = color;
      c.shadowBlur = 12;
      c.fillStyle = color;
      c.fillRect(x * size + 3, y * size + 3, size - 6, size - 6);
      c.shadowBlur = 0;
      c.shadowColor = 'transparent';
      c.strokeStyle = 'rgba(255,255,255,0.7)';
      c.lineWidth = 1;
      c.strokeRect(x * size + 3.5, y * size + 3.5, size - 7, size - 7);
      c.globalAlpha = 1;
    },
  },

  pastel: {
    name: 'Pastel',
    colors: [null, '#a8e6ef', '#fff1b0', '#e1bee7', '#c8e6c9', '#ffc1c1', '#c5cae9', '#ffe0b2'],
    boardBg: '#fdf6f0',
    gridColor: '#efe4da',
    pageBg: '#f3e9f5',
    drawBlock(c, x, y, color, size, alpha) {
      c.globalAlpha = alpha ?? 1;
      c.fillStyle = color;
      skinRoundRect(c, x * size + 2, y * size + 2, size - 4, size - 4, 8);
      c.fill();
      c.fillStyle = 'rgba(255,255,255,0.45)';
      skinRoundRect(c, x * size + 6, y * size + 5, size - 14, 5, 2.5);
      c.fill();
      c.globalAlpha = 1;
    },
  },

  pixel: {
    name: 'Pixel art',
    colors: [null, '#29adff', '#ffec27', '#b13e53', '#00e436', '#ff004d', '#3b5dc9', '#ffa300'],
    boardBg: '#1d2b53',
    gridColor: '#16213f',
    pageBg: '#0b1026',
    drawBlock(c, x, y, color, size, alpha) {
      const px = x * size, py = y * size, s = 3;
      c.globalAlpha = alpha ?? 1;
      c.fillStyle = color;
      c.fillRect(px, py, size, size);
      // checker texture
      c.fillStyle = 'rgba(255,255,255,0.18)';
      for (let i = 0; i < size; i += s) {
        for (let j = 0; j < size; j += s) {
          if (((i + j) / s) % 2 === 0) c.fillRect(px + i, py + j, s, s);
        }
      }
      // pixel border
      c.fillStyle = 'rgba(0,0,0,0.45)';
      c.fillRect(px, py, size, 2);
      c.fillRect(px, py + size - 2, size, 2);
      c.fillRect(px, py, 2, size);
      c.fillRect(px + size - 2, py, 2, size);
      c.globalAlpha = 1;
    },
  },
};

let activeSkinName = 'retro';

function activeSkin() {
  return SKINS[activeSkinName];
}

function applySkin(name) {
  if (!Object.prototype.hasOwnProperty.call(SKINS, name)) name = 'retro';
  activeSkinName = name;
  const s = SKINS[name];
  const root = document.documentElement;
  root.style.setProperty('--page-bg', s.pageBg);
  root.style.setProperty('--board-bg', s.boardBg);
  document.body.dataset.skin = name;
  const sel = document.getElementById('skin-select');
  if (sel && sel.value !== name) sel.value = name;
}

function setSkin(name) {
  applySkin(name);
  try { localStorage.setItem(SKIN_STORAGE_KEY, activeSkinName); } catch (e) { /* ignorar */ }
  if (typeof redrawAll === 'function') redrawAll();
}

function initSkins() {
  let saved = null;
  try { saved = localStorage.getItem(SKIN_STORAGE_KEY); } catch (e) { /* ignorar */ }
  applySkin(saved);
  const sel = document.getElementById('skin-select');
  if (sel) {
    sel.addEventListener('keydown', e => { if (e.code === 'Escape') sel.blur(); });
    sel.addEventListener('change', () => {
      setSkin(sel.value);
      sel.blur();
    });
  }
}

initSkins();
