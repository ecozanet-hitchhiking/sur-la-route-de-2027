// ── DONNÉES VOYAGES ──────────────────────────────────────────────────────────
const VOYAGES = [
  {
    id: 'paris-trieste',
    titre: 'Paris → Trieste',
    annee: '2022',
    partenaires: 'Erwan & Thomas',
    couleur: '#4A90D9',
    stats: { km: 1400, jours: 8, conducteurs: 22 },
    coords: [
      [2.3522, 48.8566],   // Paris
      [4.8357, 45.7640],   // Lyon
      [6.1432, 46.2044],   // Genève
      [8.9503, 46.0037],   // Bellinzone
      [9.1859, 45.4654],   // Milan
      [11.3426, 44.4938],  // Bologne
      [13.7768, 45.6495],  // Trieste
    ]
  },
  {
    id: 'paris-oviedo',
    titre: 'Paris → Oviedo → Bayonne',
    annee: '2023',
    partenaires: 'Erwan & Thomas',
    couleur: '#E8A838',
    stats: { km: 2100, jours: 10, conducteurs: 31 },
    coords: [
      [2.3522, 48.8566],   // Paris
      [0.1032, 47.3900],   // Tours
      [-0.5800, 44.8378],  // Bordeaux
      [-1.5586, 43.3183],  // Bayonne
      [-1.9812, 43.3128],  // San Sebastián
      [-3.8196, 43.4623],  // Santander
      [-5.8448, 43.3614],  // Oviedo
      [-3.8196, 43.4623],  // Santander (retour)
      [-1.9812, 43.3128],  // San Sebastián
      [-1.5586, 43.3183],  // Bayonne
    ]
  },
  {
    id: 'paris-polaire',
    titre: 'Paris → Cercle Polaire',
    annee: '2023',
    partenaires: 'Erwan & Thomas',
    couleur: '#5EC48A',
    stats: { km: 4800, jours: 12, conducteurs: 58 },
    coords: [
      [2.3522, 48.8566],   // Paris
      [4.9041, 52.3676],   // Amsterdam
      [9.9937, 53.5511],   // Hamburg
      [10.2045, 56.1629],  // Aarhus
      [10.4036, 63.4305],  // Trondheim
      [14.4049, 67.2804],  // Mo i Rana
      [15.3919, 68.4385],  // Cercle Polaire
      [18.9553, 69.6492],  // Tromsø
    ]
  },
  {
    id: 'usa',
    titre: 'New York → San Francisco → New York',
    annee: '2025',
    partenaires: 'Erwan (solo)',
    couleur: '#C9382A',
    stats: { km: 16000, jours: 78, conducteurs: 188 },
    coords: [
      [-74.0060, 40.7128],  // New York
      [-77.0369, 38.9072],  // Washington DC
      [-79.9959, 32.7765],  // Charleston SC
      [-84.3880, 30.4383],  // Tallahassee FL
      [-85.3905, 31.0000],  // Alabama
      [-88.0399, 30.6954],  // Biloxi MS
      [-89.9290, 29.9511],  // New Orleans
      [-97.7431, 30.2672],  // Austin TX
      [-106.4850, 31.7619], // El Paso
      [-110.9265, 32.2226], // Tucson AZ
      [-112.0740, 33.4484], // Phoenix
      [-117.1611, 32.7157], // San Diego
      [-118.2437, 34.0522], // Los Angeles
      [-119.4179, 36.7783], // Fresno
      [-122.4194, 37.7749], // San Francisco
      [-121.8863, 37.3382], // San José
      [-119.8138, 39.5296], // Reno NV
      [-111.8910, 40.7608], // Salt Lake City
      [-104.9903, 39.7392], // Denver CO
      [-97.3301, 37.6872],  // Wichita KS
      [-93.2650, 44.9778],  // Minneapolis
      [-87.6298, 41.8781],  // Chicago
      [-84.5120, 39.1031],  // Cincinnati
      [-80.1918, 25.7617],  // Miami (détour)
      [-74.0060, 40.7128],  // New York
    ]
  }
];

// ── MAP INIT ─────────────────────────────────────────────────────────────────
const map = L.map('map-voyages', {
  center: [45, 5],
  zoom: 4,
  zoomControl: true
});

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© <a href="https://openstreetmap.org">OpenStreetMap</a>',
  maxZoom: 18
}).addTo(map);

// ── STATE ─────────────────────────────────────────────────────────────────────
let activeId = null;
const layers = {};

