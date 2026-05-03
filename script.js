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

  /* -------------------- Event filtering by URL -------------------- */
  // ?events=mairie,henne hides the others. No param (or ?events=all) shows all.
  const EVENT_IDS = ["mairie", "henne", "houppa", "chabbat"];
  const eventsParam = new URLSearchParams(location.search).get("events");

  let allowedEvents;
  if (!eventsParam || eventsParam.toLowerCase() === "all") {
    allowedEvents = new Set(EVENT_IDS);
  } else {
    allowedEvents = new Set(
      eventsParam
        .split(",")
        .map((s) => s.trim().toLowerCase())
        .filter((id) => EVENT_IDS.includes(id))
    );
    if (allowedEvents.size === 0) allowedEvents = new Set(EVENT_IDS);
  }

  EVENT_IDS.forEach((id) => {
    if (allowedEvents.has(id)) return;
    document.getElementById(`event-${id}`)?.remove();
    document.querySelectorAll(`a[href="#event-${id}"]`).forEach((a) => {
      (a.closest("li") || a).remove();
    });
  });

  /* -------------------- Add to calendar (.ics) -------------------- */
  // Times are stored in UTC. Paris = UTC+2 in June (CEST), Israel = UTC+3 in August (IDT).
  const CALENDAR_EVENTS = {
    mairie: {
      title: "Mariage Sarah & Ilan — Mairie",
      description: "Sarah & Ilan se diront « Oui » à la mairie de Saint-Maur.",
      location: "Mairie de Saint-Maur, Av. Charles de Gaulle, 94100 Saint-Maur-des-Fossés",
      start: "20260623T113000Z", // 13:30 Paris (CEST)
      end:   "20260623T130000Z", // 15:00 Paris
    },
    henne: {
      title: "Mariage Sarah & Ilan — Henné",
      description: "Soirée Henné de Sarah & Ilan.",
      location: "Les salons du Centre Hillel, 10bis avenue du Château, 94210 La Varenne",
      start: "20260623T173000Z", // 19:30 Paris
      end:   "20260623T213000Z", // 23:30 Paris
    },
    houppa: {
      title: "Mariage Sarah & Ilan — Houppa & soirée",
      description: "Houppa et soirée du mariage de Sarah & Ilan.",
      location: "Salons Yara, Hadera, Israël",
      start: "20260804T150000Z", // 18:00 Israel (IDT)
      end:   "20260804T220000Z", // 01:00 +1 Israel
    },
    chabbat: {
      title: "Mariage Sarah & Ilan — Chabbat Hatan",
      description: "Chabbat Hatan en l'honneur de Sarah & Ilan.",
      location: "Hôtel Eden Inn, Derekh Aharon 2, Zichron Yaacov, Israël",
      start: "20260807T150000Z", // 18:00 Friday Israel
      end:   "20260808T180000Z", // 21:00 Saturday Israel
    },
  };

  const escapeICS = (s) =>
    String(s)
      .replace(/\\/g, "\\\\")
      .replace(/\n/g, "\\n")
      .replace(/,/g, "\\,")
      .replace(/;/g, "\\;");

  const buildICS = (ids) => {
    const dtstamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
    const lines = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Sarah & Ilan//Wedding//FR",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
    ];
    ids.forEach((id) => {
      const ev = CALENDAR_EVENTS[id];
      if (!ev) return;
      lines.push(
        "BEGIN:VEVENT",
        `UID:sarah-ilan-${id}@wedding`,
        `DTSTAMP:${dtstamp}`,
        `DTSTART:${ev.start}`,
        `DTEND:${ev.end}`,
        `SUMMARY:${escapeICS(ev.title)}`,
        `LOCATION:${escapeICS(ev.location)}`,
        `DESCRIPTION:${escapeICS(ev.description)}`,
        "END:VEVENT"
      );
    });
    lines.push("END:VCALENDAR");
    return lines.join("\r\n");
  };

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

  document.getElementById("add-to-calendar")?.addEventListener("click", () => {
    const ids = EVENT_IDS.filter((id) => allowedEvents.has(id));
    if (ids.length === 0) return;
    const ics = buildICS(ids);
    const filename = ids.length === 1 ? `sarah-ilan-${ids[0]}.ics` : "sarah-ilan-mariage.ics";

    if (isIOS) {
      // Safari/iOS opens the file directly in the Calendar app prompt.
      window.location.href = "data:text/calendar;charset=utf-8," + encodeURIComponent(ics);
      return;
    }

    const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
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
  const TOPBAR = 96;
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
    ".intro__inner > *, .event-section, .programme__cta, .gallery__head, .gallery__item, .hosts > *, .footer__col"
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
