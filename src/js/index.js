// ===================================================
// PETROCERVA GASTROBAR — index.js
// Menu mobile, carrossel da programação, IntersectionObserver, rodapé
// ===================================================

document.documentElement.classList.add("js");

document.addEventListener("DOMContentLoaded", () => {
  inicializarMenuMobile();
  inicializarTema();
  inicializarCarrosselProgramacao();
  inicializarAnimacoesDeEntrada();
  inicializarRolagemSuave();
  preencherAnoAtual();

  const agendarMensagemWhatsapp = prepararMensagemWhatsapp();
  inicializarTelaDeCarregamento(agendarMensagemWhatsapp);
});

// ===================================================
// TELA DE CARREGAMENTO
// ===================================================
//
// Some assim que a página termina de carregar, respeitando uma duração
// mínima curta (evita um "flash" abrupto) e um tempo máximo de segurança
// (evita ficar presa se algum recurso externo demorar demais).

function inicializarTelaDeCarregamento(aoTerminar) {
  const telaDeCarregamento = document.getElementById("tela-carregamento");
  if (!telaDeCarregamento) {
    if (typeof aoTerminar === "function") aoTerminar();
    return;
  }

  const DURACAO_MINIMA_MS = 500;
  const TEMPO_MAXIMO_MS = 4000;
  const inicio = Date.now();
  let jaEscondeu = false;

  function esconder() {
    if (jaEscondeu) return;
    jaEscondeu = true;

    const decorrido = Date.now() - inicio;
    const espera = Math.max(DURACAO_MINIMA_MS - decorrido, 0);

    window.setTimeout(() => {
      telaDeCarregamento.classList.add("carregamento--oculto");
      if (typeof aoTerminar === "function") aoTerminar();
    }, espera);
  }

  window.addEventListener("load", esconder);
  window.setTimeout(esconder, TEMPO_MAXIMO_MS);
}

// ===================================================
// MENSAGEM ANIMADA NO WHATSAPP FLUTUANTE
// ===================================================
//
// Some do lado do botão, expande uma vez (saindo de trás do ícone), fica
// visível por alguns segundos e recolhe de volta. Só roda uma vez, disparada
// depois que a tela de carregamento some — nunca de novo durante o scroll.

function prepararMensagemWhatsapp() {
  const mensagem = document.getElementById("mensagem-whatsapp-flutuante");
  if (!mensagem) return null;

  const ATRASO_PARA_MOSTRAR_MS = 1000;
  const DURACAO_VISIVEL_MS = 3000;

  return function agendar() {
    window.setTimeout(() => {
      mensagem.classList.add("whatsapp-flutuante__mensagem--visivel");

      window.setTimeout(() => {
        mensagem.classList.remove("whatsapp-flutuante__mensagem--visivel");
      }, DURACAO_VISIVEL_MS);
    }, ATRASO_PARA_MOSTRAR_MS);
  };
}

// ===================================================
// TEMA CLARO/ESCURO
// ===================================================
//
// O tema em si já foi aplicado o mais cedo possível por um script inline no
// <head> (evita flash do tema errado). Aqui só cuidamos do botão: alternar o
// atributo, guardar a escolha do usuário e manter o ícone/aria-label corretos.

function inicializarTema() {
  const botaoTema = document.getElementById("botao-tema");
  if (!botaoTema) return;

  const iconeLua = botaoTema.querySelector(".icone-lua");
  const iconeSol = botaoTema.querySelector(".icone-sol");

  function temaEstaEscuro() {
    return document.documentElement.getAttribute("data-theme") === "dark";
  }

  function atualizarBotao() {
    const escuro = temaEstaEscuro();
    botaoTema.setAttribute("aria-label", escuro ? "Ativar modo claro" : "Ativar modo escuro");

    if (iconeLua && iconeSol) {
      // Tema claro mostra a lua (convida a escurecer); tema escuro mostra o sol.
      iconeLua.hidden = escuro;
      iconeSol.hidden = !escuro;
    }
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

    atualizarBotao();
  });

  atualizarBotao();
}

// ===================================================
// ROLAGEM SUAVE ATÉ AS SEÇÕES (compensando o cabeçalho fixo)
// ===================================================
//
// O scroll nativo do navegador para links de âncora (#id) nem sempre respeita
// o cabeçalho fixo de forma confiável em todos os aparelhos/navegadores.
// Aqui calculamos a posição exata do alvo a cada clique e rolamos até lá,
// sempre deixando o cabeçalho livre.

function inicializarRolagemSuave() {
  const cabecalho = document.getElementById("cabecalho");
  const linksInternos = document.querySelectorAll('a[href^="#"]');

  if (linksInternos.length === 0) return;

  const prefereMovimentoReduzido = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  // Ajuste fino apenas para #localizacao: a seção é mais alta que a tela em
  // muitos aparelhos, então descemos mais um pouco para o botão do WhatsApp
  // aparecer inteiro, em vez de parar exatamente no topo da seção.
  const ajustesExtras = {
    localizacao: 96,
  };

  linksInternos.forEach((link) => {
    const destino = link.getAttribute("href").slice(1);
    if (!destino) return;

    const alvo = document.getElementById(destino);
    if (!alvo) return;

    link.addEventListener("click", (evento) => {
      evento.preventDefault();

      const alturaCabecalho = cabecalho ? cabecalho.offsetHeight : 0;
      const extra = ajustesExtras[destino] || 0;
      const posicaoAlvo =
        alvo.getBoundingClientRect().top + window.scrollY - alturaCabecalho + extra;

      window.scrollTo({
        top: Math.max(posicaoAlvo, 0),
        behavior: prefereMovimentoReduzido ? "auto" : "smooth",
      });

      history.pushState(null, "", `#${destino}`);
    });
  });
}

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
  const botoesAtracaoAnterior = Array.from(
    document.querySelectorAll(".js-seta-anterior")
  );
  const botoesProximaAtracao = Array.from(
    document.querySelectorAll(".js-seta-proxima")
  );
  const barraDeProgresso = document.getElementById("barra-progresso-autoplay");
  const anuncioDoCarrossel = document.getElementById("anuncio-carrossel");
  const imagensFundoHero = Array.from(
    document.querySelectorAll(".hero__fundo-imagem")
  );

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

    sincronizarFundoDoHero(diaDoSlideAtivo);
  }

  // Mantém o fundo do hero no mesmo evento do carrossel. O crossfade é só CSS
  // (transição de opacidade), então prefers-reduced-motion já troca sem fade.
  function sincronizarFundoDoHero(dia) {
    imagensFundoHero.forEach((imagem) => {
      imagem.classList.toggle("hero__fundo-imagem--ativa", imagem.dataset.dia === dia);
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

  // Controles manuais dos dias.
  botoesDosDias.forEach((botao) => {
    botao.addEventListener("click", () => {
      irParaODia(botao.dataset.dia);
      reiniciarContagemDoCarrossel();
    });
  });

  // Setas anterior e próxima (flutuantes sobre a imagem de cada slide).
  botoesAtracaoAnterior.forEach((botao) => {
    botao.addEventListener("click", () => {
      irParaAtracaoAnterior({ anunciar: true });
      reiniciarContagemDoCarrossel();
    });
  });

  botoesProximaAtracao.forEach((botao) => {
    botao.addEventListener("click", () => {
      irParaProximaAtracao({ anunciar: true });
      reiniciarContagemDoCarrossel();
    });
  });

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

  if (prefereMovimentoReduzido) {
    autoplayFoiPausadoPeloUsuario = true;
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
