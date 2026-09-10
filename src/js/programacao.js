// ===================================================
// PETROCERVA GASTROBAR - programacao.js
// Carrossel de tela cheia (QR em banner de fachada): arrastar para os
// lados, setas, abas de dia. Sem autoplay, sem dependências.
// ===================================================

document.documentElement.classList.add("js");

(function () {
  var raiz = document.querySelector("[data-carrossel]");
  if (!raiz) return;

  var viewport = raiz.querySelector(".carrossel__viewport");
  var trilho = raiz.querySelector(".carrossel__trilho");
  var slides = Array.prototype.slice.call(raiz.querySelectorAll(".carrossel__slide"));
  var abas = Array.prototype.slice.call(raiz.querySelectorAll(".carrossel__tab"));
  var btnAnterior = raiz.querySelector("[data-anterior]");
  var btnProximo = raiz.querySelector("[data-proximo]");
  var anuncio = raiz.querySelector("[data-anuncio]");

  var total = slides.length;
  if (!viewport || !trilho || total === 0) return;

  var NOMES = { sexta: "Sexta-feira", sabado: "Sábado", domingo: "Domingo" };

  var indice = 0;
  var arrastando = false;
  var xInicial = 0;
  var deslocamento = 0;
  var houveArraste = false;

  function indiceDoDia(dia) {
    for (var i = 0; i < total; i++) {
      if (slides[i].getAttribute("data-dia") === dia) return i;
    }
    return -1;
  }

  function mostrar(novo, anunciar) {
    indice = ((novo % total) + total) % total;
    trilho.style.transform = "translateX(-" + indice * 100 + "%)";

    slides.forEach(function (slide, i) {
      var ativo = i === indice;
      slide.setAttribute("aria-hidden", ativo ? "false" : "true");
      var link = slide.querySelector("a");
      if (link) link.tabIndex = ativo ? 0 : -1;
    });

    var dia = slides[indice].getAttribute("data-dia");
    abas.forEach(function (aba) {
      var ativo = aba.getAttribute("data-dia") === dia;
      aba.classList.toggle("carrossel__tab--ativa", ativo);
      aba.setAttribute("aria-pressed", ativo ? "true" : "false");
    });

    if (anunciar && anuncio) {
      anuncio.textContent = "Programação de " + (NOMES[dia] || dia);
    }
  }

  function proximo() {
    mostrar(indice + 1, true);
  }

  function anterior() {
    mostrar(indice - 1, true);
  }

  if (btnProximo) btnProximo.addEventListener("click", proximo);
  if (btnAnterior) btnAnterior.addEventListener("click", anterior);

  abas.forEach(function (aba) {
    aba.addEventListener("click", function () {
      var alvo = indiceDoDia(aba.getAttribute("data-dia"));
      if (alvo !== -1) mostrar(alvo, true);
    });
  });

  raiz.addEventListener("keydown", function (evento) {
    if (evento.key === "ArrowRight") {
      evento.preventDefault();
      proximo();
    } else if (evento.key === "ArrowLeft") {
      evento.preventDefault();
      anterior();
    }
  });

  // --- Arraste: toque e mouse ---
  function iniciar(x) {
    arrastando = true;
    xInicial = x;
    deslocamento = 0;
    houveArraste = false;
    trilho.style.transition = "none";
  }

  function mover(x) {
    if (!arrastando) return;
    deslocamento = x - xInicial;
    if (Math.abs(deslocamento) > 5) houveArraste = true;
    var base = -indice * 100;
    var percentual = (deslocamento / viewport.offsetWidth) * 100;
    trilho.style.transform = "translateX(" + (base + percentual) + "%)";
  }

  function finalizar() {
    if (!arrastando) return;
    arrastando = false;
    trilho.style.transition = "";

    var limite = viewport.offsetWidth * 0.15;
    if (deslocamento <= -limite) {
      proximo();
    } else if (deslocamento >= limite) {
      anterior();
    } else {
      mostrar(indice);
    }
    deslocamento = 0;
  }

  viewport.addEventListener(
    "touchstart",
    function (evento) {
      iniciar(evento.touches[0].clientX);
    },
    { passive: true }
  );

  viewport.addEventListener(
    "touchmove",
    function (evento) {
      mover(evento.touches[0].clientX);
    },
    { passive: true }
  );

  viewport.addEventListener("touchend", finalizar);
  viewport.addEventListener("touchcancel", finalizar);

  viewport.addEventListener("mousedown", function (evento) {
    evento.preventDefault();
    iniciar(evento.clientX);
  });

  window.addEventListener("mousemove", function (evento) {
    if (arrastando) mover(evento.clientX);
  });

  window.addEventListener("mouseup", finalizar);

  // Bloqueia o clique acidental no link/seta logo após arrastar.
  viewport.addEventListener(
    "click",
    function (evento) {
      if (houveArraste) {
        evento.preventDefault();
        evento.stopPropagation();
        houveArraste = false;
      }
    },
    true
  );

  // --- Destaque do flyer (lightbox): toque no cartaz abre a imagem em tela
  //     cheia; arrastar para os lados (ou setas do teclado) troca de dia, e o
  //     carrossel por baixo acompanha. ---
  (function iniciarDestaque() {
    var dialogo = document.getElementById("prog-lightbox");
    var imagem = document.getElementById("prog-lightbox-imagem");
    var btnFechar = document.getElementById("prog-lightbox-fechar");
    var botoes = Array.prototype.slice.call(raiz.querySelectorAll("[data-ampliar]"));

    if (!dialogo || !imagem || !btnFechar || botoes.length === 0) return;
    if (typeof dialogo.showModal !== "function") return;

    var DURACAO = 280;
    var menosMovimento = window.matchMedia("(prefers-reduced-motion: reduce)");
    var fechando = false;
    var arraste = null;
    var houveArrasteLb = false;
    var cancelarTroca = null;
    var origem = null;

    function flyerDoIndice(i) {
      return slides[i].querySelector(".slide__figura img");
    }

    function abrir() {
      if (dialogo.open) return;
      var img = flyerDoIndice(indice);
      if (!img) return;

      fechando = false;
      origem = slides[indice].querySelector(".slide__figura");
      imagem.style.transition = "";
      imagem.style.transform = "";
      imagem.src = img.currentSrc || img.src;
      imagem.alt = img.alt || "";

      history.pushState({ destaque: true }, "");
      dialogo.showModal();
      document.documentElement.classList.add("sem-scroll");
      dialogo.classList.add("lightbox--aberto", "lightbox--navegavel");

      if (!menosMovimento.matches && typeof imagem.animate === "function") {
        imagem.animate(
          [
            { opacity: 0, transform: "scale(0.92)" },
            { opacity: 1, transform: "scale(1)" }
          ],
          { duration: DURACAO, easing: "cubic-bezier(0.16, 1, 0.3, 1)" }
        );
      }
    }

    function limpar() {
      if (cancelarTroca) cancelarTroca();
      dialogo.classList.remove("lightbox--aberto", "lightbox--navegavel");
      document.documentElement.classList.remove("sem-scroll");
      imagem.style.transition = "";
      imagem.style.transform = "";
      if (dialogo.open) dialogo.close();
    }

    function fechar() {
      if (fechando || !dialogo.open) return;
      fechando = true;
      if (cancelarTroca) cancelarTroca();

      if (menosMovimento.matches || typeof imagem.animate !== "function") {
        limpar();
        return;
      }

      var anim = imagem.animate(
        [
          { opacity: 1, transform: imagem.style.transform || "scale(1)" },
          { opacity: 0, transform: "scale(0.92)" }
        ],
        { duration: DURACAO, easing: "cubic-bezier(0.4, 0, 1, 1)" }
      );
      anim.onfinish = limpar;
      anim.oncancel = limpar;
    }

    // Troca o flyer ampliado e pede ao carrossel de baixo para acompanhar.
    function trocar(direcao) {
      if (!dialogo.open || total < 2) return;
      if (cancelarTroca) cancelarTroca();

      mostrar(indice + direcao, true);
      origem = slides[indice].querySelector(".slide__figura");

      var img = flyerDoIndice(indice);
      if (!img) return;
      var novaSrc = img.currentSrc || img.src;
      var novoAlt = img.alt || "";

      if (menosMovimento.matches) {
        imagem.style.transition = "none";
        imagem.style.transform = "";
        imagem.src = novaSrc;
        imagem.alt = novoAlt;
        return;
      }

      var largura = Math.max(window.innerWidth, 1);
      var saida = direcao > 0 ? -largura : largura;

      imagem.style.transition = "transform " + DURACAO + "ms ease";
      imagem.style.transform = "translateX(" + saida + "px)";

      var feito = false;
      function concluir() {
        if (feito) return;
        feito = true;
        imagem.removeEventListener("transitionend", concluir);
        window.clearTimeout(temporizador);
        cancelarTroca = null;

        imagem.src = novaSrc;
        imagem.alt = novoAlt;
        imagem.style.transition = "none";
        imagem.style.transform = "translateX(" + -saida + "px)";
        void imagem.offsetWidth;
        imagem.style.transition = "transform " + DURACAO + "ms cubic-bezier(0.16, 1, 0.3, 1)";
        imagem.style.transform = "translateX(0)";
      }
      imagem.addEventListener("transitionend", concluir);
      var temporizador = window.setTimeout(concluir, DURACAO + 80);
      cancelarTroca = function () {
        feito = true;
        imagem.removeEventListener("transitionend", concluir);
        window.clearTimeout(temporizador);
        cancelarTroca = null;
      };
    }

    // Abrir: distingue toque de arraste no cartaz.
    botoes.forEach(function (botao) {
      var ponto = null;
      botao.addEventListener("pointerdown", function (evento) {
        ponto = { x: evento.clientX, y: evento.clientY };
      });
      botao.addEventListener("click", function (evento) {
        if (houveArraste) return;
        if (ponto) {
          var mexeu =
            Math.abs(evento.clientX - ponto.x) > 10 ||
            Math.abs(evento.clientY - ponto.y) > 10;
          ponto = null;
          if (mexeu) return;
        }
        abrir();
      });
    });

    // Arrastar a imagem ampliada para trocar de dia.
    imagem.addEventListener("dragstart", function (evento) {
      evento.preventDefault();
    });
    imagem.addEventListener("pointerdown", function (evento) {
      if (!dialogo.open) return;
      evento.preventDefault();
      if (cancelarTroca) cancelarTroca();
      arraste = { inicioX: evento.clientX, desloc: 0, id: evento.pointerId };
      houveArrasteLb = false;
      try {
        imagem.setPointerCapture(evento.pointerId);
      } catch (erro) {
        /* alguns navegadores recusam capture — segue sem. */
      }
      imagem.style.transition = "none";
    });
    imagem.addEventListener("pointermove", function (evento) {
      if (!arraste || evento.pointerId !== arraste.id) return;
      arraste.desloc = evento.clientX - arraste.inicioX;
      if (Math.abs(arraste.desloc) > 5) houveArrasteLb = true;
      imagem.style.transform = "translateX(" + arraste.desloc + "px)";
    });
    function encerrarArraste(evento) {
      if (!arraste || (evento && evento.pointerId !== arraste.id)) return;
      var desloc = arraste.desloc;
      arraste = null;

      if (Math.abs(desloc) > 60) {
        trocar(desloc < 0 ? 1 : -1);
      } else {
        imagem.style.transition = "transform " + DURACAO + "ms cubic-bezier(0.16, 1, 0.3, 1)";
        imagem.style.transform = "translateX(0)";
      }
      if (houveArrasteLb) {
        window.setTimeout(function () {
          houveArrasteLb = false;
        }, 0);
      }
    }
    imagem.addEventListener("pointerup", encerrarArraste);
    imagem.addEventListener("pointercancel", encerrarArraste);

    btnFechar.addEventListener("click", fechar);

    dialogo.addEventListener("click", function (evento) {
      if (houveArrasteLb) {
        houveArrasteLb = false;
        return;
      }
      if (evento.target === dialogo) fechar();
    });

    dialogo.addEventListener("cancel", function (evento) {
      evento.preventDefault();
      fechar();
    });

    dialogo.addEventListener("keydown", function (evento) {
      if (evento.key === "ArrowRight") {
        evento.preventDefault();
        trocar(1);
      } else if (evento.key === "ArrowLeft") {
        evento.preventDefault();
        trocar(-1);
      }
    });

    dialogo.addEventListener("close", function () {
      fechando = false;
      if (cancelarTroca) cancelarTroca();
      dialogo.classList.remove("lightbox--aberto", "lightbox--navegavel");
      document.documentElement.classList.remove("sem-scroll");
      if (origem && typeof origem.focus === "function") origem.focus();
      if (history.state && history.state.destaque) history.back();
    });

    window.addEventListener("popstate", function () {
      if (dialogo.open) fechar();
    });
  })();

  mostrar(0, false);
})();