// ── DRAW TRAJETS ─────────────────────────────────────────────────────────────
VOYAGES.forEach(v => {
  const latlngs = v.coords.map(([lon, lat]) => [lat, lon]);
  const line = L.polyline(latlngs, {
    color: v.couleur,
    weight: 3,
    opacity: 0.85,
  }).addTo(map);

  // Start & end markers
  const dotIcon = (color) => L.divIcon({
    className: '',
    html: `<div style="width:8px;height:8px;border-radius:50%;background:${color};border:2px solid #f5f2ed;"></div>`,
    iconSize: [8, 8],
    iconAnchor: [4, 4]
  });

  const startCoord = v.coords[0];
  const endCoord   = v.coords[v.coords.length - 1];
  const mStart = L.marker([startCoord[1], startCoord[0]], { icon: dotIcon(v.couleur) }).addTo(map);
  const mEnd   = L.marker([endCoord[1],   endCoord[0]],   { icon: dotIcon(v.couleur) }).addTo(map);

  layers[v.id] = { line, mStart, mEnd };
});

// ── TOGGLE LOGIC ─────────────────────────────────────────────────────────────
function setActive(id) {
  if (activeId === id) {
    // Deselect — show all
    activeId = null;
    VOYAGES.forEach(v => {
      layers[v.id].line.setStyle({ opacity: 0.85, weight: 3 });
      layers[v.id].mStart.setOpacity(1);
      layers[v.id].mEnd.setOpacity(1);
    });
    document.querySelectorAll('.voyage-card').forEach(c => {
      c.classList.remove('active', 'dimmed');
    });
  } else {
    activeId = id;
    VOYAGES.forEach(v => {
      const isActive = v.id === id;
      layers[v.id].line.setStyle({
        opacity: isActive ? 1 : 0.12,
        weight:  isActive ? 5  : 2,
      });
      layers[v.id].mStart.setOpacity(isActive ? 1 : 0.15);
      layers[v.id].mEnd.setOpacity(isActive ? 1 : 0.15);
    });

    document.querySelectorAll('.voyage-card').forEach(c => {
      const isActive = c.dataset.id === id;
      c.classList.toggle('active',  isActive);
      c.classList.toggle('dimmed', !isActive);
    });

    // Fly to voyage bounds
    const v = VOYAGES.find(v => v.id === id);
    const latlngs = v.coords.map(([lon, lat]) => [lat, lon]);
    map.fitBounds(L.latLngBounds(latlngs), { padding: [40, 40] });
  }
}

// ── BUILD CARDS ───────────────────────────────────────────────────────────────
const container = document.getElementById('voyage-cards');

VOYAGES.forEach(v => {
  const card = document.createElement('div');
  card.className = 'voyage-card';
  card.dataset.id = v.id;
  card.style.setProperty('--card-color', v.couleur);

  card.innerHTML = `
    <div class="card-top">
      <div class="card-title">${v.titre}</div>
      <div class="card-year">${v.annee}</div>
    </div>
    <div class="card-partners">${v.partenaires}</div>
    <div class="card-stats">
      <div class="cstat">
        <span class="cstat-num" style="color:${v.couleur}">${v.stats.km.toLocaleString('fr-FR')}</span>
        <span class="cstat-label">km</span>
      </div>
      <div class="cstat">
        <span class="cstat-num" style="color:${v.couleur}">${v.stats.jours}</span>
        <span class="cstat-label">jours</span>
      </div>
      <div class="cstat">
        <span class="cstat-num" style="color:${v.couleur}">${v.stats.conducteurs}</span>
        <span class="cstat-label">conducteurs</span>
      </div>
    </div>
    <div class="card-toggle">Cliquer pour mettre en avant →</div>
  `;

  card.addEventListener('click', () => setActive(v.id));
  container.appendChild(card);
});

// ── GLOBAL STATS ──────────────────────────────────────────────────────────────
const totals = VOYAGES.reduce((acc, v) => ({
  km:          acc.km          + v.stats.km,
  jours:       acc.jours       + v.stats.jours,
  conducteurs: acc.conducteurs + v.stats.conducteurs,
}), { km: 0, jours: 0, conducteurs: 0 });

document.getElementById('total-km').textContent          = totals.km.toLocaleString('fr-FR');
document.getElementById('total-jours').textContent       = totals.jours;
document.getElementById('total-conducteurs').textContent = totals.conducteurs;
