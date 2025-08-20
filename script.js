// Conteúdos de cada página
const pages = {
  home: `
    <h2>🏠 Bem-vindo</h2>
    <p>Veja os resultados das partidas de Valorant e acompanhe estatísticas em tempo real.</p>
  `,
  partidas: `
    <h2>📊 Partidas</h2>
    <p>Lista das últimas partidas será exibida aqui.</p>
  `,
  jogadores: `
    <h2>🎯 Jogadores</h2>
    <p>Estatísticas individuais dos jogadores.</p>
  `,
  estatisticas: `
    <h2>📈 Estatísticas</h2>
    <p>Comparativos e gráficos gerais de desempenho.</p>
  `
};

// Função para carregar página
function loadPage(page) {
  const content = document.getElementById("content");
  content.innerHTML = pages[page] || "<h2>Página não encontrada</h2>";
}

// Navegação SPA
document.addEventListener("DOMContentLoaded", () => {
  const links = document.querySelectorAll("[data-page]");

  links.forEach(link => {
    link.addEventListener("click", e => {
      e.preventDefault();
      const page = e.target.getAttribute("data-page");
      loadPage(page);
      history.pushState({ page }, "", `#${page}`);
    });
  });

  // Carregar página inicial ou hash atual
  const initialPage = location.hash.replace("#", "") || "home";
  loadPage(initialPage);
});
