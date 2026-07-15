const CANCIONES = [
  { file: 'audio/WhatsApp Audio 2026-07-14 at 09.51.34.mpeg', nombre: 'Canción 1' },
  { file: 'audio/WhatsApp Audio 2026-07-14 at 09.52.42.mpeg', nombre: 'Canción 2' },
  { file: 'audio/WhatsApp Audio 2026-07-14 at 09.52.43 (1).mpeg', nombre: 'Canción 3' },
  { file: 'audio/WhatsApp Audio 2026-07-14 at 09.52.43.mpeg', nombre: 'Canción 4' },
  { file: 'audio/ytmp3free.cc_franco-mai-nunca-es-demasiado-tarde-video-oficial-youtubemp3free.org.mp3', nombre: 'Franco Mai — Nunca es Demasiado Tarde' },
  { file: 'audio/ytmp3free.cc_laseguimosencasa-formato-intimo-the-monkeys-crazy-san-justo-youtubemp3free.org (1).mp3', nombre: 'The Monkeys Crazy — La Seguimos en Casa' },
  { file: 'audio/ytmp3free.cc_soltar-youtubemp3free.org.mp3', nombre: 'Soltar' }
];

let orden = [];
let indice = 0;
let reproduciendo = false;
let duracionTotal = 0;

const audio = new Audio();
audio.volume = 0.3;

