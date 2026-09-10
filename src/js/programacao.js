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

  mostrar(0, false);
})();
