let jogadores = [];

function adicionarJogador() {
  const nomeInput = document.getElementById("nomeJogador");
  const nome = nomeInput.value.trim();

  if (nome === "") return;

  jogadores.push(nome);
  nomeInput.value = "";
  atualizarListaJogadores();
}

function atualizarListaJogadores() {
  const lista = document.getElementById("jogadores");
  lista.innerHTML = "";

  jogadores.forEach((jogador, index) => {
    const li = document.createElement("li");
    li.textContent = jogador;

    const btn = document.createElement("button");
    btn.textContent = "❌";
    btn.classList.add("remover");
    btn.onclick = () => removerJogador(index);

    li.appendChild(btn);
    lista.appendChild(li);
  });
}

function removerJogador(index) {
  jogadores.splice(index, 1);
  atualizarListaJogadores();
  sortearTimes(); // redivide os times automaticamente
}

function sortearTimes() {
  const listaTimes = document.getElementById("times");
  listaTimes.innerHTML = "";

  if (jogadores.length === 0) return;

  // embaralhar jogadores
  const sorteados = [...jogadores].sort(() => Math.random() - 0.5);

  const timeAzul = sorteados.filter((_, i) => i % 2 === 0);
  const timeVermelho = sorteados.filter((_, i) => i % 2 !== 0);

  const divAzul = document.createElement("div");
  divAzul.classList.add("time", "azul");
  divAzul.innerHTML = "<h4>Time Azul</h4><ul>" + timeAzul.map(j => `<li>${j}</li>`).join("") + "</ul>";

  const divVermelho = document.createElement("div");
  divVermelho.classList.add("time", "vermelho");
  divVermelho.innerHTML = "<h4>Time Vermelho</h4><ul>" + timeVermelho.map(j => `<li>${j}</li>`).join("") + "</ul>";

  listaTimes.appendChild(divAzul);
  listaTimes.appendChild(divVermelho);
}

function limparJogadores() {
  jogadores = [];
  atualizarListaJogadores();
  limparTimes();
}

function limparTimes() {
  document.getElementById("times").innerHTML = "";
}