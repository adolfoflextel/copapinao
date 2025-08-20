let players = [];

// Adicionar jogador
function addPlayer() {
    const input = document.getElementById("playerName");
    const name = input.value.trim();

    if (name) {
        players.push(name);
        input.value = "";
        renderPlayers();
    }
}

// Renderizar lista de jogadores
function renderPlayers() {
    const list = document.getElementById("playerList");
    list.innerHTML = "";
    players.forEach((player, index) => {
        const li = document.createElement("li");
        li.textContent = player;

        const removeBtn = document.createElement("button");
        removeBtn.textContent = "❌";
        removeBtn.onclick = () => removePlayer(index);

        li.appendChild(removeBtn);
        list.appendChild(li);
    });
}

// Remover jogador da lista
function removePlayer(index) {
    players.splice(index, 1);
    renderPlayers();
}

// Gerar times
function generateTeams() {
    const teamCount = parseInt(document.getElementById("teamCount").value);
    if (players.length < teamCount) {
        alert("Jogadores insuficientes para formar os times.");
        return;
    }

    const shuffled = [...players].sort(() => Math.random() - 0.5);
    const teams = Array.from({ length: teamCount }, () => []);

    shuffled.forEach((player, i) => {
        teams[i % teamCount].push(player);
    });

    renderTeams(teams);
}

// Exibir times
function renderTeams(teams) {
    const container = document.getElementById("teamsContainer");
    container.innerHTML = "";

    teams.forEach((team, i) => {
        const div = document.createElement("div");
        div.className = "team";

        const title = document.createElement("h3");
        title.textContent = `Time ${i + 1}`;
        div.appendChild(title);

        const ul = document.createElement("ul");
        team.forEach((player, index) => {
            const li = document.createElement("li");
            li.textContent = player;

            const removeBtn = document.createElement("button");
            removeBtn.textContent = "❌";
            removeBtn.onclick = () => {
                team.splice(index, 1);
                renderTeams(teams);
            };

            li.appendChild(removeBtn);
            ul.appendChild(li);
        });

        div.appendChild(ul);
        container.appendChild(div);
    });
}
