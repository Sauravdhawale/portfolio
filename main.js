(() => {
  const body = document.body;
  const menuToggle = document.querySelector(".menu-toggle");
  const mobileMenu = document.querySelector(".mobile-menu");
  const menuLinks = [...document.querySelectorAll(".mobile-menu-links a")];
  const pageContent = [...document.querySelectorAll("main, .site-footer")];
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let previousFocus = null;

  const setMenuState = (isOpen) => {
    if (!menuToggle || !mobileMenu) return;

    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.setAttribute("aria-label", isOpen ? "Close navigation menu" : "Open navigation menu");
    mobileMenu.setAttribute("aria-hidden", String(!isOpen));
    mobileMenu.classList.toggle("is-open", isOpen);
    body.classList.toggle("menu-open", isOpen);
    pageContent.forEach((element) => {
      if (isOpen) element.setAttribute("inert", "");
      else element.removeAttribute("inert");
    });

    if (isOpen) {
      previousFocus = document.activeElement;
      window.setTimeout(() => menuLinks[0]?.focus(), reduceMotion ? 0 : 180);
    } else if (previousFocus instanceof HTMLElement) {
      previousFocus.focus();
    }
  };

  menuToggle?.addEventListener("click", () => {
    setMenuState(menuToggle.getAttribute("aria-expanded") !== "true");
  });

  mobileMenu?.addEventListener("click", (event) => {
    if (event.target === mobileMenu) setMenuState(false);
  });

  menuLinks.forEach((link) => link.addEventListener("click", () => setMenuState(false)));

  document.addEventListener("keydown", (event) => {
    const isOpen = menuToggle?.getAttribute("aria-expanded") === "true";
    if (!isOpen) return;

    if (event.key === "Escape") {
      event.preventDefault();
      setMenuState(false);
      return;
    }

    if (event.key === "Tab" && mobileMenu) {
      const focusable = [...mobileMenu.querySelectorAll("a[href], button:not([disabled])")];
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    }
  });

  const revealItems = [...document.querySelectorAll("[data-reveal]")];

  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  } else {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -7% 0px" }
    );

    revealItems.forEach((item) => revealObserver.observe(item));
  }

  const desktopLinks = [...document.querySelectorAll(".nav-links a")];
  const observedSections = desktopLinks
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  if ("IntersectionObserver" in window && observedSections.length) {
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (!visible) return;
        desktopLinks.forEach((link) => {
          const isActive = link.getAttribute("href") === `#${visible.target.id}`;
          link.classList.toggle("active", isActive);
          if (isActive) link.setAttribute("aria-current", "page");
          else link.removeAttribute("aria-current");
        });
      },
      { threshold: [0.18, 0.35, 0.55], rootMargin: "-20% 0px -55% 0px" }
    );

    observedSections.forEach((section) => sectionObserver.observe(section));
  }

  const video = document.querySelector(".bg-video");
  video?.addEventListener("error", () => video.classList.add("video-unavailable"));

  document.addEventListener("visibilitychange", () => {
    if (!video || reduceMotion) return;
    if (document.hidden) video.pause();
    else video.play().catch(() => {});
  });
})();
