'use strict';

// Menú de pausa: Reanudar, Reiniciar, Ver controles y Nivel inicial.
// Depende de los globales de game.js (paused, gameOver, startLevel, init, togglePause...).

const pauseMenu = document.getElementById('pause-menu');
const pmButtons = ['pm-resume', 'pm-restart', 'pm-controls', 'pm-level']
  .map(id => document.getElementById(id));
const pmControlsList = document.getElementById('pm-controls-list');
const pmLevelVal = document.getElementById('pm-level-val');
let pmLastKey = null;

function showPauseMenu() {
  pmLevelVal.textContent = startLevel;
  pmControlsList.classList.add('hidden');
  pmButtons[2].setAttribute('aria-expanded', 'false');
  pauseMenu.classList.remove('hidden');
  pmButtons[0].focus();
}

function hidePauseMenu() {
  pauseMenu.classList.add('hidden');
  if (pauseMenu.contains(document.activeElement)) document.activeElement.blur();
}

function setStartLevel(v) {
  startLevel = Math.min(10, Math.max(1, v));
  pmLevelVal.textContent = startLevel;
  try { localStorage.setItem('tetris.startLevel', String(startLevel)); } catch (e) { /* ignorar */ }
}

// Solo se ignora la tecla que activó el botón (clic por teclado, detail === 0).
pmButtons[0].addEventListener('click', e => {
  swallowKey = e.detail === 0 ? pmLastKey : null;
  togglePause();
});
pmButtons[1].addEventListener('click', e => {
  init();
  swallowKey = e.detail === 0 ? pmLastKey : null;
});
pmButtons[2].addEventListener('click', () => {
  const open = pmControlsList.classList.toggle('hidden') === false;
  pmButtons[2].setAttribute('aria-expanded', String(open));
});
pmButtons[3].addEventListener('click', e => {
  // Clic en la mitad izquierda baja el nivel; en la derecha o con Enter sube (cicla).
  const rect = pmButtons[3].getBoundingClientRect();
  if (e.detail > 0 && e.clientX < rect.left + rect.width / 2) setStartLevel(startLevel - 1);
  else setStartLevel(startLevel >= 10 ? 1 : startLevel + 1);
});

// Navegación por teclado dentro del menú (game.js ignora todo mientras paused).
document.addEventListener('keydown', e => {
  if (!paused || gameOver) return;
  pmLastKey = e.code;
  const idx = pmButtons.indexOf(document.activeElement);
  switch (e.code) {
    case 'ArrowDown':
      e.preventDefault();
      pmButtons[(idx + 1) % pmButtons.length].focus();
      break;
    case 'ArrowUp':
      e.preventDefault();
      pmButtons[(idx - 1 + pmButtons.length) % pmButtons.length].focus();
      break;
    case 'ArrowLeft':
      if (idx === 3) { e.preventDefault(); setStartLevel(startLevel - 1); }
      break;
    case 'ArrowRight':
      if (idx === 3) { e.preventDefault(); setStartLevel(startLevel + 1); }
      break;
    case 'Space':
      e.preventDefault(); // evitar que Espacio active el botón enfocado
      break;
  }
});
