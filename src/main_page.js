"use strict";

document.addEventListener("DOMContentLoaded", () => {
  const root = document.documentElement;
  const menuButton = document.getElementById("menuBtn");
  const navPanel = document.getElementById("navPanel");
  const navLinks = document.querySelectorAll(".nav-links a");
  const themeButton = document.getElementById("themeToggle");
  const progressBar = document.getElementById("progressBar");
  const repoContainer = document.getElementById("repos");
  const footerYear = document.getElementById("currentYear");

  const githubUsername = "mbathathabangpaul-crypto";
  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  function applyTheme(theme) {
    const selected = theme === "light" ? "light" : "dark";
    root.dataset.theme = selected;

    if (themeButton) {
      const lightMode = selected === "light";
      themeButton.textContent = lightMode ? "☾" : "☼";
      themeButton.setAttribute(
        "aria-label",
        lightMode ? "Switch to dark mode" : "Switch to light mode",
      );
      themeButton.title = lightMode
        ? "Switch to dark mode"
        : "Switch to light mode";
    }

    try {
      localStorage.setItem("portfolio-theme", selected);
    } catch (_) {
      // Storage may be unavailable.
    }
  }

  let storedTheme = null;
  try {
    storedTheme = localStorage.getItem("portfolio-theme");
  } catch (_) {
    // Use the default theme.
  }
  applyTheme(
    storedTheme ||
      (window.matchMedia("(prefers-color-scheme: light)").matches
        ? "light"
        : "dark"),
  );

  themeButton?.addEventListener("click", () => {
    applyTheme(root.dataset.theme === "light" ? "dark" : "light");
  });

  function closeMenu() {
    navPanel?.classList.remove("is-open");
    menuButton?.setAttribute("aria-expanded", "false");
    menuButton?.setAttribute("aria-label", "Open navigation menu");
  }

  menuButton?.addEventListener("click", () => {
    const open = menuButton.getAttribute("aria-expanded") !== "true";
    navPanel?.classList.toggle("is-open", open);
    menuButton.setAttribute("aria-expanded", String(open));
    menuButton.setAttribute(
      "aria-label",
      open ? "Close navigation menu" : "Open navigation menu",
    );
  });

  navLinks.forEach((link) => link.addEventListener("click", closeMenu));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenu();
  });
  document.addEventListener("click", (event) => {
    if (
      navPanel?.classList.contains("is-open") &&
      !navPanel.contains(event.target) &&
      !menuButton?.contains(event.target)
    )
      closeMenu();
  });
  window.addEventListener("resize", () => {
    if (window.innerWidth > 700) closeMenu();
  });

  const sections = [...document.querySelectorAll("main section[id]")];
  function updateScroll() {
    const maxScroll =
      document.documentElement.scrollHeight - window.innerHeight;
    if (progressBar) {
      progressBar.style.width = `${maxScroll > 0 ? (window.scrollY / maxScroll) * 100 : 0}%`;
    }

    let activeId = "home";
    for (const section of sections) {
      if (section.getBoundingClientRect().top <= 150) activeId = section.id;
    }
    navLinks.forEach((link) => {
      const active = link.getAttribute("href") === `#${activeId}`;
      link.classList.toggle("active", active);
      if (active) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    });
  }

  let scrollPending = false;
  window.addEventListener(
    "scroll",
    () => {
      if (!scrollPending) {
        window.requestAnimationFrame(() => {
          updateScroll();
          scrollPending = false;
        });
        scrollPending = true;
      }
    },
    { passive: true },
  );
  updateScroll();

  const revealItems = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reducedMotion) {
    const observer = new IntersectionObserver(
      (entries, currentObserver) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            currentObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -25px 0px" },
    );
    revealItems.forEach((item) => observer.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  }

  const typing = document.getElementById("typing");
  const roles = [
    "Python · SQL · AWS · Snowflake",
    "Data pipelines · ETL · Analytics",
    "Build · Validate · Improve",
  ];
  if (typing && !reducedMotion) {
    let index = 0;
    window.setInterval(() => {
      index = (index + 1) % roles.length;
      typing.textContent = roles[index];
    }, 3200);
  }

  async function loadRepositories() {
    if (!repoContainer) return;
    repoContainer.setAttribute("aria-busy", "true");

    try {
      const response = await fetch(
        `https://api.github.com/users/${encodeURIComponent(githubUsername)}/repos?sort=updated&per_page=6&type=public`,
        { headers: { Accept: "application/vnd.github+json" } },
      );
      if (!response.ok) throw new Error(`GitHub returned ${response.status}`);

      const repositories = await response.json();
      if (!Array.isArray(repositories) || repositories.length === 0) {
        repoContainer.replaceChildren(
          makeMessage("No public repositories are available to display yet."),
        );
        return;
      }

      const fragment = document.createDocumentFragment();
      repositories.slice(0, 6).forEach((repo) => {
        const card = document.createElement("article");
        card.className = "repo-card";

        const heading = document.createElement("h3");
        heading.textContent = repo.name;

        const description = document.createElement("p");
        description.textContent =
          repo.description || "A public repository by Thabang Paul Mbatha.";

        const meta = document.createElement("div");
        meta.className = "repo-meta";

        const language = document.createElement("span");
        language.textContent = repo.language || "Language not specified";

        const stars = document.createElement("span");
        stars.textContent = `★ ${repo.stargazers_count ?? 0}`;
        meta.append(language, stars);

        const link = document.createElement("a");
        link.href = repo.html_url;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.textContent = "View repository ↗";

        card.append(heading, description, meta, link);
        fragment.appendChild(card);
      });
      repoContainer.replaceChildren(fragment);
    } catch (error) {
      console.warn("Unable to load GitHub repositories:", error);
      const message = makeMessage(
        "Repositories could not be loaded right now. You can still browse the GitHub profile directly.",
      );
      const link = document.createElement("a");
      link.href = `https://github.com/${githubUsername}`;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.textContent = "Open GitHub profile ↗";
      message.append(" ", link);
      repoContainer.replaceChildren(message);
    } finally {
      repoContainer.setAttribute("aria-busy", "false");
    }
  }

  function makeMessage(messageText) {
    const message = document.createElement("p");
    message.className = "repo-message";
    message.textContent = messageText;
    return message;
  }

  loadRepositories();
  if (footerYear) footerYear.textContent = String(new Date().getFullYear());
});
