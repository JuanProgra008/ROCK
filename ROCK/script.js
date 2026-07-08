import { initializeApp } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";
import {
  getFirestore,
  doc,
  increment,
  runTransaction,
  onSnapshot,
  setDoc,
  getDocs,
  collection
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyB4zSArMAQZT6oj8NlTQlfvnHZPGT0wAdo",
  authDomain: "rockenlaciudad-fa18e.firebaseapp.com",
  projectId: "rockenlaciudad-fa18e",
  storageBucket: "rockenlaciudad-fa18e.firebasestorage.app",
  messagingSenderId: "242192220878",
  appId: "1:242192220878:web:70fbfcad9c0c0c7b18069f"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const ENCUESTA_DOC = doc(db, 'votos', 'encuesta');
const VOTANTES_COL = 'votantes';

const BANDAS = [
  { id: 'off-meta', nombre: 'Off meta', color: '#4CC9F0', colorGlow: 'rgba(76,201,240,.5)' },
  { id: 'odixo', nombre: 'Odixo', color: '#FFD166', colorGlow: 'rgba(255,209,102,.5)' },
  { id: 'perros-de-berlin', nombre: 'Perros de Berlín', color: '#FF4D6D', colorGlow: 'rgba(255,77,109,.5)' },
  { id: 'the-monky-scrazy', nombre: 'The monky scrazy', color: '#F72585', colorGlow: 'rgba(247,37,133,.5)' },
  { id: 'vertiente', nombre: 'Vertiente', color: '#9D4EDD', colorGlow: 'rgba(157,78,221,.5)' },
  { id: 'los-chambers', nombre: 'Los chambers', color: '#00B4D8', colorGlow: 'rgba(0,180,216,.5)' },
  { id: 'la-oruga', nombre: 'La oruga', color: '#7209B7', colorGlow: 'rgba(114,9,183,.5)' },
  { id: 'nocturno', nombre: 'Nocturno', color: '#E63946', colorGlow: 'rgba(230,57,70,.5)' },
  { id: 'galaxia-cero', nombre: 'Galaxia cero', color: '#2A9D8F', colorGlow: 'rgba(42,157,143,.5)' },
  { id: 'the-new-blues-flame', nombre: 'The New Blues Flame', color: '#E76F51', colorGlow: 'rgba(231,111,81,.5)' },
  { id: 'gas', nombre: 'Gas', color: '#264653', colorGlow: 'rgba(38,70,83,.5)' },
  { id: 'humano', nombre: 'Humano', color: '#F4A261', colorGlow: 'rgba(244,162,97,.5)' },
  { id: 'la-piluso', nombre: 'La Piluso', color: '#E07A5F', colorGlow: 'rgba(224,122,95,.5)' },
  { id: 'melcet', nombre: 'Melcet', color: '#3D405B', colorGlow: 'rgba(61,64,91,.5)' },
  { id: 'charlie-y-su-banda', nombre: 'Charlie y su banda', color: '#81B29A', colorGlow: 'rgba(129,178,154,.5)' },
  { id: 'dm-y-amigos', nombre: 'DM y Amigos', color: '#D62828', colorGlow: 'rgba(214,40,40,.5)' },
  { id: 'franco-mai', nombre: 'Franco Mai', color: '#6A4C93', colorGlow: 'rgba(106,76,147,.5)' },
  { id: 'not-provide', nombre: 'Not Provide', color: '#1B4965', colorGlow: 'rgba(27,73,101,.5)' }
];

let votos = {};
let usuarioActual = null;
let unsubscribeSnapshot = null;

const VOTED_KEY = 'rockCiudad_yaVoto_v2';

function yaVotoLocal() {
  return !!localStorage.getItem(VOTED_KEY);
}

function marcarVotadoLocal(bandaId) {
  localStorage.setItem(VOTED_KEY, bandaId);
}

const bandsGrid = document.getElementById('bandsGrid');

function crearTarjetaBanda(banda, indice) {
  const card = document.createElement('article');
  card.className = 'band-card';
  card.style.setProperty('--i', indice);
  card.style.setProperty('--card-color', banda.color);
  card.style.setProperty('--card-glow', banda.colorGlow);

  const votosBanda = votos[banda.id] ?? 0;

  card.innerHTML = `
    <h3 class="band-card__name">${banda.nombre}</h3>
    <div class="band-card__footer">
      <button class="vote-btn" data-banda="${banda.id}" type="button">Votar</button>
      <div class="vote-count">
        <span class="vote-count__number" data-contador="${banda.id}">${votosBanda}</span>
        <span class="vote-count__label">VOTOS</span>
      </div>
    </div>
  `;
  return card;
}

function renderizarTarjetas() {
  bandsGrid.innerHTML = '';
  const yaVoto = yaVotoLocal();
  BANDAS.forEach((banda, i) => {
    const card = crearTarjetaBanda(banda, i);
    bandsGrid.appendChild(card);
    if (yaVoto) {
       const btn = card.querySelector('.vote-btn');
       if (btn) {
         btn.disabled = true;
         btn.textContent = 'Ya votaste';
       }
    }
  });
}

function marcarBotonComoVotado(btn) {
  btn.classList.add('is-voted');
  btn.textContent = 'Votado ✓';
  btn.disabled = true;
}

function crearRipple(e, btn) {
  const rect = btn.getBoundingClientRect();
  const ripple = document.createElement('span');
  const tam = Math.max(rect.width, rect.height);
  ripple.className = 'ripple';
  ripple.style.width = ripple.style.height = tam + 'px';
  ripple.style.left = (e.clientX - rect.left - tam / 2) + 'px';
  ripple.style.top = (e.clientY - rect.top - tam / 2) + 'px';
  btn.appendChild(ripple);
  setTimeout(() => ripple.remove(), 650);
}

function animarContador(elemento, desde, hasta) {
  const duracion = 500;
  const inicio = performance.now();
  function paso(ahora) {
    const progreso = Math.min((ahora - inicio) / duracion, 1);
    const valor = Math.round(desde + (hasta - desde) * progreso);
    elemento.textContent = valor;
    if (progreso < 1) requestAnimationFrame(paso);
  }
  requestAnimationFrame(paso);
}

const coloresConfeti = ['#FF4D6D', '#F72585', '#4CC9F0', '#FFD166', '#9D4EDD'];

function lanzarConfeti(contenedor) {
  contenedor.innerHTML = '';
  const cantidad = 18;
  for (let i = 0; i < cantidad; i++) {
    const pieza = document.createElement('span');
    pieza.className = 'confetti-piece';
    pieza.style.left = Math.random() * 100 + '%';
    pieza.style.background = coloresConfeti[Math.floor(Math.random() * coloresConfeti.length)];
    pieza.style.animationDelay = (Math.random() * 0.2) + 's';
    pieza.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
    contenedor.appendChild(pieza);
  }
  setTimeout(() => { contenedor.innerHTML = ''; }, 1300);
}

const toast = document.getElementById('voteToast');
const toastBand = document.getElementById('toastBand');
const toastConfetti = document.getElementById('toastConfetti');
let toastTimeout;

function mostrarToast(nombreBanda) {
  toastBand.textContent = nombreBanda;
  toast.classList.add('is-visible');
  lanzarConfeti(toastConfetti);
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => toast.classList.remove('is-visible'), 2600);
}

