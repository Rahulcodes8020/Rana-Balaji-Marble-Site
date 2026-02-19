/* assets/js/app.js (UPDATED)
   ✅ OLD code same flow
   ✅ Search feature ADDED (works with your HTML)
   ✅ Responsive + workable
   ✅ No unnecessary remove
*/

(() => {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  // year
  const y = $("#year");
  if (y) y.textContent = new Date().getFullYear();

  // mobile nav
  const toggle = $(".nav-toggle");
  const nav = $(".nav");
  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(open));
    });

    $$(".nav a").forEach((a) => {
      a.addEventListener("click", () => {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });

    document.addEventListener("click", (e) => {
      if (!nav.classList.contains("is-open")) return;
      const inside = nav.contains(e.target) || toggle.contains(e.target);
      if (!inside) {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  // lightbox
  const lightbox = $("[data-lightbox]");
  const lbImg = $(".lightbox__img", lightbox || document);
  const lbCap = $(".lightbox__caption", lightbox || document);
  const lbClose = $(".lightbox__close", lightbox || document);

  const openLB = (src, alt) => {
    if (!lightbox || !lbImg) return;
    lbImg.src = src;
    lbImg.alt = alt || "Gallery image";
    if (lbCap) lbCap.textContent = alt || "";
    lightbox.classList.add("is-open");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  };

  const closeLB = () => {
    if (!lightbox) return;
    lightbox.classList.remove("is-open");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    if (lbImg) lbImg.src = "";
  };

  if (lbClose) lbClose.addEventListener("click", closeLB);
  if (lightbox) {
    lightbox.addEventListener("click", (e) => {
      if (e.target === lightbox) closeLB();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeLB();
    });
  }

  $$("[data-gallery] .gallery__item").forEach((btn) => {
    btn.addEventListener("click", () => {
      openLB(btn.dataset.src, btn.dataset.alt);
    });
  });

  // ✅ Quick Quote (WhatsApp) — FINAL FIX (no double encoding)
  const quoteForm = $("[data-quote-form]");
  if (quoteForm) {
    quoteForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const fd = new FormData(quoteForm);
      const material = String(fd.get("material") || "").trim();
      const size = String(fd.get("size") || "").trim();
      const qty = String(fd.get("qty") || "").trim();
      const location = String(fd.get("location") || "").trim();

      if (!material || !size || !qty || !location) return;

      const phone = "918209940020"; // no +
      const message =
        `Hello Pokar,\n` +
        `I need marble quotation:\n` +
        `• Material/Type: ${material}\n` +
        `• Size & Thickness: ${size}\n` +
        `• Quantity: ${qty}\n` +
        `• Location: ${location}\n\n` +
        `Please share rate + available stock photos.`;

      const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

      // ✅ Best compatibility (mobile + desktop)
      if (/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
        window.location.href = url; // avoid popup block
      } else {
        window.open(url, "_blank", "noopener");
      }
    });
  }

  /* ===============================================================
     ✅ UPGRADES (Added only — no existing code changed)
     1) Lightbox: next/prev via Arrow keys + swipe
     2) Scroll reveal: auto add .reveal to key sections and animate
     3) Index sync fix: ensure currentIndex is always set BEFORE openLB
     4) ✅ Gallery Search: filter by data-name / data-alt (works with your HTML)
     =============================================================== */

  // 1) Lightbox next/prev support (gallery navigation)
  const galleryButtons = $$("[data-gallery] .gallery__item");
  let currentIndex = -1;
  let startX = 0;
  let startY = 0;

  const isOpen = () => !!(lightbox && lightbox.classList.contains("is-open"));

  const openByIndex = (idx) => {
    if (!galleryButtons.length) return;
    const safe = ((idx % galleryButtons.length) + galleryButtons.length) % galleryButtons.length;
    currentIndex = safe;
    const btn = galleryButtons[safe];
    openLB(btn.dataset.src, btn.dataset.alt);
  };

  const nextImg = () => {
    if (!isOpen()) return;
    openByIndex(currentIndex + 1);
  };

  const prevImg = () => {
    if (!isOpen()) return;
    openByIndex(currentIndex - 1);
  };

  // ✅ Index sync fix (capture)
  if (galleryButtons.length) {
    galleryButtons.forEach((btn, idx) => {
      btn.addEventListener(
        "click",
        () => {
          currentIndex = idx;
        },
        true
      );
    });
  }

  // Keyboard navigation
  document.addEventListener("keydown", (e) => {
    if (!isOpen()) return;
    if (e.key === "ArrowRight") nextImg();
    if (e.key === "ArrowLeft") prevImg();
  });

  // Swipe on mobile (inside lightbox)
  if (lightbox) {
    lightbox.addEventListener(
      "touchstart",
      (e) => {
        if (!isOpen()) return;
        const t = e.touches && e.touches[0];
        if (!t) return;
        startX = t.clientX;
        startY = t.clientY;
      },
      { passive: true }
    );

    lightbox.addEventListener(
      "touchend",
      (e) => {
        if (!isOpen()) return;
        const t = e.changedTouches && e.changedTouches[0];
        if (!t) return;
        const dx = t.clientX - startX;
        const dy = t.clientY - startY;

        if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
          if (dx < 0) nextImg();
          else prevImg();
        }
      },
      { passive: true }
    );
  }

  // 2) Scroll reveal
  const prefersReduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const markRevealTargets = () => {
    const selectors = [
      ".section",
      ".card",
      ".gallery__item",
      ".owner",
      ".contact__item",
      ".media",
      ".qq",
      ".quote",
      ".faq__item",
    ];

    selectors.forEach((sel) => {
      $$(sel).forEach((el) => {
        if (!el.classList.contains("reveal")) el.classList.add("reveal");
      });
    });
  };

  const runReveal = () => {
    if (prefersReduced) {
      $$(".reveal").forEach((el) => el.classList.add("is-visible"));
      return;
    }

    if (!("IntersectionObserver" in window)) {
      $$(".reveal").forEach((el) => el.classList.add("is-visible"));
      return;
    }

    const io = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          obs.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
    );

    $$(".reveal").forEach((el) => io.observe(el));
  };

  markRevealTargets();
  runReveal();

  /* ===============================================================
     4) ✅ GALLERY SEARCH (WORKING)
     HTML requirement:
       - Search wrap: [data-gallery-search]
       - Input: .gallery-search__input
       - Optional count: .gallery-search__count
       - Each photo button: .gallery__item with data-name="Albeta" etc.
     If data-name missing: it will also search data-alt
     =============================================================== */

  const searchWrap = $("[data-gallery-search]");
  if (searchWrap) {
    const input = $(".gallery-search__input", searchWrap);
    const count = $(".gallery-search__count", searchWrap);

    const runSearch = () => {
      if (!input) return;
      const q = String(input.value || "").trim().toLowerCase();
      let matched = 0;

      galleryButtons.forEach((btn) => {
        const name = String(btn.getAttribute("data-name") || "").toLowerCase();
        const alt = String(btn.getAttribute("data-alt") || btn.dataset.alt || "").toLowerCase();
        const ok = !q || name.includes(q) || alt.includes(q);

        btn.classList.toggle("is-dim", !ok);
        btn.classList.toggle("is-match", ok);
        if (ok) matched++;
      });

      if (count) count.textContent = q ? `${matched} matched` : `${galleryButtons.length} photos`;
    };

    if (input) {
      input.addEventListener("input", runSearch);
      input.addEventListener("search", runSearch);
      runSearch();
    }
  }
})();

// ===== NEW ADD START =====
/**
 * PROFESSIONAL PRODUCTION UTILITIES
 * NOTE: do NOT create duplicate #scroll-progress (already exists in HTML)
 */
(function () {
  const initScrollTracker = () => {
    const prog = document.getElementById("scroll-progress");
    if (!prog) return;

    window.addEventListener(
      "scroll",
      () => {
        const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = height > 0 ? (winScroll / height) * 100 : 0;
        prog.style.width = scrolled + "%";
      },
      { passive: true }
    );
  };

  const consoleBranding = () => {
    console.log(
      "%cRana Marble & Balaji Marble%c\nPremium Quality Stone Suppliers",
      "color:#b7892b; font-size:22px; font-weight:bold; font-family:serif;",
      "color:#777; font-size:14px;"
    );
  };

  document.addEventListener("DOMContentLoaded", () => {
    initScrollTracker();
    consoleBranding();
  });
})();
// ===== NEW ADD END =====