// --- Utilidades ---
function mezclar(arr) {
  const copia = [...arr];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

function formatearTiempo(seg) {
  if (isNaN(seg) || seg < 0) return '0:00';
  const m = Math.floor(seg / 60);
  const s = Math.floor(seg % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

// --- Lógica de reproducción ---
function cancionActual() {
  return orden[indice] || null;
}

function cargarCancion() {
  const c = cancionActual();
  if (!c) return;
  audio.src = c.file;
  audio.load();
  actualizarUI();
  actualizarColaActiva();
}

function reproducir() {
  audio.play().catch(() => {});
  reproduciendo = true;
  actualizarUI();
}

function pausar() {
  audio.pause();
  reproduciendo = false;
  actualizarUI();
}

function togglePlay() {
  if (orden.length === 0) {
    orden = mezclar(CANCIONES);
    indice = 0;
    cargarCancion();
    reproducir();
    return;
  }
  if (reproduciendo) pausar();
  else reproducir();
}

function siguiente() {
  if (orden.length === 0) {
    orden = mezclar(CANCIONES);
    indice = 0;
  } else {
    indice++;
    if (indice >= orden.length) {
      orden = mezclar(CANCIONES);
      indice = 0;
    }
  }
  cargarCancion();
  if (reproduciendo) reproducir();
}

function anterior() {
  if (orden.length === 0) {
    orden = mezclar(CANCIONES);
    indice = 0;
  } else {
    if (audio.currentTime > 2) {
      audio.currentTime = 0;
      return;
    }
    indice--;
    if (indice < 0) {
      orden = mezclar(CANCIONES);
      indice = orden.length - 1;
    }
  }
  cargarCancion();
  if (reproduciendo) reproducir();
}

function seleccionarCancion(idx) {
  if (idx === indice && orden.length > 0) {
    togglePlay();
    return;
  }
  indice = idx;
  cargarCancion();
  if (!reproduciendo) {
    reproduciendo = true;
    actualizarUI();
  }
  reproducir();
}

function shuffleAll() {
  orden = mezclar(CANCIONES);
  indice = 0;
  cargarCancion();
  if (!reproduciendo) {
    reproduciendo = true;
    actualizarUI();
  }
  reproducir();
}

// --- Eventos del audio ---
audio.addEventListener('ended', siguiente);
audio.addEventListener('timeupdate', actualizarProgreso);
audio.addEventListener('loadedmetadata', () => {
  duracionTotal = audio.duration;
  actualizarProgreso();
});

// --- UI ---
function crearPlayerUI() {
  const wrapper = document.createElement('div');
  wrapper.id = 'player-wrap';
  wrapper.innerHTML = `
    <div id="player-bar">
      <div id="player-left">
        <div id="player-cover">
          <svg viewBox="0 0 24 24" width="20" height="20"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.5" fill="none"/><circle cx="12" cy="12" r="3" fill="currentColor"/><line x1="12" y1="2" x2="12" y2="5" stroke="currentColor" stroke-width="1.5"/><line x1="12" y1="19" x2="12" y2="22" stroke="currentColor" stroke-width="1.5"/></svg>
        </div>
        <div id="player-info">
          <span id="player-song-name">Sin canción</span>
          <span id="player-artist-name">Rock en la Ciudad</span>
        </div>
      </div>
      <div id="player-center">
        <div id="player-controls">
          <button id="btn-prev" class="pc-btn" title="Anterior">
            <svg viewBox="0 0 24 24" width="18" height="18"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" fill="currentColor"/></svg>
          </button>
          <button id="btn-play" class="pc-btn pc-btn--play" title="Play/Pause">
            <svg viewBox="0 0 24 24" width="22" height="22" id="play-icon">
              <polygon points="8,5 19,12 8,19" fill="currentColor"/>
            </svg>
            <svg viewBox="0 0 24 24" width="22" height="22" id="pause-icon" style="display:none">
              <rect x="6" y="5" width="4" height="14" fill="currentColor"/><rect x="14" y="5" width="4" height="14" fill="currentColor"/>
            </svg>
          </button>
          <button id="btn-next" class="pc-btn" title="Siguiente">
            <svg viewBox="0 0 24 24" width="18" height="18"><path d="M18 6h2v12h-2zm-8.5 6l8.5 6V6z" fill="currentColor"/></svg>
          </button>
        </div>
        <div id="player-progress-wrap">
          <span id="player-time-current">0:00</span>
          <div id="player-progress-track">
            <div id="player-progress-fill"></div>
            <div id="player-progress-thumb"></div>
          </div>
          <span id="player-time-total">0:00</span>
        </div>
      </div>
      <div id="player-right">
        <div id="player-volume-wrap">
          <button id="btn-volume" class="pc-btn" title="Volumen">
            <svg viewBox="0 0 24 24" width="18" height="18" id="volume-icon"><path d="M11 5L6 9H2v6h4l5 4V5zM19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07" stroke="currentColor" stroke-width="1.8" fill="none" stroke-linecap="round"/></svg>
          </button>
          <div id="player-volume-slider">
            <div id="player-volume-fill"></div>
            <div id="player-volume-thumb"></div>
          </div>
        </div>
        <button id="btn-queue" class="pc-btn" title="Lista de reproducción">
          <svg viewBox="0 0 24 24" width="18" height="18"><line x1="3" y1="6" x2="21" y2="6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="3" y1="12" x2="21" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="3" y1="18" x2="21" y2="18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
        </button>
      </div>
    </div>
    <div id="player-queue" class="player-queue--hidden">
      <div id="player-queue-header">
        <span>PRÓXIMAS CANCIONES</span>
        <button id="btn-shuffle" class="pc-btn" title="Mezclar todo">
          <svg viewBox="0 0 24 24" width="16" height="16"><path d="M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/></svg>
          Mezclar
        </button>
      </div>
      <div id="player-queue-list"></div>
    </div>
  `;
  document.body.appendChild(wrapper);

  // Eventos
  document.getElementById('btn-play').addEventListener('click', togglePlay);
  document.getElementById('btn-next').addEventListener('click', siguiente);
  document.getElementById('btn-prev').addEventListener('click', anterior);
  document.getElementById('btn-queue').addEventListener('click', toggleCola);
  document.getElementById('btn-shuffle').addEventListener('click', shuffleAll);

  // Progreso - clic y arrastre
  const track = document.getElementById('player-progress-track');
  track.addEventListener('mousedown', (e) => iniciarArrastre(e, 'progreso'));
  track.addEventListener('click', (e) => setProgreso(e));

  // Volumen
  const volSlider = document.getElementById('player-volume-slider');
  document.getElementById('btn-volume').addEventListener('click', toggleMute);
  volSlider.addEventListener('mousedown', (e) => iniciarArrastre(e, 'volumen'));
  volSlider.addEventListener('click', (e) => setVolumen(e));

  actualizarUI();
}

function actualizarUI() {
  const c = cancionActual();
  const songName = document.getElementById('player-song-name');
  const playIcon = document.getElementById('play-icon');
  const pauseIcon = document.getElementById('pause-icon');

  songName.textContent = c ? c.nombre : 'Sin canción';
  songName.style.opacity = c ? '1' : '0.4';

  if (reproduciendo) {
    playIcon.style.display = 'none';
    pauseIcon.style.display = 'block';
  } else {
    playIcon.style.display = 'block';
    pauseIcon.style.display = 'none';
  }

  actualizarProgreso();
}

function actualizarProgreso() {
  const current = document.getElementById('player-time-current');
  const total = document.getElementById('player-time-total');
  const fill = document.getElementById('player-progress-fill');
  const thumb = document.getElementById('player-progress-thumb');

  const cur = audio.currentTime || 0;
  const dur = duracionTotal || audio.duration || 0;

  current.textContent = formatearTiempo(cur);
  total.textContent = formatearTiempo(dur);

  const pct = dur > 0 ? (cur / dur) * 100 : 0;
  fill.style.width = pct + '%';
  thumb.style.left = `calc(${pct}% - 6px)`;
}

function setProgreso(e) {
  const track = document.getElementById('player-progress-track');
  const rect = track.getBoundingClientRect();
  const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
  const dur = duracionTotal || audio.duration || 0;
  if (dur > 0) {
    audio.currentTime = pct * dur;
  }
}

let arrastrando = null;

function iniciarArrastre(e, tipo) {
  arrastrando = tipo;
  if (tipo === 'progreso') {
    setProgreso(e);
    document.addEventListener('mousemove', onArrastreProgreso);
  } else {
    setVolumen(e);
    document.addEventListener('mousemove', onArrastreVolumen);
  }
  document.addEventListener('mouseup', detenerArrastre);
}

function onArrastreProgreso(e) { setProgreso(e); }
function onArrastreVolumen(e) { setVolumen(e); }
function detenerArrastre() {
  arrastrando = null;
  document.removeEventListener('mousemove', onArrastreProgreso);
  document.removeEventListener('mousemove', onArrastreVolumen);
  document.removeEventListener('mouseup', detenerArrastre);
}

function setVolumen(e) {
  const slider = document.getElementById('player-volume-slider');
  const rect = slider.getBoundingClientRect();
  const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
  audio.volume = pct;
  actualizarVolumenUI(pct);
}

function actualizarVolumenUI(pct) {
  const fill = document.getElementById('player-volume-fill');
  const thumb = document.getElementById('player-volume-thumb');
  fill.style.width = (pct * 100) + '%';
  thumb.style.left = `calc(${pct * 100}% - 5px)`;
}

let muted = false;
let prevVolume = 0.3;

function toggleMute() {
  if (muted) {
    audio.volume = prevVolume;
    muted = false;
  } else {
    prevVolume = audio.volume;
    audio.volume = 0;
    muted = true;
  }
  actualizarVolumenUI(muted ? 0 : prevVolume);
}

function toggleCola() {
  const queue = document.getElementById('player-queue');
  const isHidden = queue.classList.contains('player-queue--hidden');
  queue.classList.toggle('player-queue--hidden');
  queue.classList.toggle('player-queue--visible');
  if (!isHidden) return;
  renderizarCola();
}

function renderizarCola() {
  const list = document.getElementById('player-queue-list');
  const canciones = orden.length > 0 ? orden : CANCIONES;
  const idxActual = orden.length > 0 ? indice : -1;

  list.innerHTML = canciones.map((c, i) => `
    <div class="queue-item ${i === idxActual ? 'queue-item--active' : ''}" data-queue-idx="${i}">
      <span class="queue-item__num">${i + 1}</span>
      <div class="queue-item__info">
        <span class="queue-item__name">${c.nombre}</span>
        <span class="queue-item__file">${c.file.replace('audio/', '')}</span>
      </div>
      ${i === idxActual && reproduciendo ? '<span class="queue-item__bars"><span></span><span></span><span></span></span>' : ''}
    </div>
  `).join('');

  list.querySelectorAll('.queue-item').forEach(el => {
    el.addEventListener('click', () => {
      const idx = parseInt(el.dataset.queueIdx);
      if (orden.length === 0) {
        orden = [...CANCIONES];
        indice = 0;
      }
      seleccionarCancion(idx);
      renderizarCola();
    });
  });
}

function actualizarColaActiva() {
  const list = document.getElementById('player-queue-list');
  if (!list) return;
  list.querySelectorAll('.queue-item').forEach(el => {
    const idx = parseInt(el.dataset.queueIdx);
    const isAct = idx === indice;
    el.classList.toggle('queue-item--active', isAct);
    const bars = el.querySelector('.queue-item__bars');
    if (isAct && reproduciendo) {
      if (!bars) {
        const b = document.createElement('span');
        b.className = 'queue-item__bars';
        b.innerHTML = '<span></span><span></span><span></span>';
        el.appendChild(b);
      }
    } else {
      if (bars) bars.remove();
    }
  });
}

// Inicializar
document.addEventListener('DOMContentLoaded', () => {
  crearPlayerUI();
  actualizarVolumenUI(audio.volume);
});
