/* =========================================================
   Copa Pinão SPA – LocalStorage
   Páginas: Dashboard, Jogadores & Sorteio, Registro de Partidas
========================================================= */
const $ = (s, c=document) => c.querySelector(s);
const $$ = (s, c=document) => [...c.querySelectorAll(s)];
const STORE = { PLAYERS:'cp_players', MATCHES:'cp_matches' };

/* ---------- Estado (carrega do localStorage) ---------- */
let players = load(STORE.PLAYERS, []);
let matches = load(STORE.MATCHES, []);

/* ---------- Router ---------- */
document.addEventListener('DOMContentLoaded', () => {
  $$('.nav-btn, .side-link').forEach(btn => btn.addEventListener('click', () => navigate(btn.dataset.route)));
  navigate(location.hash.replace('#','') || 'dashboard');
});
window.addEventListener('hashchange', ()=> navigate(location.hash.replace('#','')));

function navigate(route){
  location.hash = route;
  if(route==='dashboard') renderDashboard();
  if(route==='players')   renderPlayers();
  if(route==='matches')   renderRegister();
}

/* ---------- Helpers ---------- */
function save(key,val){ localStorage.setItem(key, JSON.stringify(val)); }
function load(key,fb){ try{return JSON.parse(localStorage.getItem(key)) ?? fb}catch{return fb} }
const fmtDate = iso => new Date(iso).toLocaleDateString('pt-BR', {day:'2-digit',month:'2-digit',year:'numeric'});

const MAPS = ['Ascent','Bind','Haven','Split','Icebox','Breeze','Fracture','Pearl','Lotus','Sunset'];

/* =========================================================
   DASHBOARD
========================================================= */
function renderDashboard(){
  const app = $('#app');
  app.innerHTML = `
    <section class="grid grid-kpi" id="kpiWrap"></section>

    <section class="panel">
      <div class="panel-head">
        <h2>🔎 Filtros</h2>
        <div></div>
      </div>
      <div class="form-inline">
        <input class="input" id="fSearch" placeholder="Buscar jogador"/>
        <select class="select" id="fMap"><option value="">Todos os mapas</option>${MAPS.map(m=>`<option>${m}</option>`).join('')}</select>
        <input class="input" type="date" id="fFrom"/>
        <input class="input" type="date" id="fTo"/>
        <select class="select" id="fSort">
          <option value="acs">Ordenar por ACS</option>
          <option value="kda">Ordenar por KDA</option>
          <option value="fb">Ordenar por First Bloods</option>
          <option value="plants">Ordenar por Plants</option>
          <option value="defuses">Ordenar por Defuses</option>
        </select>
        <button class="btn small" id="fApply">Aplicar</button>
        <button class="btn ghost small" id="fClear">Limpar</button>
      </div>
    </section>

    <section class="panel">
      <div class="panel-head">
        <h2>📋 Estatísticas por jogador (acumulado dos filtros)</h2>
        <div></div>
      </div>
      <div style="overflow:auto;">
        <table class="table" id="statsTable">
          <thead>
            <tr>
              <th>Jogador</th><th>Partidas</th><th>ACS (média)</th><th>K/D/A (média)</th>
              <th>Classe Eco (média)</th><th>First Bloods</th><th>Plants</th><th>Defuses</th>
            </tr>
          </thead>
          <tbody></tbody>
        </table>
      </div>
    </section>

    <section class="panel">
      <div class="panel-head">
        <h2>🎯 Partidas (linha a linha)</h2>
        <div><button class="btn ghost small" id="clearMatches">Limpar todas</button></div>
      </div>
      <div style="overflow:auto;">
        <table class="table" id="matchTable">
          <thead>
            <tr>
              <th>Data</th><th>Mapa</th><th>Time A</th><th>Placar</th><th>Time B</th><th>Jogadores</th><th></th>
            </tr>
          </thead>
          <tbody></tbody>
        </table>
      </div>
    </section>
  `;

  // filtros
  $('#fApply').addEventListener('click', updateDashboard);
  $('#fClear').addEventListener('click', ()=>{
    $('#fSearch').value=''; $('#fMap').value=''; $('#fFrom').value=''; $('#fTo').value='';
    updateDashboard();
  });
  $('#clearMatches').addEventListener('click', ()=>{
    if(confirm('Apagar TODAS as partidas?')){
      matches = []; save(STORE.MATCHES, matches); updateDashboard();
    }
  });

  // Remoção por delegação
  $('#matchTable').addEventListener('click', (e)=>{
    const btn = e.target.closest('[data-rm]');
    if(!btn) return;
    const id = Number(btn.dataset.rm);
    matches = matches.filter(m=>m.id!==id); save(STORE.MATCHES, matches); updateDashboard();
  });

  updateDashboard();
}

