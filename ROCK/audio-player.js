const CANCIONES = [
  'audio/WhatsApp Audio 2026-07-14 at 09.51.34.mpeg',
  'audio/WhatsApp Audio 2026-07-14 at 09.52.42.mpeg',
  'audio/WhatsApp Audio 2026-07-14 at 09.52.43 (1).mpeg',
  'audio/WhatsApp Audio 2026-07-14 at 09.52.43.mpeg',
  'audio/ytmp3free.cc_franco-mai-nunca-es-demasiado-tarde-video-oficial-youtubemp3free.org.mp3',
  'audio/ytmp3free.cc_laseguimosencasa-formato-intimo-the-monkeys-crazy-san-justo-youtubemp3free.org (1).mp3',
  'audio/ytmp3free.cc_soltar-youtubemp3free.org.mp3'
];

function mezclar(arr) {
  const copia = [...arr];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

let orden = [];
let indice = 0;
let reproduciendo = false;
let iniciado = false;

const audio = new Audio();
audio.volume = 0.3;

function siguienteCancion() {
  if (orden.length === 0) {
    orden = mezclar(CANCIONES);
    indice = 0;
  }
  if (indice >= orden.length) {
    orden = mezclar(CANCIONES);
    indice = 0;
  }
  const src = orden[indice];
  audio.src = src;
  indice++;
}

function avanzar() {
  siguienteCancion();
  if (reproduciendo) {
    audio.play().catch(() => {});
  }
}

audio.addEventListener('ended', avanzar);

function toggleMusica() {
  if (!iniciado) {
    orden = mezclar(CANCIONES);
    indice = Math.floor(Math.random() * CANCIONES.length);
    reproduciendo = true;
    iniciado = true;
    siguienteCancion();
    audio.play().catch(() => {});
    actualizarBoton(true);
  } else if (reproduciendo) {
    audio.pause();
    reproduciendo = false;
    actualizarBoton(false);
  } else {
    audio.play().catch(() => {});
    reproduciendo = true;
    actualizarBoton(true);
  }
}

function actualizarBoton(encendido) {
  const btn = document.getElementById('musicToggle');
  if (!btn) return;
  btn.textContent = encendido ? '♫ MUSIC ON' : '♫ MUSIC OFF';
  btn.classList.toggle('is-playing', encendido);
}

const estiloBtn = document.createElement('style');
estiloBtn.textContent = `
  #musicToggle {
    position: fixed;
    bottom: 24px;
    right: 24px;
    z-index: 9999;
    background: rgba(0,0,0,0.75);
    backdrop-filter: blur(8px);
    border: 2px solid rgba(255,255,255,0.15);
    color: #ccc;
    font-family: 'JetBrains Mono', monospace;
    font-size: 13px;
    font-weight: 700;
    padding: 10px 18px;
    border-radius: 40px;
    cursor: pointer;
    letter-spacing: 0.5px;
    transition: all 0.25s ease;
    user-select: none;
  }
  #musicToggle:hover {
    background: rgba(0,0,0,0.9);
    border-color: rgba(255,255,255,0.3);
    color: #fff;
  }
  #musicToggle.is-playing {
    border-color: #4CC9F0;
    color: #4CC9F0;
    box-shadow: 0 0 16px rgba(76,201,240,0.25);
  }
`;
document.head.appendChild(estiloBtn);

document.addEventListener('DOMContentLoaded', () => {
  const btn = document.createElement('button');
  btn.id = 'musicToggle';
  btn.textContent = '♫ MUSIC OFF';
  document.body.appendChild(btn);
  btn.addEventListener('click', toggleMusica);
});
