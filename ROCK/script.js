import { initializeApp } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";
import {
  getFirestore,
  doc,
  increment,
  runTransaction,
  onSnapshot
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
  {
    id: 'soda-stereo',
    nombre: 'Soda Stereo',
    genero: 'Rock / New Wave',
    anio: 1982,
    descripcion: 'El trío que redefinió el rock en español con capas de sintetizadores y guitarras filosas.',
    color: '#4CC9F0',
    colorGlow: 'rgba(76,201,240,.5)'
  },
  {
    id: 'redonditos',
    nombre: 'Los Redonditos de Ricota',
    genero: 'Rock nacional',
    anio: 1976,
    descripcion: 'Poesía urbana, riffs hipnóticos y una legión de fans que se saben cada verso de memoria.',
    color: '#FFD166',
    colorGlow: 'rgba(255,209,102,.5)'
  },
  {
    id: 'la-renga',
    nombre: 'La Renga',
    genero: 'Hard Rock',
    anio: 1988,
    descripcion: 'Actitud de barrio y descargas de energía cruda que hacen temblar cualquier estadio.',
    color: '#FF4D6D',
    colorGlow: 'rgba(255,77,109,.5)'
  },
  {
    id: 'divididos',
    nombre: 'Divididos',
    genero: 'Rock Alternativo',
    anio: 1988,
    descripcion: 'Groove pesado, guitarras distorsionadas y una mezcla única de folklore y rock pesado.',
    color: '#F72585',
    colorGlow: 'rgba(247,37,133,.5)'
  },
  {
    id: 'airbag',
    nombre: 'Airbag',
    genero: 'Rock Alternativo',
    anio: 1997,
    descripcion: 'Melodías directas y estribillos gigantes que llenan cualquier campo de himnos coreados.',
    color: '#9D4EDD',
    colorGlow: 'rgba(157,78,221,.5)'
  },
  {
    id: 'los-piojos',
    nombre: 'Los Piojos',
    genero: 'Rock / R&B',
    anio: 1988,
    descripcion: 'Rock callejero con aires de blues y murga que atrapó a toda una generación.',
    color: '#00B4D8',
    colorGlow: 'rgba(0,180,216,.5)'
  },
  {
    id: 'pastillas-del-abuelo',
    nombre: 'Las Pastillas del Abuelo',
    genero: 'Rock / Reggae',
    anio: 2002,
    descripcion: 'Letras profundas y un sonido que fusiona rock con reggae, ska y folklore.',
    color: '#7209B7',
    colorGlow: 'rgba(114,9,183,.5)'
  },
  {
    id: 'ciro-y-los-persas',
    nombre: 'Ciro y los Persas',
    genero: 'Rock / Fusión',
    anio: 2009,
    descripcion: 'La voz de Los Piojos continúa su legado con un power trío arrollador.',
    color: '#E63946',
    colorGlow: 'rgba(230,57,70,.5)'
  },
  {
    id: 'bersuit',
    nombre: 'Bersuit Vergarabat',
    genero: 'Rock / Murga',
    anio: 1987,
    descripcion: 'Rock experimental con coros de murga, letras ácidas y un show eléctrico.',
    color: '#2A9D8F',
    colorGlow: 'rgba(42,157,143,.5)'
  },
  {
    id: 'carajo',
    nombre: 'Carajo',
    genero: 'Hard Rock / Metal',
    anio: 1996,
    descripcion: 'Potencia pura, riffs demoledores y una energía que no da tregua en vivo.',
    color: '#E76F51',
    colorGlow: 'rgba(231,111,81,.5)'
  },
  {
    id: 'babasonicos',
    nombre: 'Babasónicos',
    genero: 'Rock Alternativo',
    anio: 1991,
    descripcion: 'Vanguardia y actitud, la banda que suena siempre un paso adelante.',
    color: '#264653',
    colorGlow: 'rgba(38,70,83,.5)'
  },
  {
    id: 'rata-blanca',
    nombre: 'Rata Blanca',
    genero: 'Heavy Metal',
    anio: 1985,
    descripcion: 'Guitarras neoclásicas y power metal con himnos que cruzaron fronteras.',
    color: '#F4A261',
    colorGlow: 'rgba(244,162,97,.5)'
  },
  {
    id: 'almafuerte',
    nombre: 'Almafuerte',
    genero: 'Heavy Metal',
    anio: 1995,
    descripcion: 'Metal con impronta nacional, letras de lucha y un sonido inconfundible.',
    color: '#E07A5F',
    colorGlow: 'rgba(224,122,95,.5)'
  },
  {
    id: 'calamaro',
    nombre: 'Andrés Calamaro',
    genero: 'Rock / Pop',
    anio: 1981,
    descripcion: 'Cantor y compositor inmenso, dueño de un cancionero que es banda sonora de vidas.',
    color: '#3D405B',
    colorGlow: 'rgba(61,64,91,.5)'
  },
  {
    id: 'fito-paez',
    nombre: 'Fito Páez',
    genero: 'Rock / Pop',
    anio: 1981,
    descripcion: 'Pianista y poeta, sus canciones son joyas que emocionan generación tras generación.',
    color: '#81B29A',
    colorGlow: 'rgba(129,178,154,.5)'
  },
  {
    id: 'attaque-77',
    nombre: 'Attaque 77',
    genero: 'Punk Rock',
    anio: 1987,
    descripcion: 'Punk melódico con actitud callejera y estribillos que invitan al pogo.',
    color: '#D62828',
    colorGlow: 'rgba(214,40,40,.5)'
  },
  {
    id: 'fabulosos-cadillacs',
    nombre: 'Los Fabulosos Cadillacs',
    genero: 'Ska / Rock',
    anio: 1985,
    descripcion: 'La fusión definitiva de ska, punk, reggae y rock con una puesta en escena apabullante.',
    color: '#6A4C93',
    colorGlow: 'rgba(106,76,147,.5)'
  },
  {
    id: 'vela-puerca',
    nombre: 'La Vela Puerca',
    genero: 'Rock / Ska',
    anio: 1995,
    descripcion: 'Energía uruguaya pura: ska acelerado, letras vitales y un directo demoledor.',
    color: '#1B4965',
    colorGlow: 'rgba(27,73,101,.5)'
  }
];

