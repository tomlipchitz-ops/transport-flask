const STOPS_BASE = [
  { name: 'Carrefour Central',     min: 0,  terminal: true  },
  { name: 'Marche El Mina',        min: 8,  terminal: false },
  { name: 'Hopital National',      min: 15, terminal: false },
  { name: 'Mairie Tevragh-Zeina',  min: 22, terminal: false },
  { name: 'Mosquee Saoudite',      min: 29, terminal: false },
  { name: 'Cite Socogim',          min: 37, terminal: false },
  { name: 'Lycee Technique',       min: 44, terminal: false },
  { name: 'Universite Nouakchott', min: 52, terminal: true  },
];

const PRIX = 20;
let direction = 'aller';
let stops     = [...STOPS_BASE];
let horaire   = null;
let depIdx    = null;
let arrIdx    = null;
let places    = 1;
let payMode   = 'Espèces';

function addMin(h, m, delta) {
  let t = h * 60 + m + delta;
  return String(Math.floor(t/60)%24).padStart(2,'0') + 'h' + String(t%60).padStart(2,'0');
}

function setDir(d) {
  direction = d;
  document.getElementById('d-a').classList.toggle('on', d === 'aller');
  document.getElementById('d-r').classList.toggle('on', d === 'retour');
  stops = d === 'aller' ? [...STOPS_BASE] : [...STOPS_BASE].reverse();
  depIdx = null; arrIdx = null; horaire = null;
  renderStops(); renderHoraires();
  document.getElementById('dur-row').classList.remove('show');
}

function renderHoraires() {
  const grid = document.getElementById('hor-grid');
  grid.innerHTML = '';
  for (let h = 6; h <= 20; h++) {
    const depH = direction === 'retour' ? (h + 3 > 23 ? h : h + 3) : h;
    const dep  = String(depH).padStart(2,'0') + 'h00';
    const arr  = addMin(depH, 0, 52);
    const btn  = document.createElement('div');
    btn.className = 'hbtn';
    btn.innerHTML = `<span class="htime">${dep}</span><span class="harr">arr. ${arr}</span>`;
    btn.addEventListener('click', () => {
      document.querySelectorAll('.hbtn').forEach(b => b.classList.remove('on'));
      btn.classList.add('on');
      horaire = dep;
    });
    grid.appendChild(btn);
  }
}

function renderStops() {
  const col = document.getElementById('stops-col');
  col.innerHTML = '';
  stops.forEach((s, i) => {
    const row = document.createElement('div');
    row.className = 'srow' + (s.terminal ? ' term' : '');
    row.innerHTML = `
      <div class="sdw"><div class="sdot"></div></div>
      <span class="sname">${s.name}</span>
      <span id="stag-${i}"></span>`;
    row.addEventListener('click', () => clickStop(i));
    col.appendChild(row);
  });
  updateHint();
}

function clickStop(i) {
  if (depIdx === null) { depIdx = i; }
  else if (arrIdx === null) {
    if (i === depIdx) { depIdx = null; }
    else if (i > depIdx) { arrIdx = i; }
    else { depIdx = i; }
  } else { depIdx = i; arrIdx = null; }
  refreshStops(); updateDur(); updateHint();
}

function refreshStops() {
  document.querySelectorAll('.srow').forEach((r, i) => {
    r.classList.remove('dep','arr');
    document.getElementById('stag-'+i).innerHTML = '';
    if (i === depIdx) { r.classList.add('dep'); document.getElementById('stag-'+i).innerHTML='<span class="stag td">Depart</span>'; }
    if (i === arrIdx) { r.classList.add('arr'); document.getElementById('stag-'+i).innerHTML='<span class="stag ta">Arrivee</span>'; }
  });
}

function updateHint() {
  const el = document.getElementById('stop-hint');
  if (depIdx === null)      el.textContent = 'Appuyez sur votre arret de depart';
  else if (arrIdx === null) el.textContent = 'Choisissez votre arret d arrivee';
  else                      el.textContent = 'Trajet selectionne';
}

function updateDur() {
  const box = document.getElementById('dur-row');
  if (depIdx === null || arrIdx === null) { box.classList.remove('show'); return; }
  const dur = Math.abs(stops[arrIdx].min - stops[depIdx].min);
  document.getElementById('dur-val').textContent = dur + ' min';
  box.classList.add('show');
}

