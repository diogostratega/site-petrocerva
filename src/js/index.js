// ===================================================
// PETROCERVA GASTROBAR — index.js
// Menu mobile, carrossel da programação, IntersectionObserver, rodapé
// ===================================================

document.documentElement.classList.add("js");

document.addEventListener("DOMContentLoaded", () => {
  inicializarMenuMobile();
  inicializarCarrosselProgramacao();
  inicializarAnimacoesDeEntrada();
  preencherAnoAtual();
});

// ===================================================
// MENU MOBILE
// ===================================================

function inicializarMenuMobile() {
  const botaoMenuMobile = document.getElementById("botao-menu-mobile");
  const menuPrincipal = document.getElementById("menu-principal");

  if (!botaoMenuMobile || !menuPrincipal) return;

  const linksDoMenu = menuPrincipal.querySelectorAll("a");

  function abrirMenu() {
    menuPrincipal.classList.add("menu-principal--aberto");
    botaoMenuMobile.setAttribute("aria-expanded", "true");
    botaoMenuMobile.setAttribute("aria-label", "Fechar menu de navegação");
  }

  function fecharMenu() {
    menuPrincipal.classList.remove("menu-principal--aberto");
    botaoMenuMobile.setAttribute("aria-expanded", "false");
    botaoMenuMobile.setAttribute("aria-label", "Abrir menu de navegação");
  }

  botaoMenuMobile.addEventListener("click", () => {
    const estaAberto = menuPrincipal.classList.contains("menu-principal--aberto");
    estaAberto ? fecharMenu() : abrirMenu();
  });

  linksDoMenu.forEach((link) => {
    link.addEventListener("click", fecharMenu);
  });

  document.addEventListener("keydown", (evento) => {
    if (evento.key === "Escape") {
      fecharMenu();
    }
  });

  const observadorDeLargura = window.matchMedia("(min-width: 48rem)");
  observadorDeLargura.addEventListener("change", (evento) => {
    if (evento.matches) fecharMenu();
  });
}

// ===================================================
// CARROSSEL DA PROGRAMAÇÃO
// ===================================================

