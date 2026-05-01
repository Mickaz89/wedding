(() => {
  /* -------------------- Music handling -------------------- */
  const audio = document.getElementById("bg-music");
  const gate = document.getElementById("music-gate");
  const gateBtn = document.getElementById("music-gate-btn");
  const gateSkip = document.getElementById("music-gate-skip");
  const toggle = document.getElementById("music-toggle");

  const MUSIC_START = 2.0; // seconds — skip silent intro of music.mp3

  const seekToStart = () => {
    try { audio.currentTime = MUSIC_START; } catch { /* metadata not ready */ }
  };

  audio.addEventListener("ended", () => {
    seekToStart();
    audio.play().catch(() => {});
  });

  const hideGate = () => gate.classList.add("is-hidden");

  const startMusic = async () => {
    try {
      audio.volume = 0;
      seekToStart();
      await audio.play();
      const target = 0.55;
      const step = 0.02;
      const id = setInterval(() => {
        audio.volume = Math.min(target, audio.volume + step);
        if (audio.volume >= target) clearInterval(id);
      }, 60);
      toggle.classList.remove("is-muted");
    } catch (err) {
      console.warn("Audio playback failed:", err);
    }
  };

  // Dev-only: ?preview=1 dismisses the gate for screenshots / design QA.
  const params = new URLSearchParams(location.search);
  if (params.get("preview") === "1") {
    hideGate();
    toggle.classList.add("is-muted");
    if (params.get("screen") === "events") {
      // jump straight to the events screen
      requestAnimationFrame(() => document.getElementById("open-events")?.click());
    }
  } else {
    // Try silent autoplay; most browsers block this without interaction.
    (async () => {
      try {
        audio.volume = 0.55;
        seekToStart();
        await audio.play();
        hideGate();
      } catch {
        /* gate stays */
      }
    })();
  }

  gateBtn.addEventListener("click", async () => {
    hideGate();
    await startMusic();
  });

  gateSkip.addEventListener("click", () => {
    hideGate();
    toggle.classList.add("is-muted");
  });

  toggle.addEventListener("click", async () => {
    if (audio.paused) {
      await startMusic();
      toggle.classList.remove("is-muted");
    } else {
      audio.pause();
      toggle.classList.add("is-muted");
    }
  });

  /* -------------------- Landing -> Events transition -------------------- */
  const landing = document.getElementById("landing");
  const openEventsBtn = document.getElementById("open-events");

  const revealEvents = () => {
    document.body.classList.remove("is-landing");
    document.body.classList.add("events-revealed");
    landing.classList.add("is-hidden");
    // remove the landing fully after the fade so it doesn't trap touches
    setTimeout(() => { landing.style.display = "none"; }, 750);
  };

  openEventsBtn.addEventListener("click", revealEvents);

  /* -------------------- Side menu -------------------- */
  const sideMenu = document.getElementById("side-menu");
  const backdrop = document.getElementById("menu-backdrop");
  const menuOpen = document.getElementById("menu-open");
  const menuClose = document.getElementById("menu-close");

  const openMenu = () => {
    sideMenu.classList.add("is-open");
    sideMenu.setAttribute("aria-hidden", "false");
    backdrop.classList.add("is-open");
    document.body.style.overflow = "hidden";
  };
  const closeMenu = () => {
    sideMenu.classList.remove("is-open");
    sideMenu.setAttribute("aria-hidden", "true");
    backdrop.classList.remove("is-open");
    document.body.style.overflow = "";
  };

  menuOpen.addEventListener("click", openMenu);
  menuClose.addEventListener("click", closeMenu);
  backdrop.addEventListener("click", closeMenu);
  sideMenu.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => setTimeout(closeMenu, 120))
  );
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeMenu();
  });

  /* -------------------- Smooth-scroll offset for fixed header -------------------- */
  const TOPBAR = 72;
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href").slice(1);
      if (!id) return;
      const target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - TOPBAR + 1;
      window.scrollTo({ top, behavior: "smooth" });
    });
  });

  /* -------------------- Countdown -------------------- */
  // 2026-06-23 13:30 Europe/Paris (UTC+2 in June). 13:30 Paris = 11:30 UTC.
  const TARGET = new Date("2026-06-23T11:30:00Z").getTime();

  const cd = {
    days: document.querySelector('[data-cd="days"]'),
    hours: document.querySelector('[data-cd="hours"]'),
    minutes: document.querySelector('[data-cd="minutes"]'),
    seconds: document.querySelector('[data-cd="seconds"]'),
  };

  const pad = (n) => String(Math.max(0, n)).padStart(2, "0");

  const tick = () => {
    const now = Date.now();
    let diff = Math.max(0, TARGET - now);
    const d = Math.floor(diff / 86400000); diff -= d * 86400000;
    const h = Math.floor(diff / 3600000);  diff -= h * 3600000;
    const m = Math.floor(diff / 60000);    diff -= m * 60000;
    const s = Math.floor(diff / 1000);
    cd.days.textContent = pad(d);
    cd.hours.textContent = pad(h);
    cd.minutes.textContent = pad(m);
    cd.seconds.textContent = pad(s);
  };
  tick();
  setInterval(tick, 1000);

  /* -------------------- Reveal on scroll -------------------- */
  const revealTargets = document.querySelectorAll(
    ".intro__col, .intro__rings, .programme__section-eyebrow, .event-section, .programme__cta, .gallery__head, .gallery__item, .hosts > *, .footer__col"
  );
  revealTargets.forEach((el) => el.classList.add("reveal"));

  const previewMode = new URLSearchParams(location.search).get("preview") === "1";

  if (previewMode) {
    revealTargets.forEach((el) => el.classList.add("is-visible"));
  } else if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    revealTargets.forEach((el) => io.observe(el));
  } else {
    revealTargets.forEach((el) => el.classList.add("is-visible"));
  }
})();
