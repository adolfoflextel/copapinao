// Exemplo de dados dos times (depois você pode integrar com copa.html)
const timeAzul = ["Jogador A", "Jogador B", "Jogador C", "Jogador D", "Jogador E"];
const timeVermelho = ["Jogador F", "Jogador G", "Jogador H", "Jogador I", "Jogador J"];

function carregarResultados() {
  const azulLista = document.getElementById("time-azul");
  const vermelhoLista = document.getElementById("time-vermelho");

  timeAzul.forEach(j => {
    const li = document.createElement("li");
    li.textContent = j;
    azulLista.appendChild(li);
  });

  timeVermelho.forEach(j => {
    const li = document.createElement("li");
    li.textContent = j;
    vermelhoLista.appendChild(li);
  });
}

window.onload = carregarResultados;