function inicializarCarrosselProgramacao() {
  const carrossel = document.querySelector(".carrossel-programacao");
  const viewport = document.querySelector(".carrossel-programacao__viewport");
  const trilhoProgramacao = document.getElementById("trilho-programacao");
  const slidesDaProgramacao = Array.from(
    document.querySelectorAll(".carrossel-programacao__slide")
  );
  const botoesDosDias = Array.from(
    document.querySelectorAll(".carrossel-programacao__botao-dia")
  );
  const botaoAtracaoAnterior = document.getElementById("botao-atracao-anterior");
  const botaoProximaAtracao = document.getElementById("botao-proxima-atracao");
  const botaoControleAutomatico = document.getElementById("botao-controle-automatico");
  const barraDeProgresso = document.getElementById("barra-progresso-autoplay");
  const anuncioDoCarrossel = document.getElementById("anuncio-carrossel");

  if (!carrossel || !viewport || !trilhoProgramacao || slidesDaProgramacao.length === 0) {
    return;
  }

  const totalDeSlides = slidesDaProgramacao.length;
  const duracaoDoAutoplay = 6000;
  const deslocamentoMinimoParaTrocarSlide = 40;

  let indiceAtual = 0;
  let autoplayEstaAtivo = true;
  let autoplayFoiPausadoPeloUsuario = false;
  let temporizadorDoAutoplay = null;
  let paginaEstaVisivel = !document.hidden;
  let prefereMovimentoReduzido = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  let estaArrastando = false;
  let posicaoInicialDoArraste = 0;
  let deslocamentoAtualDoArraste = 0;

  function exibirSlideDaProgramacao(novoIndice, { anunciar = false } = {}) {
    indiceAtual = ((novoIndice % totalDeSlides) + totalDeSlides) % totalDeSlides;

    trilhoProgramacao.style.transform = `translateX(-${indiceAtual * 100}%)`;

    slidesDaProgramacao.forEach((slide, indice) => {
      const estaAtivo = indice === indiceAtual;
      slide.setAttribute("aria-hidden", estaAtivo ? "false" : "true");

      const linkDoSlide = slide.querySelector("a");
      if (linkDoSlide) {
        linkDoSlide.setAttribute("tabindex", estaAtivo ? "0" : "-1");
      }
    });

    atualizarDiaAtivo();

    if (anunciar) {
      const diaAtivo = slidesDaProgramacao[indiceAtual].dataset.dia;
      const nomesDosDias = {
        sexta: "Sexta-feira",
        sabado: "Sábado",
        domingo: "Domingo",
      };
      anuncioDoCarrossel.textContent = `Mostrando programação de ${nomesDosDias[diaAtivo] || diaAtivo}`;
    }
  }

  function atualizarDiaAtivo() {
    const diaDoSlideAtivo = slidesDaProgramacao[indiceAtual].dataset.dia;

    botoesDosDias.forEach((botao) => {
      const ehODiaAtivo = botao.dataset.dia === diaDoSlideAtivo;
      botao.classList.toggle("carrossel-programacao__botao-dia--ativo", ehODiaAtivo);
      botao.setAttribute("aria-selected", ehODiaAtivo ? "true" : "false");
    });
  }

  function irParaProximaAtracao(opcoes = {}) {
    exibirSlideDaProgramacao(indiceAtual + 1, opcoes);
  }

  function irParaAtracaoAnterior(opcoes = {}) {
    exibirSlideDaProgramacao(indiceAtual - 1, opcoes);
  }

  function irParaODia(dia) {
    const indiceDoDia = slidesDaProgramacao.findIndex((slide) => slide.dataset.dia === dia);
    if (indiceDoDia === -1) return;
    exibirSlideDaProgramacao(indiceDoDia, { anunciar: true });
  }

  function reiniciarContagemDoCarrossel() {
    pararTemporizadorDoAutoplay();
    reiniciarBarraDeProgresso();
    if (deveAutoplayRodar()) {
      iniciarCarrosselAutomatico();
    }
  }

  function deveAutoplayRodar() {
    return (
      autoplayEstaAtivo &&
      !autoplayFoiPausadoPeloUsuario &&
      paginaEstaVisivel &&
      !prefereMovimentoReduzido &&
      !estaArrastando
    );
  }

  function iniciarCarrosselAutomatico() {
    pararTemporizadorDoAutoplay();
    if (!deveAutoplayRodar()) return;

    animarBarraDeProgresso();
    temporizadorDoAutoplay = window.setTimeout(() => {
      irParaProximaAtracao({ anunciar: false });
      iniciarCarrosselAutomatico();
    }, duracaoDoAutoplay);
  }

  function pausarCarrosselAutomatico() {
    pararTemporizadorDoAutoplay();
    pausarBarraDeProgresso();
  }

  function pararTemporizadorDoAutoplay() {
    if (temporizadorDoAutoplay) {
      window.clearTimeout(temporizadorDoAutoplay);
      temporizadorDoAutoplay = null;
    }
  }

  function animarBarraDeProgresso() {
    if (!barraDeProgresso) return;
    barraDeProgresso.classList.remove("carrossel-programacao__progresso-barra--em-andamento");
    // Força reflow para reiniciar a animação.
    void barraDeProgresso.offsetWidth;
    barraDeProgresso.classList.add("carrossel-programacao__progresso-barra--em-andamento");
  }

  function pausarBarraDeProgresso() {
    if (!barraDeProgresso) return;
    const estiloAtual = window.getComputedStyle(barraDeProgresso).transform;
    barraDeProgresso.classList.remove("carrossel-programacao__progresso-barra--em-andamento");
    barraDeProgresso.style.transform = estiloAtual;
  }

  function reiniciarBarraDeProgresso() {
    if (!barraDeProgresso) return;
    barraDeProgresso.classList.remove("carrossel-programacao__progresso-barra--em-andamento");
    barraDeProgresso.style.transform = "";
  }

  function atualizarEstadoDosControles() {
    if (!botaoControleAutomatico) return;

    const iconePausar = botaoControleAutomatico.querySelector(".icone-pausar");
    const iconeRetomar = botaoControleAutomatico.querySelector(".icone-retomar");
    const textoControle = botaoControleAutomatico.querySelector(
      ".carrossel-programacao__texto-controle"
    );

    const autoplayPausado = autoplayFoiPausadoPeloUsuario;

    botaoControleAutomatico.setAttribute(
      "aria-label",
      autoplayPausado ? "Retomar carrossel" : "Pausar carrossel"
    );

    if (textoControle) {
      textoControle.textContent = autoplayPausado ? "Retomar" : "Pausar";
    }

    if (iconePausar && iconeRetomar) {
      if (autoplayPausado) {
        iconePausar.setAttribute("hidden", "");
        iconeRetomar.removeAttribute("hidden");
      } else {
        iconeRetomar.setAttribute("hidden", "");
        iconePausar.removeAttribute("hidden");
      }
    }
  }

  // Controles manuais dos dias.
  botoesDosDias.forEach((botao) => {
    botao.addEventListener("click", () => {
      irParaODia(botao.dataset.dia);
      reiniciarContagemDoCarrossel();
    });
  });

  // Setas anterior e próxima.
  if (botaoAtracaoAnterior) {
    botaoAtracaoAnterior.addEventListener("click", () => {
      irParaAtracaoAnterior({ anunciar: true });
      reiniciarContagemDoCarrossel();
    });
  }

  if (botaoProximaAtracao) {
    botaoProximaAtracao.addEventListener("click", () => {
      irParaProximaAtracao({ anunciar: true });
      reiniciarContagemDoCarrossel();
    });
  }

  // Botão pausar/retomar.
  if (botaoControleAutomatico) {
    botaoControleAutomatico.addEventListener("click", () => {
      autoplayFoiPausadoPeloUsuario = !autoplayFoiPausadoPeloUsuario;
      atualizarEstadoDosControles();

      if (autoplayFoiPausadoPeloUsuario) {
        pausarCarrosselAutomatico();
      } else {
        reiniciarContagemDoCarrossel();
      }
    });
  }

  // Pausa ao passar o mouse.
  carrossel.addEventListener("mouseenter", pausarCarrosselAutomatico);
  carrossel.addEventListener("mouseleave", () => {
    if (deveAutoplayRodar()) iniciarCarrosselAutomatico();
  });

  // Pausa quando algum elemento interno recebe foco.
  carrossel.addEventListener("focusin", pausarCarrosselAutomatico);
  carrossel.addEventListener("focusout", (evento) => {
    if (!carrossel.contains(evento.relatedTarget) && deveAutoplayRodar()) {
      iniciarCarrosselAutomatico();
    }
  });

  // Pausa quando a aba fica invisível.
  document.addEventListener("visibilitychange", () => {
    paginaEstaVisivel = !document.hidden;
    if (paginaEstaVisivel) {
      if (deveAutoplayRodar()) iniciarCarrosselAutomatico();
    } else {
      pausarCarrosselAutomatico();
    }
  });

  // Respeita prefers-reduced-motion, inclusive se mudar em tempo real.
  const consultaDeMovimentoReduzido = window.matchMedia("(prefers-reduced-motion: reduce)");
  consultaDeMovimentoReduzido.addEventListener("change", (evento) => {
    prefereMovimentoReduzido = evento.matches;
    if (prefereMovimentoReduzido) {
      pausarCarrosselAutomatico();
    } else if (deveAutoplayRodar()) {
      iniciarCarrosselAutomatico();
    }
  });

  // Arraste com dedo e com mouse.
  function iniciarArraste(coordenadaX) {
    estaArrastando = true;
    posicaoInicialDoArraste = coordenadaX;
    deslocamentoAtualDoArraste = 0;
    viewport.classList.add("carrossel-programacao__viewport--arrastando");
    pausarCarrosselAutomatico();
  }

  function moverArraste(coordenadaX) {
    if (!estaArrastando) return;
    deslocamentoAtualDoArraste = coordenadaX - posicaoInicialDoArraste;
    const percentualBase = -indiceAtual * 100;
    const percentualDoArraste = (deslocamentoAtualDoArraste / viewport.offsetWidth) * 100;
    trilhoProgramacao.style.transform = `translateX(${percentualBase + percentualDoArraste}%)`;
  }

  function finalizarArraste() {
    if (!estaArrastando) return;
    estaArrastando = false;
    viewport.classList.remove("carrossel-programacao__viewport--arrastando");

    if (Math.abs(deslocamentoAtualDoArraste) > deslocamentoMinimoParaTrocarSlide) {
      if (deslocamentoAtualDoArraste < 0) {
        irParaProximaAtracao();
      } else {
        irParaAtracaoAnterior();
      }
    } else {
      exibirSlideDaProgramacao(indiceAtual);
    }

    deslocamentoAtualDoArraste = 0;
    reiniciarContagemDoCarrossel();
  }

  // Toque (dedo).
  viewport.addEventListener(
    "touchstart",
    (evento) => {
      iniciarArraste(evento.touches[0].clientX);
    },
    { passive: true }
  );

  viewport.addEventListener(
    "touchmove",
    (evento) => {
      moverArraste(evento.touches[0].clientX);
    },
    { passive: true }
  );

  viewport.addEventListener("touchend", finalizarArraste);
  viewport.addEventListener("touchcancel", finalizarArraste);

  // Mouse (desktop).
  viewport.addEventListener("mousedown", (evento) => {
    evento.preventDefault();
    iniciarArraste(evento.clientX);
  });

  window.addEventListener("mousemove", (evento) => {
    if (estaArrastando) moverArraste(evento.clientX);
  });

  window.addEventListener("mouseup", finalizarArraste);

  // Evita que um clique acidental após o arraste ative um link.
  viewport.addEventListener(
    "click",
    (evento) => {
      if (Math.abs(deslocamentoAtualDoArraste) > 3) {
        evento.preventDefault();
      }
    },
    true
  );

  // Estado inicial.
  exibirSlideDaProgramacao(0);
  atualizarEstadoDosControles();

  if (prefereMovimentoReduzido) {
    autoplayFoiPausadoPeloUsuario = true;
    atualizarEstadoDosControles();
  } else {
    iniciarCarrosselAutomatico();
  }
}