function filterMatches(){
  const q   = ($('#fSearch').value||'').toLowerCase();
  const map = $('#fMap').value || '';
  const f   = $('#fFrom').value ? new Date($('#fFrom').value) : null;
  const t   = $('#fTo').value   ? new Date($('#fTo').value)   : null;

  return matches.filter(m=>{
    if(map && m.map!==map) return false;
    if(f && new Date(m.date) < f) return false;
    if(t && new Date(m.date) > t) return false;
    if(q){
      const names = m.players.map(p=>p.name.toLowerCase()).join('|');
      if(!names.includes(q)) return false;
    }
    return true;
  });
}

function aggregateByPlayer(list){
  const acc = new Map();
  list.forEach(m=>{
    m.players.forEach(p=>{
      if(!acc.has(p.name)){
        acc.set(p.name, { name:p.name, matches:0, acs:0, k:0, d:0, a:0, eco:0, fb:0, plants:0, defuses:0 });
      }
      const o = acc.get(p.name);
      o.matches += 1;
      o.acs     += Number(p.acs||0);
      o.k       += Number(p.k||0);
      o.d       += Number(p.d||0);
      o.a       += Number(p.a||0);
      o.eco     += Number(p.eco||0);
      o.fb      += Number(p.fb||0);
      o.plants  += Number(p.plants||0);
      o.defuses += Number(p.defuses||0);
    });
  });
  return [...acc.values()].map(o=>({
    ...o,
    acsAvg: o.matches ? (o.acs/o.matches) : 0,
    kdaAvg: o.matches ? `${(o.k/o.matches).toFixed(1)} / ${(o.d/o.matches).toFixed(1)} / ${(o.a/o.matches).toFixed(1)}` : '0/0/0',
    ecoAvg: o.matches ? (o.eco/o.matches) : 0
  }));
}

function updateDashboard(){
  const filtered = filterMatches();

  // KPIs simples
  const kpiWrap = $('#kpiWrap');
  const totalMatches = filtered.length;
  let wins=0, losses=0;
  filtered.forEach(m=>{
    if(m.scoreA>m.scoreB) wins++; else if(m.scoreB>m.scoreA) losses++;
  });
  const winRate = totalMatches ? Math.round((wins/totalMatches)*100) : 0;
  kpiWrap.innerHTML = [
    kpiCard('Partidas', totalMatches, '🗂️'),
    kpiCard('Vitórias (Time A)', wins, '🏆'),
    kpiCard('Derrotas (Time A)', losses, '💥'),
    kpiCard('Win Rate (A)', winRate+'%', '📈')
  ].join('');

  // Tabela de stats por jogador
  const rowsStats = aggregateByPlayer(filtered);
  const sortBy = $('#fSort').value;
  rowsStats.sort((a,b)=>{
    if(sortBy==='acs') return b.acsAvg - a.acsAvg;
    if(sortBy==='kda') return (b.k/b.matches)/(b.d/b.matches || 1) - (a.k/a.matches)/(a.d/a.matches || 1);
    if(sortBy==='fb')  return b.fb - a.fb;
    if(sortBy==='plants') return b.plants - a.plants;
    if(sortBy==='defuses') return b.defuses - a.defuses;
    return 0;
  });

  const tbodyStats = $('#statsTable tbody');
  tbodyStats.innerHTML = rowsStats.map(s=>`
    <tr>
      <td>${s.name}</td>
      <td>${s.matches}</td>
      <td>${s.acsAvg.toFixed(0)}</td>
      <td>${s.kdaAvg}</td>
      <td>${s.ecoAvg.toFixed(0)}</td>
      <td>${s.fb}</td>
      <td>${s.plants}</td>
      <td>${s.defuses}</td>
    </tr>
  `).join('') || `<tr><td colspan="8">Nenhuma partida com esses filtros.</td></tr>`;

  // Tabela de partidas
  const tbodyMatch = $('#matchTable tbody');
  tbodyMatch.innerHTML = filtered.map(m=>`
    <tr>
      <td>${fmtDate(m.date)}</td>
      <td>${m.map}</td>
      <td>${m.teamA}</td>
      <td>${m.scoreA} : ${m.scoreB}</td>
      <td>${m.teamB}</td>
      <td>${m.players.map(p=>`${p.name} (ACS ${p.acs})`).join(', ')}</td>
      <td><button class="btn ghost small" data-rm="${m.id}">Excluir</button></td>
    </tr>
  `).join('') || `<tr><td colspan="7">Sem partidas cadastradas.</td></tr>`;
}

