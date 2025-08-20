const pages = {
  home: `
    <section class="section">
      <h2>Bem-vindo ao Valorant Hub</h2>
      <p>Acompanhe torneios, resultados e rankings em tempo real.</p>
      <img src="assets/valorant-logo.png" alt="Valorant Logo" style="width:150px; margin-top:20px;">
    </section>
  `,
  copa: `
    <section class="section">
      <h2>🏆 Copa Valorant</h2>
      <div class="card">
        <h3>Time Vermelho</h3>
        <input type="text" id="playerRed" placeholder="Nome do jogador">
        <button class="add-btn" onclick="addPlayer('red')">Adicionar</button>
        <ul id="teamRed" class="droppable"></ul>
      </div>

      <div class="card">
        <h3>Time Azul</h3>
        <input type="text" id="playerBlue" placeholder="Nome do jogador">
        <button class="add-btn" onclick="addPlayer('blue')">Adicionar</button>
        <ul id="teamBlue" class="droppable"></ul>
      </div>
    </section>
  `,
  resultados: `
    <section class="section">
      <h2>📊 Resultados Recentes</h2>
      <div class="card" id="match1">
        <h3>Alpha vs Beta</h3>
        <p>Placar: 
          <input type="number" value="13" id="scoreAlpha" style="width:50px;" onchange="updateWinner()">
           - 
          <input type="number" value="9" id="scoreBeta" style="width:50px;" onchange="updateWinner()">
        </p>
        <p id="winnerText">Vencedor: Alpha</p>
      </div>
    </section>
  `
};

function navigate(page) {
  const app = document.getElementById("app");
  app.innerHTML = pages[page];

  if(page === "copa") initCopa();
  if(page === "resultados") updateWinner();
}

window.onload = () => navigate("home");

// Copa Functions
function addPlayer(team) {
  const input = document.getElementById(team === "red" ? "playerRed" : "playerBlue");
  const name = input.value.trim();
  if(!name) return;

  const ul = document.getElementById(team === "red" ? "teamRed" : "teamBlue");
  const li = document.createElement("li");
  li.textContent = name;

  const btn = document.createElement("button");
  btn.textContent = "❌";
  btn.onclick = () => li.remove();

  li.appendChild(btn);
  li.setAttribute("draggable", "true");
  ul.appendChild(li);

  input.value = "";
  initDragAndDrop();
}

function initDragAndDrop() {
  const draggables = document.querySelectorAll(".card ul li");
  const droppables = document.querySelectorAll(".droppable");

  draggables.forEach(d => {
    d.addEventListener("dragstart", () => d.classList.add("dragging"));
    d.addEventListener("dragend", () => d.classList.remove("dragging"));
  });

  droppables.forEach(drop => {
    drop.addEventListener("dragover", e => {
      e.preventDefault();
      const dragging = document.querySelector(".dragging");
      if(dragging && drop !== dragging.parentElement) drop.appendChild(dragging);
    });
  });
}

function initCopa() { initDragAndDrop(); }

// Resultados Functions
function updateWinner() {
  const scoreA = parseInt(document.getElementById("scoreAlpha").value);
  const scoreB = parseInt(document.getElementById("scoreBeta").value);
  const matchCard = document.getElementById("match1");

  const winnerText = document.getElementById("winnerText");
  matchCard.classList.remove("winner");
  if(scoreA > scoreB) {
    winnerText.textContent = "Vencedor: Alpha";
    matchCard.classList.add("winner");
  } else if(scoreB > scoreA) {
    winnerText.textContent = "Vencedor: Beta";
    matchCard.classList.add("winner");
  } else {
    winnerText.textContent = "Empate";
  }
}

fetch('https://api.tracker.gg/api/v2/valorant/standard/profile/riot/<USERNAME>')
  .then(res => res.json())
  .then(data => {
      console.log(data);
      // Aqui você popula a página com as stats do jogador
  });
