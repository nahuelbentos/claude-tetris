'use strict';

const RECORDS_KEY = 'tetris.records';
const MAX_RECORDS = 5;

const startScreen = document.getElementById('start-screen');
const playBtn = document.getElementById('play-btn');
const resetRecordsBtn = document.getElementById('reset-records-btn');
const recordsGameover = document.getElementById('records-gameover');
const newRecordBadge = document.getElementById('new-record-badge');
const nameForm = document.getElementById('name-form');
const nameInput = document.getElementById('name-input');

// Indice (en la tabla) de la entrada resaltada, o -1
let highlightIndex = -1;

function loadRecords() {
  try {
    const raw = localStorage.getItem(RECORDS_KEY);
    const data = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(data)) return [];
    return data
      .filter(r => r && typeof r.score === 'number')
      .sort((a, b) => b.score - a.score)
      .slice(0, MAX_RECORDS);
  } catch (e) {
    return [];
  }
}

function saveRecords(list) {
  try {
    localStorage.setItem(RECORDS_KEY, JSON.stringify(list));
    return true;
  } catch (e) {
    return false;
  }
}

function qualifies(sc) {
  if (sc <= 0) return false;
  const list = loadRecords();
  return list.length < MAX_RECORDS || sc > list[list.length - 1].score;
}

function renderTable(container, list, hl) {
  container.textContent = '';
  if (!list.length) {
    const p = document.createElement('p');
    p.className = 'records-empty';
    p.textContent = 'Aún no hay records';
    container.appendChild(p);
    return;
  }
  const table = document.createElement('table');
  table.className = 'records-table';
  const head = table.createTHead().insertRow();
  ['#', 'Nombre', 'Puntos', 'Líneas', 'Combo'].forEach(t => {
    const th = document.createElement('th');
    th.textContent = t;
    head.appendChild(th);
  });
  const body = table.createTBody();
  list.forEach((r, i) => {
    const tr = body.insertRow();
    if (i === hl) tr.className = 'current';
    const cells = [i + 1, r.name || '---', (r.score || 0).toLocaleString(), r.lines || 0, r.maxCombo || 0];
    cells.forEach((v, j) => {
      const td = tr.insertCell();
      td.textContent = v;
      if (j === 1) td.className = 'name';
    });
  });
  container.appendChild(table);
}

// Mejor combo y maximo de lineas de siempre (incluye la partida en curso si se pasa)
function renderStats(el, list, extra) {
  const bestCombo = Math.max(0, ...list.map(r => r.maxCombo || 0), extra ? extra.maxCombo : 0);
  const bestLines = Math.max(0, ...list.map(r => r.lines || 0), extra ? extra.lines : 0);
  el.textContent = `Mejor combo: ${bestCombo} · Máximo de líneas: ${bestLines}`;
}

function showStartScreen() {
  const list = loadRecords();
  renderTable(document.getElementById('records-table-start'), list, -1);
  renderStats(document.getElementById('records-stats-start'), list);
  startScreen.classList.remove('hidden');
}

function renderGameOver(listOverride) {
  const list = listOverride || loadRecords();
  renderTable(document.getElementById('records-table-go'), list, highlightIndex);
  renderStats(document.getElementById('records-stats-go'), list);
}

function onGameStart() {
  highlightIndex = -1;
  recordsGameover.classList.add('hidden');
  newRecordBadge.classList.add('hidden');
  nameForm.classList.add('hidden');
}

function onGameOver() {
  highlightIndex = -1;
  recordsGameover.classList.remove('hidden');
  renderGameOver();
  if (qualifies(score)) {
    newRecordBadge.classList.remove('hidden');
    nameForm.classList.remove('hidden');
    nameInput.value = '';
    nameInput.focus();
  } else {
    newRecordBadge.classList.add('hidden');
    nameForm.classList.add('hidden');
  }
}

nameForm.addEventListener('submit', e => {
  e.preventDefault();
  const entry = {
    name: nameInput.value.trim().slice(0, 12) || 'Anónimo',
    score,
    lines,
    maxCombo,
    date: new Date().toISOString(),
  };
  const list = loadRecords();
  list.push(entry);
  list.sort((a, b) => b.score - a.score);
  const top = list.slice(0, MAX_RECORDS);
  saveRecords(top);
  highlightIndex = top.indexOf(entry);
  nameForm.classList.add('hidden');
  renderGameOver(top);
});

playBtn.addEventListener('click', () => {
  startScreen.classList.add('hidden');
  playBtn.blur();
  init();
});

resetRecordsBtn.addEventListener('click', () => {
  if (!confirm('¿Borrar todos los records?')) return;
  try { localStorage.removeItem(RECORDS_KEY); } catch (e) { /* ignorar */ }
  showStartScreen();
});

showStartScreen();