function kpiCard(label, value, icon){
  return `<div class="kpi"><div class="icon">${icon}</div><div><div class="label">${label}</div><div class="value">${value}</div></div></div>`;
}

/* =========================================================
   JOGADORES & SORTEIO
========================================================= */
function renderPlayers(){
  const app = $('#app');
  app.innerHTML = `
    <section class="panel">
      <div class="panel-head">
        <h2>👥 Jogadores</h2>
        <div><button class="btn ghost small" id="clearPlayers">Limpar lista</button></div>
      </div>
      <div class="stack">
        <div class="form-inline">
          <input id="playerName" class="input" placeholder="Nome do jogador"/>
          <button id="addPlayer" class="btn">Adicionar</button>
        </div>
        <div class="list" id="playersList"></div>
      </div>
    </section>

    <section class="panel">
      <div class="panel-head">
        <h2>🎲 Sorteio de Times</h2>
        <div class="form-inline">
          <select id="teamCount" class="select">
            <option value="2">2 Times</option><option value="3">3 Times</option>
            <option value="4">4 Times</option><option value="5">5 Times</option>
            <option value="6">6 Times</option>
          </select>
          <button id="drawBtn" class="btn">Sortear</button>
        </div>
      </div>
      <div id="drawArea" class="teams"></div>
    </section>
  `;

  $('#addPlayer').addEventListener('click', addPlayer);
  $('#playerName').addEventListener('keydown', e=>{ if(e.key==='Enter') addPlayer(); });
  $('#clearPlayers').addEventListener('click', ()=>{
    if(confirm('Apagar todos os jogadores?')){ players=[]; save(STORE.PLAYERS,players); renderPlayers(); }
  });
  $('#drawBtn').addEventListener('click', startDraw);

  renderPlayersList();
}

function renderPlayersList(){
  const list = $('#playersList'); if(!list) return;
  list.innerHTML = players.map((p,i)=>`
    <div class="item"><span>${p}</span><button class="rm" data-rm="${i}">Excluir</button></div>
  `).join('') || `<div class="item"><em>Sem jogadores ainda.</em></div>`;

  list.onclick = (e)=>{
    const btn = e.target.closest('[data-rm]'); if(!btn) return;
    players.splice(Number(btn.dataset.rm),1); save(STORE.PLAYERS,players); renderPlayersList();
  };
}
function addPlayer(){
  const inp = $('#playerName'); const name = (inp.value||'').trim();
  if(!name) return; if(players.includes(name)) return alert('Esse jogador já está na lista.');
  players.push(name); save(STORE.PLAYERS,players); inp.value=''; inp.focus(); renderPlayersList();
}

/* Sorteio com animação */
function startDraw(){
  if(players.length<2) return alert('Adicione pelo menos 2 jogadores.');
  const n = Math.max(2, Math.min(6, Number($('#teamCount').value||2)));
  const area = $('#drawArea');
  area.innerHTML = Array.from({length:n},(_,i)=>`
    <div class="team"><h3>Time ${i+1}</h3>
      <ul>${Array.from({length: Math.ceil(players.length/n)}).map(()=>`<li class="tag-anim shuffle">Embaralhando…</li>`).join('')}</ul>
    </div>
  `).join('');
  setTimeout(()=>{
    const res = drawTeams(players, n);
    area.innerHTML = res.map((team,i)=>`
      <div class="team"><h3>${teamLabel(i)}</h3>
        <ul>${team.map(p=>`<li>${p}</li>`).join('') || '<li><em>—</em></li>'}</ul>
      </div>
    `).join('');
  }, 1200);
}
function drawTeams(arr,n){ const s=[...arr].sort(()=>Math.random()-0.5), out=Array.from({length:n},()=>[]); let i=0; while(s.length){ out[i%n].push(s.shift()); i++; } return out; }
function teamLabel(i){ return ['Azul','Vermelho','Verde','Amarelo','Roxo','Laranja'][i] ? `Time ${['Azul','Vermelho','Verde','Amarelo','Roxo','Laranja'][i]}` : `Time ${i+1}`; }

