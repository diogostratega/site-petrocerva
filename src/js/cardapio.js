// ===================================================
// PETROCERVA GASTROBAR - cardapio.js
// Categorias do cardápio em tópicos que abrem e fecham. Sem dependências.
// Sem JavaScript, todas as categorias ficam abertas (ver <noscript> no HTML).
// ===================================================

document.documentElement.classList.add("js");

(function () {
  var categorias = Array.prototype.slice.call(document.querySelectorAll("[data-categoria]"));
  if (categorias.length === 0) return;

  categorias.forEach(function (categoria) {
    var botao = categoria.querySelector(".categoria__botao");
    var corpo = categoria.querySelector(".categoria__corpo");
    if (!botao || !corpo) return;

    function definir(aberta) {
      botao.setAttribute("aria-expanded", aberta ? "true" : "false");
      corpo.hidden = !aberta;
      categoria.classList.toggle("categoria--aberta", aberta);
    }

    botao.addEventListener("click", function () {
      definir(botao.getAttribute("aria-expanded") !== "true");
    });

    // Estado inicial: respeita o aria-expanded escrito no HTML.
    definir(botao.getAttribute("aria-expanded") === "true");
  });
})();