// ===================================================
// INTERSECTION OBSERVER — animações de entrada
// ===================================================

function inicializarAnimacoesDeEntrada() {
  const elementosParaAnimar = document.querySelectorAll(
    ".experiencia__item, .galeria__item, .depoimentos__item"
  );

  if (elementosParaAnimar.length === 0) return;

  elementosParaAnimar.forEach((elemento) => elemento.classList.add("anima-entrada"));

  if (!("IntersectionObserver" in window)) {
    elementosParaAnimar.forEach((elemento) =>
      elemento.classList.add("anima-entrada--visivel")
    );
    return;
  }

  const observadorDeEntrada = new IntersectionObserver(
    (entradas, observador) => {
      entradas.forEach((entrada) => {
        if (entrada.isIntersecting) {
          entrada.target.classList.add("anima-entrada--visivel");
          observador.unobserve(entrada.target);
        }
      });
    },
    { threshold: 0.2, rootMargin: "0px 0px -40px 0px" }
  );

  elementosParaAnimar.forEach((elemento) => observadorDeEntrada.observe(elemento));
}

// ===================================================
// RODAPÉ — ano atual
// ===================================================

function preencherAnoAtual() {
  const elementoDoAno = document.getElementById("ano-atual");
  if (elementoDoAno) {
    elementoDoAno.textContent = new Date().getFullYear();
  }
}