async function votar(bandaId, boton, evento) {
  if (yaVotoLocal() || !usuarioActual) return;

  crearRipple(evento, boton);

  try {
    await runTransaction(db, async (transaction) => {
      const refVotante = doc(db, VOTANTES_COL, usuarioActual.uid);
      const votanteSnap = await transaction.get(refVotante);

      if (votanteSnap.exists() && votanteSnap.data().votedFor && Object.keys(votanteSnap.data().votedFor).length > 0) {
        throw new Error('ya-votaste');
      }

      transaction.set(refVotante, { votedFor: { [bandaId]: true } }, { merge: true });
      transaction.set(ENCUESTA_DOC, { [bandaId]: increment(1) }, { merge: true });
    });

    marcarVotadoLocal(bandaId);
    
    document.querySelectorAll('.vote-btn').forEach(b => {
        b.disabled = true;
        b.textContent = 'Ya votaste';
    });

    const banda = BANDAS.find(b => b.id === bandaId);
    mostrarToast(banda.nombre);

  } catch (error) {
    if (error.message === 'ya-votaste') {
        alert('Ya has votado previamente.');
        document.querySelectorAll('.vote-btn').forEach(b => {
            b.disabled = true;
            b.textContent = 'Ya votaste';
        });
    } else {
      console.error('Error al votar:', error);
    }
  }
}

bandsGrid.addEventListener('click', (e) => {
  const boton = e.target.closest('.vote-btn');
  if (!boton || boton.disabled) return;
  votar(boton.dataset.banda, boton, e);
});

const barsWall = document.getElementById('barsWall');
const totalVotesNumber = document.getElementById('totalVotesNumber');
const leaderName = document.getElementById('leaderName');
const gapValue = document.getElementById('gapValue');

function obtenerTotalVotos() {
  return BANDAS.reduce((suma, b) => suma + (votos[b.id] || 0), 0);
}

