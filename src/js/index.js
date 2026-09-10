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
  inicializarLightbox();
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
  const botaoControleAutomatico = document.getElementById("botao-controle-automatico");
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
  let lightboxEstaAberto = false;

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
      !estaArrastando &&
      !lightboxEstaAberto
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

  // Botão de pausar/retomar a apresentação automática (WCAG 2.2.2): reflete no
  // rótulo e no ícone se o autoplay está parado por escolha do usuário.
  function atualizarBotaoControle() {
    if (!botaoControleAutomatico) return;

    const iconePausar = botaoControleAutomatico.querySelector(".icone-pausar");
    const iconeRetomar = botaoControleAutomatico.querySelector(".icone-retomar");
    const pausado = autoplayFoiPausadoPeloUsuario;

    botaoControleAutomatico.setAttribute(
      "aria-label",
      pausado ? "Retomar apresentação automática" : "Pausar apresentação automática"
    );

    // Atributo "hidden" (não a propriedade .hidden, que não reflete em <svg>).
    if (iconePausar && iconeRetomar) {
      iconePausar.toggleAttribute("hidden", pausado);
      iconeRetomar.toggleAttribute("hidden", !pausado);
    }
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

  // Pausar / retomar a apresentação automática.
  if (botaoControleAutomatico) {
    botaoControleAutomatico.addEventListener("click", () => {
      autoplayFoiPausadoPeloUsuario = !autoplayFoiPausadoPeloUsuario;
      atualizarBotaoControle();

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

  // Pausa enquanto o lightbox estiver aberto (uma foto pode ter vindo daqui).
  document.addEventListener("petrocerva:lightbox-abriu", () => {
    lightboxEstaAberto = true;
    pausarCarrosselAutomatico();
  });
  document.addEventListener("petrocerva:lightbox-fechou", () => {
    lightboxEstaAberto = false;
    if (deveAutoplayRodar()) iniciarCarrosselAutomatico();
  });

  // O lightbox pede para trocar de dia quando o usuário navega entre os
  // flyers ampliados — o carrossel acompanha por baixo.
  document.addEventListener("petrocerva:ir-para-dia", (evento) => {
    const dia = evento.detail && evento.detail.dia;
    if (dia) irParaODia(dia);
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
  atualizarBotaoControle();

  if (prefereMovimentoReduzido) {
    autoplayFoiPausadoPeloUsuario = true;
    atualizarBotaoControle();
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
// LIGHTBOX — imagens ampliadas
// ===================================================
//
// Clique (ou Enter/Espaço) numa foto da galeria, do cardápio ou do carrossel
// abre um <dialog> modal: a imagem "cresce" da miniatura até o centro da tela
// (FLIP com transform/opacity) sobre um fundo escurecido. Fecha por Esc, clique
// fora, botão X ou botão voltar do navegador. Respeita prefers-reduced-motion
// (aparece/some sem a animação de expansão).
//
// Fotos do carrossel: o zoom só existe no desktop (no mobile o flyer já aparece
// grande e inteiro). Com um flyer ampliado, arrastar a imagem para os lados —
// ou usar as setas do teclado — troca de dia de show; o carrossel acompanha por
// baixo. O autoplay pausa enquanto o lightbox está aberto.

function inicializarLightbox() {
  const imagensAmpliaveis = Array.from(
    document.querySelectorAll(".galeria__imagem, .cardapio__imagem, .atracao__imagem")
  );
  const dialogo = document.getElementById("lightbox");
  const imagemAmpliada = document.getElementById("lightbox-imagem");
  const botaoFechar = document.getElementById("lightbox-fechar");

  if (imagensAmpliaveis.length === 0 || !dialogo || !imagemAmpliada || !botaoFechar) {
    return;
  }

  // Sem suporte a <dialog> modal: melhor não prometer o recurso.
  if (typeof dialogo.showModal !== "function") return;

  const DURACAO_MS = 300;
  const consultaMovimentoReduzido = window.matchMedia("(prefers-reduced-motion: reduce)");
  // Zoom das fotos do carrossel: só a partir do desktop.
  const consultaDesktop = window.matchMedia("(min-width: 64rem)");

  const flyersDoCarrossel = imagensAmpliaveis.filter((imagem) =>
    imagem.closest(".carrossel-programacao__slide")
  );

  let miniaturaDeOrigem = null;
  let indiceFlyer = -1;
  let estaFechando = false;
  let cancelarTrocaFlyer = null;
  let houveArraste = false;
  let arraste = null;

  function calcularTransformacao(retanguloDestino, retanguloOrigem) {
    const escalaX = retanguloOrigem.width / retanguloDestino.width;
    const escalaY = retanguloOrigem.height / retanguloDestino.height;
    const deslocX =
      retanguloOrigem.left + retanguloOrigem.width / 2 -
      (retanguloDestino.left + retanguloDestino.width / 2);
    const deslocY =
      retanguloOrigem.top + retanguloOrigem.height / 2 -
      (retanguloDestino.top + retanguloDestino.height / 2);
    return `translate(${deslocX}px, ${deslocY}px) scale(${escalaX}, ${escalaY})`;
  }

  function animarExpansao(retanguloOrigem) {
    const retanguloDestino = imagemAmpliada.getBoundingClientRect();
    if (!retanguloDestino.width || !retanguloDestino.height) return;

    imagemAmpliada.style.transition = "none";
    imagemAmpliada.style.transform = calcularTransformacao(retanguloDestino, retanguloOrigem);
    // Força reflow para o browser registrar o ponto de partida.
    void imagemAmpliada.offsetWidth;
    imagemAmpliada.style.transition = `transform ${DURACAO_MS}ms cubic-bezier(0.16, 1, 0.3, 1)`;
    imagemAmpliada.style.transform = "translate(0, 0) scale(1)";
  }

  function zerarTransformada() {
    imagemAmpliada.style.transition = "none";
    imagemAmpliada.style.transform = "";
    void imagemAmpliada.offsetWidth;
  }

  function abrir(miniatura) {
    if (dialogo.open) return;

    miniaturaDeOrigem = miniatura;
    estaFechando = false;
    indiceFlyer = flyersDoCarrossel.indexOf(miniatura);

    if (indiceFlyer !== -1) {
      // Pré-carrega os outros flyers para a navegação não piscar.
      flyersDoCarrossel.forEach((flyer) => {
        const url = flyer.currentSrc || flyer.src;
        if (url) {
          const preload = new Image();
          preload.src = url;
        }
      });
    }

    const retanguloOrigem = miniatura.getBoundingClientRect();
    imagemAmpliada.src = miniatura.currentSrc || miniatura.src;
    imagemAmpliada.alt = miniatura.alt || "";
    imagemAmpliada.style.transition = "";
    imagemAmpliada.style.transform = "";

    history.pushState({ lightbox: true }, "");
    dialogo.showModal();
    document.documentElement.classList.add("sem-scroll");
    dialogo.classList.add("lightbox--aberto");
    dialogo.classList.toggle("lightbox--navegavel", indiceFlyer !== -1);
    document.dispatchEvent(new CustomEvent("petrocerva:lightbox-abriu"));

    if (consultaMovimentoReduzido.matches) return;

    if (imagemAmpliada.complete && imagemAmpliada.naturalWidth) {
      animarExpansao(retanguloOrigem);
    } else {
      imagemAmpliada.addEventListener(
        "load",
        () => animarExpansao(retanguloOrigem),
        { once: true }
      );
    }
  }

  // Troca o flyer ampliado (direcao: 1 = próximo dia, -1 = anterior) com um
  // deslize lateral, e pede ao carrossel para acompanhar.
  function trocarFlyer(direcao) {
    if (indiceFlyer === -1 || flyersDoCarrossel.length < 2 || !dialogo.open) return;
    if (cancelarTrocaFlyer) cancelarTrocaFlyer();

    const total = flyersDoCarrossel.length;
    const novoIndice = (indiceFlyer + direcao + total) % total;
    if (novoIndice === indiceFlyer) return;

    indiceFlyer = novoIndice;
    const flyer = flyersDoCarrossel[novoIndice];
    miniaturaDeOrigem = flyer;

    const slide = flyer.closest(".carrossel-programacao__slide");
    if (slide && slide.dataset.dia) {
      document.dispatchEvent(
        new CustomEvent("petrocerva:ir-para-dia", { detail: { dia: slide.dataset.dia } })
      );
    }

    const novaSrc = flyer.currentSrc || flyer.src;
    const novoAlt = flyer.alt || "";

    if (consultaMovimentoReduzido.matches) {
      imagemAmpliada.style.transition = "none";
      imagemAmpliada.style.transform = "";
      imagemAmpliada.src = novaSrc;
      imagemAmpliada.alt = novoAlt;
      return;
    }

    const larguraTela = Math.max(window.innerWidth, 1);
    const saida = direcao > 0 ? -larguraTela : larguraTela;

    imagemAmpliada.style.transition = `transform ${DURACAO_MS}ms ease`;
    imagemAmpliada.style.transform = `translateX(${saida}px)`;

    let feito = false;
    const concluir = () => {
      if (feito) return;
      feito = true;
      imagemAmpliada.removeEventListener("transitionend", concluir);
      window.clearTimeout(temporizador);
      cancelarTrocaFlyer = null;

      imagemAmpliada.src = novaSrc;
      imagemAmpliada.alt = novoAlt;
      imagemAmpliada.style.transition = "none";
      imagemAmpliada.style.transform = `translateX(${-saida}px)`;
      void imagemAmpliada.offsetWidth;
      imagemAmpliada.style.transition = `transform ${DURACAO_MS}ms cubic-bezier(0.16, 1, 0.3, 1)`;
      imagemAmpliada.style.transform = "translateX(0)";
    };
    imagemAmpliada.addEventListener("transitionend", concluir);
    const temporizador = window.setTimeout(concluir, DURACAO_MS + 80);
    cancelarTrocaFlyer = () => {
      feito = true;
      imagemAmpliada.removeEventListener("transitionend", concluir);
      window.clearTimeout(temporizador);
      cancelarTrocaFlyer = null;
    };
  }

  function limpar() {
    if (cancelarTrocaFlyer) cancelarTrocaFlyer();
    dialogo.classList.remove("lightbox--aberto");
    document.documentElement.classList.remove("sem-scroll");
    imagemAmpliada.style.transition = "";
    imagemAmpliada.style.transform = "";
    dialogo.close();
  }

  function fechar() {
    if (estaFechando || !dialogo.open) return;
    estaFechando = true;
    if (cancelarTrocaFlyer) cancelarTrocaFlyer();

    if (consultaMovimentoReduzido.matches || !miniaturaDeOrigem) {
      limpar();
      return;
    }

    // FLIP de volta: encolhe até a miniatura antes de sumir.
    dialogo.classList.remove("lightbox--aberto");
    // Parte da posição central real (uma troca de flyer pode ter deixado a
    // imagem deslocada no eixo X).
    zerarTransformada();

    const retanguloDestino = imagemAmpliada.getBoundingClientRect();
    const retanguloOrigem = miniaturaDeOrigem.getBoundingClientRect();

    imagemAmpliada.style.transition = `transform ${DURACAO_MS}ms cubic-bezier(0.4, 0, 1, 1)`;
    imagemAmpliada.style.transform = calcularTransformacao(retanguloDestino, retanguloOrigem);

    let finalizado = false;
    const encerrar = () => {
      if (finalizado) return;
      finalizado = true;
      imagemAmpliada.removeEventListener("transitionend", encerrar);
      limpar();
    };
    imagemAmpliada.addEventListener("transitionend", encerrar);
    window.setTimeout(encerrar, DURACAO_MS + 80);
  }

  imagensAmpliaveis.forEach((imagem) => {
    const slideDoCarrossel = imagem.closest(".carrossel-programacao__slide");
    const zoomHabilitado = () => !slideDoCarrossel || consultaDesktop.matches;

    if (slideDoCarrossel) {
      // No desktop: vira "botão", e só a foto do slide visível é tabulável.
      // No mobile: some tudo — o carrossel volta ao comportamento antigo.
      const sincronizar = () => {
        if (consultaDesktop.matches) {
          imagem.setAttribute("role", "button");
          imagem.setAttribute("aria-haspopup", "dialog");
          const ativo = slideDoCarrossel.getAttribute("aria-hidden") === "false";
          imagem.setAttribute("tabindex", ativo ? "0" : "-1");
        } else {
          imagem.removeAttribute("role");
          imagem.removeAttribute("aria-haspopup");
          imagem.removeAttribute("tabindex");
        }
      };
      sincronizar();
      new MutationObserver(sincronizar).observe(slideDoCarrossel, {
        attributes: true,
        attributeFilter: ["aria-hidden"],
      });
      consultaDesktop.addEventListener("change", sincronizar);
    } else {
      imagem.classList.add("imagem-ampliavel");
      imagem.setAttribute("role", "button");
      imagem.setAttribute("aria-haspopup", "dialog");
      imagem.setAttribute("tabindex", "0");
    }

    // Distingue clique de arraste (o carrossel move-se ao arrastar a foto).
    let pontoInicial = null;
    imagem.addEventListener("pointerdown", (evento) => {
      pontoInicial = { x: evento.clientX, y: evento.clientY };
    });
    imagem.addEventListener("click", (evento) => {
      if (!zoomHabilitado()) return;
      if (pontoInicial) {
        const arrastou =
          Math.abs(evento.clientX - pontoInicial.x) > 10 ||
          Math.abs(evento.clientY - pontoInicial.y) > 10;
        pontoInicial = null;
        if (arrastou) return;
      }
      abrir(imagem);
    });

    imagem.addEventListener("keydown", (evento) => {
      if (!zoomHabilitado()) return;
      if (evento.key === "Enter" || evento.key === " ") {
        evento.preventDefault();
        abrir(imagem);
      }
    });
  });

  // --- Arrastar a imagem ampliada para trocar de flyer (só quando veio do
  //     carrossel). ---
  imagemAmpliada.draggable = false; // <img> é arrastável por padrão (drag & drop nativo)
  imagemAmpliada.addEventListener("dragstart", (evento) => evento.preventDefault());
  imagemAmpliada.addEventListener("pointerdown", (evento) => {
    if (indiceFlyer === -1 || !dialogo.open) return;
    evento.preventDefault(); // impede o drag & drop nativo da imagem
    if (cancelarTrocaFlyer) cancelarTrocaFlyer();
    arraste = { inicioX: evento.clientX, desloc: 0, id: evento.pointerId };
    houveArraste = false;
    try {
      imagemAmpliada.setPointerCapture(evento.pointerId);
    } catch (erro) {
      /* alguns navegadores recusam capture em certos ponteiros — segue sem. */
    }
    imagemAmpliada.style.transition = "none";
  });

  imagemAmpliada.addEventListener("pointermove", (evento) => {
    if (!arraste || evento.pointerId !== arraste.id) return;
    arraste.desloc = evento.clientX - arraste.inicioX;
    if (Math.abs(arraste.desloc) > 5) houveArraste = true;
    imagemAmpliada.style.transform = `translateX(${arraste.desloc}px)`;
  });

  function encerrarArraste(evento) {
    if (!arraste || (evento && evento.pointerId !== arraste.id)) return;
    const desloc = arraste.desloc;
    arraste = null;

    const LIMIAR = 60;
    if (Math.abs(desloc) > LIMIAR) {
      trocarFlyer(desloc < 0 ? 1 : -1);
    } else {
      imagemAmpliada.style.transition = `transform ${DURACAO_MS}ms cubic-bezier(0.16, 1, 0.3, 1)`;
      imagemAmpliada.style.transform = "translateX(0)";
    }
    if (houveArraste) {
      // Mantém o guard do clique-fora ativo até o 'click' desta sequência passar.
      window.setTimeout(() => {
        houveArraste = false;
      }, 0);
    }
  }
  imagemAmpliada.addEventListener("pointerup", encerrarArraste);
  imagemAmpliada.addEventListener("pointercancel", encerrarArraste);

  botaoFechar.addEventListener("click", fechar);

  // Clique fora da imagem (área do backdrop) — ignora se acabou de arrastar.
  dialogo.addEventListener("click", (evento) => {
    if (houveArraste) {
      houveArraste = false;
      return;
    }
    if (evento.target === dialogo) fechar();
  });

  // Esc: evita o fechamento instantâneo do <dialog> para animar a saída.
  dialogo.addEventListener("cancel", (evento) => {
    evento.preventDefault();
    fechar();
  });

  // Setas do teclado navegam entre os flyers ampliados.
  dialogo.addEventListener("keydown", (evento) => {
    if (indiceFlyer === -1) return;
    if (evento.key === "ArrowRight") {
      evento.preventDefault();
      trocarFlyer(1);
    } else if (evento.key === "ArrowLeft") {
      evento.preventDefault();
      trocarFlyer(-1);
    }
  });

  // Fechou (por qualquer via): devolve o foco e desfaz o passo no histórico.
  dialogo.addEventListener("close", () => {
    estaFechando = false;
    indiceFlyer = -1;
    if (cancelarTrocaFlyer) cancelarTrocaFlyer();
    dialogo.classList.remove("lightbox--navegavel");
    document.dispatchEvent(new CustomEvent("petrocerva:lightbox-fechou"));
    if (miniaturaDeOrigem && typeof miniaturaDeOrigem.focus === "function") {
      miniaturaDeOrigem.focus();
    }
    if (history.state && history.state.lightbox) {
      history.back();
    }
  });

  // Botão/gesto de voltar do navegador.
  window.addEventListener("popstate", () => {
    if (dialogo.open) fechar();
  });
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
