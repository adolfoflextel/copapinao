// --- Resultados ---
function carregarResultados() {
  const resultados = JSON.parse(localStorage.getItem("resultados")) || [];
  const lista = document.getElementById("listaResultados");
  if (!lista) return;
  lista.innerHTML = "";

  resultados.forEach((p, i) => {
    const div = document.createElement("div");
    div.className = "resultado";
    div.innerHTML = `
      <div class="times">
        <span>${p.timeA}</span>
        <strong>${p.placar}</strong>
        <span>${p.timeB}</span>
      </div>
      <p class="mapa">Mapa: ${p.mapa} | MVP: ${p.mvp || "—"}</p>
    `;
    lista.appendChild(div);
  });

  const form = document.getElementById("formResultado");
  if (form) {
    form.onsubmit = (e) => {
      e.preventDefault();
      const resultadosAtual = JSON.parse(localStorage.getItem("resultados")) || [];
      const novo = {
        timeA: document.getElementById("timeA").value.trim(),
        timeB: document.getElementById("timeB").value.trim(),
        placar: document.getElementById("placar").value.trim(),
        mapa: document.getElementById("mapa").value.trim(),
        mvp: document.getElementById("mvp").value.trim()
      };
      resultadosAtual.push(novo);
      localStorage.setItem("resultados", JSON.stringify(resultadosAtual));
      carregarResultados();
      form.reset();
    };
  }
}

// --- Jogadores / Times ---
function carregarJogadores() {
  const jogadores = JSON.parse(localStorage.getItem("jogadores")) || [];
  const lista = document.getElementById("listaJogadores");
  if (!lista) return;
  lista.innerHTML = "";

  jogadores.forEach(j => {
    const li = document.createElement("li");
    li.textContent = `${j.nome} (${j.nick})`;
    lista.appendChild(li);
  });

  const form = document.getElementById("formJogador");
  if (form) {
    form.onsubmit = (e) => {
      e.preventDefault();
      const jogadoresAtual = JSON.parse(localStorage.getItem("jogadores")) || [];
      jogadoresAtual.push({
        nome: document.getElementById("nome").value.trim(),
        nick: document.getElementById("nick").value.trim()
      });
      localStorage.setItem("jogadores", JSON.stringify(jogadoresAtual));
      carregarJogadores();
      form.reset();
    };
  }
}

function sortearTimes() {
  let jogadores = JSON.parse(localStorage.getItem("jogadores")) || [];
  if (jogadores.length < 2) {
    alert("Cadastre pelo menos 2 jogadores.");
    return;
  }
  // embaralhar (Fisher-Yates)
  for (let i = jogadores.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [jogadores[i], jogadores[j]] = [jogadores[j], jogadores[i]];
  }
  const meio = Math.ceil(jogadores.length / 2);
  const timeA = jogadores.slice(0, meio);
  const timeB = jogadores.slice(meio);

  const div = document.getElementById("timesFormados");
  div.innerHTML = `
    <div>
      <h2>Time A</h2>
      <ul>${timeA.map(j => `<li>${j.nome} (${j.nick})</li>`).join("")}</ul>
    </div>
    <div>
      <h2>Time B</h2>
      <ul>${timeB.map(j => `<li>${j.nome} (${j.nick})</li>`).join("")}</ul>
    </div>
  `;
}