/* =========================================================
   REGISTRO DE PARTIDAS
========================================================= */
function renderRegister(){
  const app = $('#app');
  const today = new Date().toISOString().slice(0,10);

  app.innerHTML = `
    <section class="panel">
      <div class="panel-head">
        <h2>📝 Registrar Partida</h2>
        <div><button class="btn ghost small" id="importDemo">Demo (preencher exemplo)</button></div>
      </div>
      <form id="matchForm" class="stack">
        <div class="form-inline">
          <input class="input" type="date" name="date" value="${today}" required />
          <select class="select" name="map" required>
            <option value="">Mapa…</option>${MAPS.map(m=>`<option>${m}</option>`).join('')}
          </select>
          <input class="input" name="teamA" placeholder="Time A" required />
          <input class="num"   type="number" name="scoreA" placeholder="Placar A" min="0" required />
          <input class="input" name="teamB" placeholder="Time B" required />
          <input class="num"   type="number" name="scoreB" placeholder="Placar B" min="0" required />
        </div>

        <div class="panel">
          <div class="panel-head"><h2>👤 Estatísticas por Jogador</h2>
            <button class="btn small" id="addRow" type="button">+ Linha</button>
          </div>
          <div id="rows" class="stack"></div>
        </div>

        <div class="form-inline">
          <button class="btn" type="submit">Salvar Partida</button>
          <button class="btn ghost" type="button" id="clearRows">Limpar linhas</button>
        </div>
      </form>
    </section>
  `;

  const rows = $('#rows');
  const addRow = (preset={})=>{
    const row = document.createElement('div');
    row.className='form-inline';
    row.innerHTML = `
      <select class="select pName">
        <option value="">Jogador…</option>
        ${players.map(p=>`<option ${preset.name===p?'selected':''}>${p}</option>`).join('')}
      </select>
      <input class="num pACS" type="number" placeholder="ACS" min="0" value="${preset.acs??''}"/>
      <input class="num pK"   type="number" placeholder="K" min="0" value="${preset.k??''}"/>
      <input class="num pD"   type="number" placeholder="D" min="0" value="${preset.d??''}"/>
      <input class="num pA"   type="number" placeholder="A" min="0" value="${preset.a??''}"/>
      <input class="num pECO" type="number" placeholder="Classe Econ." min="0" value="${preset.eco??''}"/>
      <input class="num pFB"  type="number" placeholder="First Bloods" min="0" value="${preset.fb??''}"/>
      <input class="num pPL"  type="number" placeholder="Plants" min="0" value="${preset.plants??''}"/>
      <input class="num pDF"  type="number" placeholder="Defuses" min="0" value="${preset.defuses??''}"/>
      <button class="btn ghost small rmRow" type="button">Remover</button>
    `;
    rows.appendChild(row);
    row.querySelector('.rmRow').onclick = ()=> row.remove();
  };

  $('#addRow').addEventListener('click', ()=> addRow());
  $('#clearRows').addEventListener('click', ()=> rows.innerHTML='');
  $('#importDemo').addEventListener('click', ()=>{
    rows.innerHTML='';
    const demo = [
      {name: players[0]||'Jogador 1', acs:370, k:26, d:11, a:5,  eco:87, fb:3, plants:0, defuses:0},
      {name: players[1]||'Jogador 2', acs:309, k:20, d:16, a:4,  eco:81, fb:3, plants:1, defuses:0},
      {name: players[2]||'Jogador 3', acs:285, k:20, d:16, a:9,  eco:68, fb:2, plants:3, defuses:0},
      {name: players[3]||'Jogador 4', acs:231, k:18, d:12, a:1,  eco:88, fb:3, plants:0, defuses:1},
      {name: players[4]||'Jogador 5', acs:226, k:16, d:15, a:11, eco:59, fb:1, plants:1, defuses:0},
    ];
    demo.forEach(addRow);
  });

  // adiciona ao menos 5 linhas vazias para começar
  if(rows.children.length===0) Array.from({length:5}).forEach(()=> addRow());

  $('#matchForm').addEventListener('submit', (e)=>{
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const obj = {
      id: Date.now(),
      date: fd.get('date'),
      map: fd.get('map'),
      teamA: fd.get('teamA').trim(),
      teamB: fd.get('teamB').trim(),
      scoreA: Number(fd.get('scoreA')),
      scoreB: Number(fd.get('scoreB')),
      players: []
    };

    // coleta linhas de jogadores
    $$('.form-inline', $('#rows')).forEach(line=>{
      const name = $('.pName', line)?.value?.trim();
      if(!name) return;
      obj.players.push({
        name,
        acs: Number($('.pACS', line).value||0),
        k:   Number($('.pK',   line).value||0),
        d:   Number($('.pD',   line).value||0),
        a:   Number($('.pA',   line).value||0),
        eco: Number($('.pECO', line).value||0),
        fb:  Number($('.pFB',  line).value||0),
        plants:  Number($('.pPL', line).value||0),
        defuses: Number($('.pDF', line).value||0),
      });
    });

    if(obj.players.length===0){ alert('Adicione ao menos um jogador com estatísticas.'); return; }

    matches.unshift(obj); save(STORE.MATCHES, matches);
    alert('Partida salva!');
    e.currentTarget.reset(); $('#rows').innerHTML=''; Array.from({length:5}).forEach(()=> addRow());
  });
}

