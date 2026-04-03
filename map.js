// ── CONFIG ──────────────────────────────────────────────────────────────────
const FRANCE_CENTER = [46.5, 2.5];
const FRANCE_ZOOM   = 6;
const TRAJET_COLOR  = '#c9382a';

// ── MAP INIT ─────────────────────────────────────────────────────────────────
const map = L.map('map', {
  center: FRANCE_CENTER,
  zoom: FRANCE_ZOOM,
  zoomControl: true,
  attributionControl: true
});

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© <a href="https://openstreetmap.org">OpenStreetMap</a>',
  maxZoom: 18
}).addTo(map);

// ── HELPERS ──────────────────────────────────────────────────────────────────
function formatDate(str) {
  if (!str) return '';
  const d = new Date(str);
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
}

function haversineKm(coords) {
  // Sum distance along a LineString
  let total = 0;
  for (let i = 0; i < coords.length - 1; i++) {
    const [lon1, lat1] = coords[i];
    const [lon2, lat2] = coords[i + 1];
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)**2;
    total += R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  }
  return Math.round(total);
}

// ── PANEL ────────────────────────────────────────────────────────────────────
const panel      = document.getElementById('interview-panel');
const panelClose = document.getElementById('panel-close');

function openPanel(props) {
  document.getElementById('panel-name').textContent     = props.nom || '—';
  document.getElementById('panel-metier').textContent   = props.metier || '';
  document.getElementById('panel-date').textContent     = formatDate(props.date);
  document.getElementById('panel-location').textContent = props.lieu || '';
  document.getElementById('panel-quote').textContent    = props.quote ? `« ${props.quote} »` : '';

  const videoDiv = document.getElementById('panel-video');
  if (props.youtube_id) {
    videoDiv.innerHTML = `<iframe
      src="https://www.youtube.com/embed/${props.youtube_id}?rel=0&modestbranding=1"
      allowfullscreen
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture">
    </iframe>`;
  } else {
    videoDiv.innerHTML = `<div class="panel-video-placeholder">Vidéo à venir</div>`;
  }

  panel.classList.remove('hidden');
}

function closePanel() {
  panel.classList.add('hidden');
  const videoDiv = document.getElementById('panel-video');
  videoDiv.innerHTML = '';
}

panelClose.addEventListener('click', closePanel);

// ── LOAD DATA ────────────────────────────────────────────────────────────────
let totalKm      = 0;
let nbTrajets    = 0;
let nbInterviews = 0;

Promise.all([
  fetch('data/trajets.geojson').then(r => r.json()),
  fetch('data/interviews.geojson').then(r => r.json())
]).then(([trajets, interviews]) => {

  // — Trajets —
  nbTrajets = trajets.features.length;

  L.geoJSON(trajets, {
    style: {
      color: TRAJET_COLOR,
      weight: 3,
      opacity: 0.8,
      dashArray: null
    },
    onEachFeature(feature, layer) {
      const p = feature.properties;
      // Accumulate km (use stored value or compute)
      totalKm += p.km || haversineKm(feature.geometry.coordinates);

      layer.on('mouseover', () => layer.setStyle({ weight: 5, opacity: 1 }));
      layer.on('mouseout',  () => layer.setStyle({ weight: 3, opacity: 0.8 }));
      layer.bindTooltip(
        `<strong>${p.de} → ${p.a}</strong><br>${formatDate(p.date)}`,
        { sticky: true, className: 'trajet-tooltip' }
      );
    }
  }).addTo(map);

  // — Interviews —
  nbInterviews = interviews.features.length;

  interviews.features.forEach(feature => {
    const [lon, lat] = feature.geometry.coordinates;
    const props = feature.properties;

    const icon = L.divIcon({
      className: '',
      html: '<div class="pulse-marker"></div>',
      iconSize: [14, 14],
      iconAnchor: [7, 7]
    });

    const marker = L.marker([lat, lon], { icon }).addTo(map);
    marker.on('click', () => openPanel(props));
  });

  // — Stats —
  document.getElementById('nb-trajets').textContent   = nbTrajets;
  document.getElementById('nb-interviews').textContent = nbInterviews;
  document.getElementById('nb-km').textContent        = totalKm.toLocaleString('fr-FR');

}).catch(err => {
  console.error('Erreur de chargement des données :', err);
});