function changePlaces(d) {
  places = Math.max(1, Math.min(10, places + d));
  const total = places * PRIX;
  document.getElementById('places-num').textContent   = places;
  document.getElementById('tarif-detail').textContent = places + ' place' + (places>1?'s':'') + ' x 20 MRU';
  document.getElementById('tarif-total').textContent  = total + ' MRU';
  document.getElementById('pay-amount').textContent   = total + ' MRU';
}

function setPay(m) {
  payMode = m;
  document.getElementById('pm-especes').classList.toggle('on', m === 'Espèces');
  document.getElementById('pm-mobile').classList.toggle('on',  m === 'Mobile');
}

function fmtTel(el) {
  let v = el.value.replace(/\D/g,'').slice(0,8);
  el.value = v.replace(/(\d{2})(?=\d)/g,'$1 ').trim();
}



function reserver() {
  if (!horaire)                          return alert('Choisissez une heure de depart.');
  if (depIdx === null || arrIdx === null) return alert('Choisissez votre depart et arrivee.');
  const phone = document.getElementById('phone').value.replace(/\s/g,'');
  if (phone.length < 8)                  return alert('Entrez votre numero (8 chiffres).');
  const nomClient = document.getElementById('nom_client').value.trim();
  if (!nomClient)                        return alert('Veuillez entrer le nom du client.');

  const ref   = 'TB-' + Math.random().toString(36).slice(2,7).toUpperCase();
  const today = new Date().toLocaleDateString('fr-FR', {day:'2-digit', month:'long', year:'numeric'});
  const from  = stops[depIdx].name;
  const to    = stops[arrIdx].name;
  const dur   = Math.abs(stops[arrIdx].min - stops[depIdx].min);
  const total = places * PRIX;
  const appli = payMode;

  fetch('/reservation/api/client_reserve', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ligne: 'Ligne Principale (' + (direction === 'aller' ? 'Aller' : 'Retour') + ')',
      arret: from + ' vers ' + to,
      horaire: horaire,
      places: places,
      telephone: phone,
      paiement: appli,
      nom: nomClient
    })
  }).then(r => r.json()).then(data => {
    if(data.success) {
      document.getElementById('c-rows').innerHTML = `
        <div class="cr"><span>Date</span><span>${today}</span></div>
        <div class="cr"><span>Direction</span><span>${direction === 'aller' ? 'Aller' : 'Retour'}</span></div>
        <div class="cr"><span>Depart</span><span>${from}</span></div>
        <div class="cr"><span>Arrivee</span><span>${to}</span></div>
        <div class="cr"><span>Heure</span><span>${horaire}</span></div>
        <div class="cr"><span>Duree</span><span>~${dur} min</span></div>
        <div class="cr"><span>Places</span><span>${places} place${places>1?'s':''}</span></div>
        <div class="cr"><span>Paiement</span><span>${appli}</span></div>
        <div class="cr"><span>Montant</span><span>${total} MRU</span></div>
        <div class="cr"><span>Reference</span><span class="ref">${ref}</span></div>`;
      document.getElementById('ov').classList.add('show');
    } else {
      alert("Erreur lors de la réservation");
    }
  }).catch(e => {
      console.error(e);
      alert("Erreur de connexion au serveur");
  });
}

function reset() {
  document.getElementById('ov').classList.remove('show');
  direction='aller'; stops=[...STOPS_BASE];
  depIdx=null; arrIdx=null; horaire=null; places=1; payMode='Espèces';
  document.getElementById('d-a').classList.add('on');
  document.getElementById('d-r').classList.remove('on');
  document.getElementById('pm-especes').classList.add('on');
  document.getElementById('pm-mobile').classList.remove('on');
  document.getElementById('places-num').textContent   = '1';
  document.getElementById('tarif-detail').textContent = '1 place x 20 MRU';
  document.getElementById('tarif-total').textContent  = '20 MRU';
  document.getElementById('pay-amount').textContent   = '20 MRU';
  document.getElementById('phone').value = '';
  document.getElementById('nom_client').value = '';
  document.getElementById('dur-row').classList.remove('show');
  renderStops(); renderHoraires();
}

renderStops();
renderHoraires();