let votos = {};
let usuarioActual = null;
let unsubscribeSnapshot = null;

const VOTED_KEY = 'rockCiudad_yaVoto_v1';

function yaVotoLocal(bandaId) {
  const registro = localStorage.getItem(VOTED_KEY);
  if (!registro) return false;
  try { return JSON.parse(registro).includes(bandaId); } catch (e) { return false; }
}

function marcarVotadoLocal(bandaId) {
  let registro = [];
  const guardado = localStorage.getItem(VOTED_KEY);
  if (guardado) { try { registro = JSON.parse(guardado); } catch (e) {} }
  if (!registro.includes(bandaId)) {
    registro.push(bandaId);
    localStorage.setItem(VOTED_KEY, JSON.stringify(registro));
  }
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
    <span class="band-card__genre">${banda.genero}</span>
    <h3 class="band-card__name">${banda.nombre}</h3>
    <p class="band-card__year">DESDE ${banda.anio}</p>
    <p class="band-card__desc">${banda.descripcion}</p>
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
  BANDAS.forEach((banda, i) => {
    const card = crearTarjetaBanda(banda, i);
    bandsGrid.appendChild(card);
  });

  BANDAS.forEach(banda => {
    if (yaVotoLocal(banda.id)) {
      const btn = document.querySelector(`.vote-btn[data-banda="${banda.id}"]`);
      if (btn) marcarBotonComoVotado(btn);
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
  if (yaVotoLocal(bandaId) || !usuarioActual) return;

  crearRipple(evento, boton);

  try {
    await runTransaction(db, async (transaction) => {
      const refVotante = doc(db, VOTANTES_COL, usuarioActual.uid);
      const votanteSnap = await transaction.get(refVotante);

      let votedFor = {};
      if (votanteSnap.exists()) {
        votedFor = votanteSnap.data().votedFor || {};
      }

      if (votedFor[bandaId]) {
        throw new Error('ya-votaste');
      }

      votedFor[bandaId] = true;
      transaction.set(refVotante, { votedFor }, { merge: true });
      transaction.set(ENCUESTA_DOC, { [bandaId]: increment(1) }, { merge: true });
    });

    marcarVotadoLocal(bandaId);
    marcarBotonComoVotado(boton);

    const banda = BANDAS.find(b => b.id === bandaId);
    mostrarToast(banda.nombre);

  } catch (error) {
    if (error.message === 'ya-votaste') {
      marcarBotonComoVotado(boton);
      marcarVotadoLocal(bandaId);
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
    } else {
      window.location.replace('login.html');
    }
  });
}

document.addEventListener('DOMContentLoaded', iniciar);