function crearFilaResultado(banda, porcentaje) {
  const fila = document.createElement('div');
  fila.className = 'bar-row';
  fila.innerHTML = `
    <span class="bar-row__name">${banda.nombre}</span>
    <div class="bar-row__track">
      <div class="bar-row__fill" style="--bar-color:${banda.color}; --bar-color-2:${banda.colorGlow}"></div>
    </div>
    <span class="bar-row__pct">${porcentaje.toFixed(1)}%</span>
  `;
  return fila;
}

function renderizarResultados() {
  const total = obtenerTotalVotos();

  const ranking = [...BANDAS].sort((a, b) => (votos[b.id] || 0) - (votos[a.id] || 0));

  animarContador(totalVotesNumber, parseInt(totalVotesNumber.textContent) || 0, total);

  const primero = ranking[0];
  const segundo = ranking[1];
  leaderName.textContent = primero ? primero.nombre : '—';

  const pctPrimero = total > 0 ? ((votos[primero?.id] || 0) / total) * 100 : 0;
  const pctSegundo = total > 0 && segundo ? ((votos[segundo.id] || 0) / total) * 100 : 0;
  gapValue.textContent = (pctPrimero - pctSegundo).toFixed(1) + '%';

  barsWall.innerHTML = '';
  ranking.forEach(banda => {
    const pct = total > 0 ? ((votos[banda.id] || 0) / total) * 100 : 0;
    const fila = crearFilaResultado(banda, pct);
    barsWall.appendChild(fila);
    requestAnimationFrame(() => {
      const fill = fila.querySelector('.bar-row__fill');
      requestAnimationFrame(() => { fill.style.width = pct + '%'; });
    });
  });
}

function actualizarContadores() {
  BANDAS.forEach(banda => {
    const contador = document.querySelector(`[data-contador="${banda.id}"]`);
    if (contador) {
      const nuevoValor = votos[banda.id] || 0;
      const valorAnterior = parseInt(contador.textContent) || 0;
      if (nuevoValor !== valorAnterior) {
        animarContador(contador, valorAnterior, nuevoValor);
      }
    }
  });
}

async function resetVotes() {
  if (confirm('¿Estás seguro de que quieres resetear todos los votos a cero?')) {
    try {
      console.log("Intentando resetear...");
      const resetData = {};
      BANDAS.forEach(b => resetData[b.id] = 0);
      await setDoc(ENCUESTA_DOC, resetData);
      alert('Votos reseteados');
      console.log("Votos reseteados con éxito.");
    } catch (e) {
      console.error("Error reseteando:", e);
      alert("Error al resetear: " + e.message);
    }
  }
}

async function downloadVotersCSV() {
  try {
    console.log("Intentando descargar...");
    const votantesSnapshot = await getDocs(collection(db, VOTANTES_COL));
    let csvContent = "data:text/csv;charset=utf-8,Votante,Bandas Votadas\n";
    
    votantesSnapshot.forEach((doc) => {
      const data = doc.data();
      const voterId = doc.id;
      const votedFor = data.votedFor ? Object.keys(data.votedFor).join('; ') : '';
      csvContent += `${voterId},"${votedFor}"\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "votantes.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    console.log("Descarga iniciada.");
  } catch (error) {
    console.error('Error al descargar:', error);
    alert('Error al descargar votantes: ' + error.message);
  }
}

function renderizarAdminPanel() {
  const panel = document.getElementById('adminPanel');
  if (!panel) return;
  panel.innerHTML = `
    <button id="resetVotesBtn" style="margin: 5px; padding: 10px; background: #E63946; color: white; border: none; cursor: pointer;">Resetear Votos</button>
    <button id="downloadVotersBtn" style="margin: 5px; padding: 10px; background: #2A9D8F; color: white; border: none; cursor: pointer;">Descargar Excel (CSV)</button>
  `;
  document.getElementById('resetVotesBtn').addEventListener('click', resetVotes);
  document.getElementById('downloadVotersBtn').addEventListener('click', downloadVotersCSV);
}

function escucharVotos() {
  if (unsubscribeSnapshot) {
    unsubscribeSnapshot();
  }

  unsubscribeSnapshot = onSnapshot(ENCUESTA_DOC, (snapshot) => {
    if (snapshot.exists()) {
      votos = snapshot.data();
    } else {
      votos = {};
    }
    renderizarResultados();
    actualizarContadores();
  }, (error) => {
    console.error('Error en snapshot de votos:', error);
  });
}

async function iniciar() {
  document.documentElement.style.visibility = 'hidden';

  onAuthStateChanged(auth, (user) => {
    if (user) {
      usuarioActual = user;
      document.documentElement.style.visibility = 'visible';
      renderizarTarjetas();
      escucharVotos();
      if (user.email === 'valeprivado03@gmail.com') {
        renderizarAdminPanel();
      }
    } else {
      window.location.replace('login.html');
    }
  });
}

document.addEventListener('DOMContentLoaded', iniciar);
