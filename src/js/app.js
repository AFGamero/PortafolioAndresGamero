/* ============================================================
   app.js — Portfolio Andrés Gamero
   src/js/app.js  →  compilado a  build/js/bundle.min.js

   Módulos:
   1. NAV  — scroll effect + is-scrolled
   2. MENU — hamburger mobile (iOS-safe, ARIA, focus trap)
   3. SCROLL ANIMATIONS — IntersectionObserver + fade-in
   4. LEVEL BARS — animación de barras de progreso tech-cards
   5. SMOOTH SCROLL — anclas con offset del nav fijo
   6. ACTIVE LINK — resaltar link activo según sección visible
   ============================================================ */

(function () {
  "use strict";

  /* ----------------------------------------------------------
       ELEMENTOS GLOBALES
    ---------------------------------------------------------- */
  const nav = document.getElementById("nav");
  const navToggle = document.getElementById("navToggle");
  const navLinks = document.getElementById("navLinks");

  // Debe coincidir con $tablet en scss/base/_variables.scss
  const MOBILE_BREAKPOINT = 768;
  const SCROLL_THRESHOLD = 60;

  // Guardar si hay soporte para scroll instantáneo (no todos los browsers)
  const supportsInstantScroll = (function () {
    try {
      window.scrollTo({ top: 0, behavior: "instant" });
      return true;
    } catch (e) {
      return false;
    }
  })();

  /* ----------------------------------------------------------
       1. NAV — efecto de fondo al hacer scroll
    ---------------------------------------------------------- */
  function handleNavScroll() {
    nav.classList.toggle("is-scrolled", window.scrollY > SCROLL_THRESHOLD);
  }

  window.addEventListener("scroll", handleNavScroll, { passive: true });
  handleNavScroll(); // ejecutar al cargar por si la página ya está scrolleada

  /* ----------------------------------------------------------
       2. MENÚ MOBILE — hamburguesa completa
    ---------------------------------------------------------- */

  /**
   * Abre o cierra el menú actualizando:
   * - clases CSS (.is-open)
   * - bloqueo de scroll del body (técnica iOS-safe con position:fixed)
   * - atributos ARIA para accesibilidad
   */
  function setMenuOpen(open) {
    navLinks.classList.toggle("is-open", open);
    navToggle.classList.toggle("is-open", open);

    if (open) {
      // Calcular ancho del scrollbar para evitar el "salto" de layout
      var scrollbarWidth =
        window.innerWidth - document.documentElement.clientWidth;

      // Guardar scroll actual
      var scrollY = window.scrollY;
      document.body.dataset.scrollY = scrollY;

      // Compensar el scrollbar antes de fijar el body
      document.body.style.paddingRight = scrollbarWidth + "px";
      nav.style.paddingRight = scrollbarWidth + "px";

      // Fijar el body en la posición actual (iOS-safe)
      document.body.style.position = "fixed";
      document.body.style.top = "-" + scrollY + "px";
      document.body.style.left = "0";
      document.body.style.right = "0";
      document.body.style.width = "100%";
    } else {
      // Restaurar posición exacta de scroll
      var savedY = parseInt(document.body.dataset.scrollY || "0", 10);

      // Quitar estilos del body
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      document.body.style.width = "";
      document.body.style.paddingRight = "";
      nav.style.paddingRight = "";

      // Volver a la posición sin animación
      if (supportsInstantScroll) {
        window.scrollTo({ top: savedY, behavior: "instant" });
      } else {
        window.scrollTo(0, savedY);
      }
    }

    // Actualizar ARIA
    navToggle.setAttribute("aria-expanded", open ? "true" : "false");
    navLinks.setAttribute("aria-hidden", open ? "false" : "true");
  }

  function isMenuOpen() {
    return navLinks.classList.contains("is-open");
  }

  function isMobile() {
    return window.innerWidth < MOBILE_BREAKPOINT;
  }

  // — Abrir / cerrar con el botón hamburguesa
  navToggle.addEventListener("click", function () {
    setMenuOpen(!isMenuOpen());
  });

  // — Cerrar al tocar cualquier link del menú
  navLinks.querySelectorAll(".nav__link").forEach(function (link) {
    link.addEventListener("click", function () {
      if (isMobile()) {
        setMenuOpen(false);
      }
    });
  });

  // — Cerrar con la tecla Escape y devolver foco al botón
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && isMenuOpen()) {
      setMenuOpen(false);
      navToggle.focus();
    }
  });

  // — Cerrar al tocar fuera del nav (overlay oscuro de fondo)
  document.addEventListener("click", function (e) {
    if (isMenuOpen() && !nav.contains(e.target)) {
      setMenuOpen(false);
    }
  });

  // — Cerrar y limpiar si se redimensiona a desktop (ej: rotar tablet)
  window.addEventListener("resize", function () {
    if (!isMobile() && isMenuOpen()) {
      setMenuOpen(false);
    }
  });

  // — Trap de foco: Tab y Shift+Tab ciclan solo dentro del menú abierto
  navLinks.addEventListener("keydown", function (e) {
    if (!isMenuOpen() || e.key !== "Tab") return;

    var focusable = Array.from(
      navLinks.querySelectorAll("a[href], button:not([disabled])"),
    );
    var first = focusable[0];
    var last = focusable[focusable.length - 1];

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      navToggle.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });

  // — Inicializar atributos ARIA en estado cerrado
  navToggle.setAttribute("aria-expanded", "false");
  navToggle.setAttribute("aria-controls", "navLinks");
  navLinks.setAttribute("aria-hidden", "true");

  /* ----------------------------------------------------------
       3. SCROLL ANIMATIONS — fade-in con IntersectionObserver
    ---------------------------------------------------------- */
  var animatableSelectors = [
    ".sobre-mi__layout",
    ".tecnologias__category",
    ".proyecto-card",
    ".contacto__content",
    ".contacto__links",
    ".tech-card",
    ".stat",
    ".pillar",
  ];

  // Agregar clase base de animación
  animatableSelectors.forEach(function (selector) {
    document.querySelectorAll(selector).forEach(function (el) {
      el.classList.add("animate-on-scroll");
    });
  });

  // Delays escalonados para elementos dentro de grids
  ["tecnologias__grid", "proyectos__grid"].forEach(function (gridClass) {
    document.querySelectorAll("." + gridClass).forEach(function (grid) {
      grid
        .querySelectorAll(".tech-card, .proyecto-card")
        .forEach(function (card, i) {
          card.style.transitionDelay = i * 0.07 + "s";
        });
    });
  });

  /* ----------------------------------------------------------
       4. LEVEL BARS — activar barras de progreso al entrar en vista
    ---------------------------------------------------------- */
  function triggerLevelBar(card) {
    var bar = card.querySelector(".tech-card__level-bar");
    if (!bar) return;

    // Leer el valor original desde el atributo style inline
    var styleAttr = bar.getAttribute("style") || "";
    var match = styleAttr.match(/--level:\s*([^;]+)/);
    if (!match) return;

    var targetLevel = match[1].trim();

    // Resetear a 0 y luego animar hasta el valor real
    bar.style.setProperty("--level", "0%");
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        bar.style.setProperty("--level", targetLevel);
      });
    });
  }

  /* ----------------------------------------------------------
       IntersectionObserver — une módulos 3 y 4
    ---------------------------------------------------------- */
  if ("IntersectionObserver" in window) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;

          // Fade-in
          entry.target.classList.add("is-visible");

          // Barra de nivel (si la card tiene una)
          triggerLevelBar(entry.target);

          // Dejar de observar una vez animado
          observer.unobserve(entry.target);
        });
      },
      {
        threshold: 0.08,
        rootMargin: "0px 0px -40px 0px",
      },
    );

    document.querySelectorAll(".animate-on-scroll").forEach(function (el) {
      observer.observe(el);
    });
  } else {
    // Fallback para browsers sin IntersectionObserver (IE11, etc.)
    document.querySelectorAll(".animate-on-scroll").forEach(function (el) {
      el.classList.add("is-visible");
    });
  }

  /* ----------------------------------------------------------
       5. SMOOTH SCROLL — anclas con offset del nav fijo
    ---------------------------------------------------------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener("click", function (e) {
      var href = this.getAttribute("href");
      var target = document.querySelector(href);
      if (!target) return;

      e.preventDefault();

      var navHeight = nav ? nav.offsetHeight : 0;
      var top =
        target.getBoundingClientRect().top + window.scrollY - navHeight - 16;
      window.scrollTo({ top: top, behavior: "smooth" });
    });
  });

  /* ----------------------------------------------------------
       6. ACTIVE LINK — resaltar enlace según sección visible
    ---------------------------------------------------------- */
  var sections = document.querySelectorAll("section[id]");
  var navLinksAll = document.querySelectorAll(".nav__link");

  function updateActiveLink() {
    var current = "";
    var navHeight = nav ? nav.offsetHeight : 0;
    var scrollY = window.scrollY;

    sections.forEach(function (section) {
      var sectionTop = section.offsetTop - navHeight - 80;
      if (scrollY >= sectionTop) {
        current = section.getAttribute("id");
      }
    });

    navLinksAll.forEach(function (link) {
      var href = link.getAttribute("href");
      if (href === "#" + current) {
        link.classList.add("nav__link--active");
      } else {
        link.classList.remove("nav__link--active");
      }
    });
  }

  window.addEventListener("scroll", updateActiveLink, { passive: true });
  updateActiveLink(); // ejecutar al cargar
})();
