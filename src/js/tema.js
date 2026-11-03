// Tema compartilhado entre início, programação e cardápio.
// Carregado no head antes do CSS para aplicar a preferência sem piscar.
(function () {
  var tema = "dark";
  try {
    var salvo = localStorage.getItem("tema");
    if (salvo === "light") tema = "light";
  } catch (erro) {
    /* Sem localStorage, mantém o modo escuro padrão. */
  }
  if (tema === "dark") {
    document.documentElement.setAttribute("data-theme", "dark");
  } else {
    document.documentElement.removeAttribute("data-theme");
  }
})();

function inicializarTema() {
  const botaoTema = document.getElementById("botao-tema");
  if (!botaoTema) return;

  const iconeLua = botaoTema.querySelector(".icone-lua");
  const iconeSol = botaoTema.querySelector(".icone-sol");

  function temaEstaEscuro() {
    return document.documentElement.getAttribute("data-theme") === "dark";
  }

  // Mostra o ícone do tema atual: sol no claro, lua no escuro. Usa o atributo
  // "hidden" (não a propriedade .hidden, que em elementos <svg> não reflete no
  // atributo e não dispara o [hidden] do CSS).
  function definirIconeDoTema(escuro) {
    botaoTema.setAttribute("aria-label", escuro ? "Ativar modo claro" : "Ativar modo escuro");
    if (iconeSol) iconeSol.toggleAttribute("hidden", escuro);
    if (iconeLua) iconeLua.toggleAttribute("hidden", !escuro);
  }

  botaoTema.addEventListener("click", () => {
    const novoTemaEscuro = !temaEstaEscuro();

    if (novoTemaEscuro) {
      document.documentElement.setAttribute("data-theme", "dark");
    } else {
      document.documentElement.removeAttribute("data-theme");
    }

    try {
      localStorage.setItem("tema", novoTemaEscuro ? "dark" : "light");
    } catch (erro) {
      /* localStorage indisponível (ex.: navegação privada) — o tema ainda
         funciona nesta visita, só não é lembrado na próxima. */
    }

    // Troca os ícones entre si (sol <-> lua) para o novo tema.
    definirIconeDoTema(novoTemaEscuro);
  });

  definirIconeDoTema(temaEstaEscuro());
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", inicializarTema);
} else {
  inicializarTema();
}
