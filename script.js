/* =========================================================
   Dashboard – mocks + render + hooks para Tracker
   Troque futuramente getTrackerData() por uma chamada real.
========================================================= */

// ------- MOCK DATA (exemplo) -------
const mockData = {
  kpi: {
    wins: 24,
    losses: 13,
    winRate: 64,     // %
    kd: 1.32,
    hs: 22,          // %
    avgScore: 238,   // combat score médio
    streak: 4,       // série atual
    matches: 37
  },
  matches: [
    { id: 1, map: "Ascent",  teamA: "Alpha", teamB: "Beta", scoreA: 13, scoreB: 9,   mvp: "Sova",   result: "win",  date: "2025-08-16" },
    { id: 2, map: "Bind",    teamA: "Omega", teamB: "Delta", scoreA: 10, scoreB: 13, mvp: "Jett",   result: "lose", date: "2025-08-15" },
    { id: 3, map: "Haven",   teamA: "Alpha", teamB: "Delta", scoreA: 13, scoreB: 7,  mvp: "Viper",  result: "win",  date: "2025-08-14" },
    { id: 4, map: "Lotus",   teamA: "Gamma", teamB: "Beta",  scoreA: 12, scoreB: 14, mvp: "Raze",   result: "lose", date: "2025-08-12" },
    { id: 5, map: "Sunset",  teamA: "Alpha", teamB: "Omega", scoreA: 13, scoreB: 11, mvp: "Sage",   result: "win",  date: "2025-08-10" },
    { id: 6, map: "Pearl",   teamA: "Delta", teamB: "Gamma", scoreA: 8,  scoreB: 13, mvp: "Cypher", result: "win",  date: "2025-08-08" }
  ],
  leaderboard: [
    { pos:1, player:"Adolfo", tag:"#0001", rating: 1.48, kd: 1.39, hs: 23 },
    { pos:2, player:"Marcos",  tag:"#1207", rating: 1.41, kd: 1.31, hs: 21 },
    { pos:3, player:"Flavia",  tag:"#3342", rating: 1.33, kd: 1.22, hs: 19 },
    { pos:4, player:"Rafa",    tag:"#8875", rating: 1.21, kd: 1.10, hs: 18 },
    { pos:5, player:"Juca",    tag:"#9911", rating: 1.10, kd: 1.02, hs: 17 }
  ]
};

// ------- RENDER -------
function renderKPIs(kpi){
  const el = document.getElementById('kpis');
  el.innerHTML = `
    ${kpiCard('Vitórias', kpi.wins, '🏆')}
    ${kpiCard('Derrotas', kpi.losses, '💥')}
    ${kpiCard('Win Rate', kpi.winRate + '%', '📈')}
    ${kpiCard('K/D', kpi.kd.toFixed(2), '🎯')}
    ${kpiCard('HS%', kpi.hs + '%', '🔫')}
    ${kpiCard('Combat Score', kpi.avgScore, '🔥')}
    ${kpiCard('Série Atual', kpi.streak, '⚡')}
    ${kpiCard('Partidas', kpi.matches, '🗂️')}
  `;
}
function kpiCard(label, value, icon){
  return `
    <div class="kpi">
      <div class="icon">${icon}</div>
      <div class="meta">
        <span class="label">${label}</span>
        <span class="value">${value}</span>
      </div>
    </div>
  `;
}

function renderMatches(list){
  const el = document.getElementById('matches');
  el.innerHTML = list.map(m => `
    <article class="match">
      <div class="row">
        <span class="tag">${formatDate(m.date)}</span>
        <span class="tag">${m.map}</span>
      </div>
      <div class="row">
        <strong>${m.teamA}</strong>
        <div class="score">${m.scoreA} : ${m.scoreB}</div>
        <strong>${m.teamB}</strong>
      </div>
      <div class="row">
        <span class="tag">MVP: ${m.mvp}</span>
        <span class="badge ${m.result==='win'?'win':'lose'}">
          ${m.result === 'win' ? 'Vitória' : 'Derrota'}
        </span>
      </div>
    </article>
  `).join('');
}

function renderLeaderboard(rows, metric='rating'){
  const el = document.getElementById('leaderboard');
  const ordered = [...rows].sort((a,b)=> b[metric] - a[metric]);

  el.innerHTML = `
    <div class="tr">
      <div class="th">Pos</div>
      <div class="th">Jogador</div>
      <div class="th">Rating</div>
      <div class="th">K/D</div>
      <div class="th">HS%</div>
    </div>
    ${ordered.map((r,i)=> `
      <div class="tr body">
        <div class="td">#${i+1}</div>
        <div class="td name">
          <span>${r.player}</span>
          <span class="pill">${r.tag}</span>
        </div>
        <div class="td">${r.rating.toFixed(2)}</div>
        <div class="td">${r.kd.toFixed(2)}</div>
        <div class="td">${r.hs}%</div>
      </div>
    `).join('')}
  `;
}

// ------- Hooks UI -------
function initControls(data){
  document.getElementById('refreshBtn').addEventListener('click', async ()=>{
    // quando integrar o Tracker, troque getMock() por getTrackerData()
    const fresh = await getMock();
    hydrate(fresh);
  });

  document.getElementById('rankMetric').addEventListener('change', (e)=>{
    renderLeaderboard(data.leaderboard, e.target.value);
  });
}

// ------- Hidratar a página -------
function hydrate(data){
  renderKPIs(data.kpi);
  renderMatches(data.matches);
  const metric = document.getElementById('rankMetric')?.value || 'rating';
  renderLeaderboard(data.leaderboard, metric);
  initControls(data);
}

// ------- Util -------
function formatDate(iso){
  const d = new Date(iso + "T12:00:00"); // evitar TZ
  return d.toLocaleDateString('pt-BR', { day:'2-digit', month:'2-digit', year:'numeric' });
}

// ------- Mocks / Tracker integration -------
async function getMock(){
  // simula um “refresh” alterando levemente números
  const jitter = (v, p=0.05)=> +(v*(1+(Math.random()*p*2 - p))).toFixed(2);
  const clone = JSON.parse(JSON.stringify(mockData));
  clone.kpi.kd = jitter(clone.kpi.kd, .08);
  clone.kpi.winRate = Math.min(100, Math.max(0, Math.round(jitter(clone.kpi.winRate, .06))));
  clone.kpi.avgScore = Math.round(jitter(clone.kpi.avgScore, .09));
  return new Promise(res=> setTimeout(()=> res(clone), 300));
}

/*
  EXEMPLO de como integrar Tracker depois:
  - Substitua getMock() por getTrackerData(riotName, riotTag)
  - E chame hydrate(await getTrackerData(...))

async function getTrackerData(riotName, riotTag){
  const url = `https://api.tracker.gg/api/v2/valorant/standard/profile/riot/${encodeURIComponent(riotName)}%23${encodeURIComponent(riotTag)}`;
  const res = await fetch(url, { headers: { 'TRN-Api-Key': 'SUA_API_KEY_AQUI' }});
  const json = await res.json();
  // Mapear json -> { kpi, matches, leaderboard }
  return mapTrackerToDashboard(json);
}
*/

// ------- Boot -------
document.addEventListener('DOMContentLoaded', async ()=>{
  const data = await getMock();
  hydrate(data);
});
