const header = document.querySelector("[data-header]");
const nav = document.querySelector("[data-site-nav]");
const toggle = document.querySelector("[data-nav-toggle]");
const form = document.querySelector("[data-contact-form]");
const noticeTabs = document.querySelector("[data-notice-tabs]");
const specTabs = document.querySelector("[data-spec-tabs]");
const themeToggle = document.querySelector("[data-theme-toggle]");
const swipeNav = document.querySelector("[data-mobile-swipe-nav]");
const swipePrevButton = document.querySelector("[data-swipe-prev]");
const swipeNextButton = document.querySelector("[data-swipe-next]");
const specModal = document.querySelector("[data-spec-modal]");
const specModalTitle = document.querySelector("[data-spec-modal-title]");
const specModalBody = document.querySelector("[data-spec-modal-body]");
const specModalCloseButtons = [...document.querySelectorAll("[data-spec-modal-close]")];
const positioningModal = document.querySelector("[data-positioning-modal]");
const positioningModalTitle = document.querySelector("[data-positioning-modal-title]");
const positioningModalBody = document.querySelector("[data-positioning-modal-body]");
const positioningModalCloseButtons = [...document.querySelectorAll("[data-positioning-modal-close]")];
const positioningTriggers = [...document.querySelectorAll("[data-positioning-popout]")];
const mapModal = document.querySelector("[data-map-modal]");
const mapModalTitle = document.querySelector("[data-map-modal-title]");
const mapModalFrame = document.querySelector("[data-map-modal-frame]");
const mapDirectionsLink = document.querySelector("[data-map-directions]");
const mapModalCloseButtons = [...document.querySelectorAll("[data-map-modal-close]")];
const companySlideshows = [...document.querySelectorAll("[data-company-slideshow]")];
const snapTargets = [...document.querySelectorAll("main > section:not(.positioning-strip)")];
const sectionNavLinks = nav
  ? [...nav.querySelectorAll('a[href^="#"]')].filter((link) => document.querySelector(link.getAttribute("href")))
  : [];
let contactSettings = null;
let isSnapping = false;
let touchStartY = 0;
let touchStartX = 0;
let pointerStartY = 0;
let pointerStartX = 0;
let pointerSwipeActive = false;
let lastHorizontalSwipeAt = 0;
let activeTheme = "dark";
let lastPositioningTrigger = null;
let lastMapTrigger = null;

function storeTheme(theme) {
  try {
    window.localStorage.setItem("aja-theme", theme);
  } catch {
    return;
  }
}

function applyTheme(theme) {
  activeTheme = theme === "light" ? "light" : "dark";
  document.body.dataset.theme = activeTheme;

  if (!themeToggle) return;

  const isLight = activeTheme === "light";
  themeToggle.setAttribute("aria-pressed", String(isLight));
  themeToggle.setAttribute("aria-label", isLight ? "Switch to dark theme" : "Switch to light theme");
  themeToggle.setAttribute("title", isLight ? "Switch to dark theme" : "Switch to light theme");
}

function syncHeader() {
  if (!header) return;
  header.classList.toggle("is-scrolled", window.scrollY > 12);
}

function syncActiveNav() {
  const activeTarget = snapTargets[currentSnapIndex()];
  const activeId = activeTarget ? activeTarget.id : "";
  document.body.dataset.section = activeId;

  sectionNavLinks.forEach((link) => {
    const isActive = link.getAttribute("href") === `#${activeId}`;
    link.classList.toggle("is-active", isActive);

    if (isActive) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });
}

function currentSnapIndex() {
  const marker = window.scrollY + Math.max(90, window.innerHeight * 0.25);
  let index = 0;

  snapTargets.forEach((target, targetIndex) => {
    if (target.offsetTop <= marker) {
      index = targetIndex;
    }
  });

  return index;
}

function snapToIndex(index) {
  const target = snapTargets[index];
  if (!target) return;

  isSnapping = true;
  window.scrollTo({
    top: target.offsetTop,
    behavior: "auto"
  });

  window.setTimeout(() => {
    isSnapping = false;
    syncActiveNav();
    syncSwipeControls();
  }, 220);
}

function isFormControl(eventTarget) {
  return eventTarget instanceof Element && Boolean(eventTarget.closest("input, textarea, select, button, a"));
}

function isScrollableSpecModal(eventTarget) {
  return eventTarget instanceof Element && Boolean(eventTarget.closest(".spec-modal-panel"));
}

function isCompanySlideshow(eventTarget) {
  return eventTarget instanceof Element && Boolean(eventTarget.closest(".company-slides"));
}

function shouldUseSectionSnapping(direction) {
  if (!window.matchMedia("(min-width: 981px)").matches) return false;

  const activeTarget = snapTargets[currentSnapIndex()];
  if (!activeTarget) return false;
  if (activeTarget.scrollHeight <= window.innerHeight + 2) return true;

  const sectionTop = activeTarget.offsetTop;
  const sectionBottom = sectionTop + activeTarget.scrollHeight;
  const viewportTop = window.scrollY;
  const viewportBottom = viewportTop + window.innerHeight;

  if (direction > 0) return viewportBottom >= sectionBottom - 8;
  return viewportTop <= sectionTop + 8;
}

function isMobileViewport() {
  return window.matchMedia("(max-width: 980px)").matches;
}

function isSwipeDeckViewport() {
  return isMobileViewport();
}

function syncSwipeControls() {
  if (!swipeNav || !swipePrevButton || !swipeNextButton) return;

  const isVisible = isSwipeDeckViewport();
  const activeIndex = currentSnapIndex();

  swipeNav.hidden = !isVisible;
  swipePrevButton.disabled = !isVisible || activeIndex <= 0;
  swipeNextButton.disabled = !isVisible || activeIndex >= snapTargets.length - 1;
}

function swipeToAdjacentSection(direction) {
  const activeIndex = currentSnapIndex();
  const nextIndex = Math.max(0, Math.min(snapTargets.length - 1, activeIndex + direction));
  if (nextIndex === activeIndex) return false;
  snapToIndex(nextIndex);
  return true;
}

function handleHorizontalSwipe(deltaX, deltaY) {
  if (!isMobileViewport()) return false;
  if (Math.abs(deltaX) <= 58 || Math.abs(deltaX) <= Math.abs(deltaY) * 1.25) return false;

  const now = Date.now();
  if (now - lastHorizontalSwipeAt < 420) return true;

  lastHorizontalSwipeAt = now;
  swipeToAdjacentSection(deltaX < 0 ? 1 : -1);
  return true;
}

function setText(selector, value) {
  const element = document.querySelector(selector);
  if (element && value) {
    element.textContent = value;
  }
}

function createMailto(email, subject) {
  const query = subject ? `?subject=${encodeURIComponent(subject)}` : "";
  return `mailto:${email}${query}`;
}

function googleMapsEmbedUrl(query) {
  return `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`;
}

function googleMapsDirectionsUrl(query) {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(query)}`;
}

function mapQueryFromCard(card) {
  const map = card?.map || {};
  if (map.query) return map.query;

  const addressLine = Array.isArray(card?.lines)
    ? card.lines.find((line) => line.type === "text" && !line.muted && line.label)
    : null;

  return addressLine?.label || "";
}

function createMapFrame(title, embedUrl) {
  const iframe = document.createElement("iframe");
  iframe.title = title;
  iframe.src = embedUrl;
  iframe.loading = "lazy";
  iframe.referrerPolicy = "no-referrer-when-downgrade";
  iframe.allowFullscreen = true;
  return iframe;
}

function closeMapModal() {
  if (!mapModal) return;

  mapModal.hidden = true;
  document.body.classList.remove("spec-modal-open");
  mapModalFrame?.replaceChildren();

  if (lastMapTrigger) {
    lastMapTrigger.focus();
  }
}

function openMapModal(card, trigger) {
  if (!mapModal || !mapModalTitle || !mapModalFrame || !mapDirectionsLink) return;

  const map = card.map || {};
  const query = mapQueryFromCard(card);
  if (!query && !map.embedUrl) return;

  const title = card.title ? `${card.title} map` : "Location map";
  const embedUrl = map.embedUrl || googleMapsEmbedUrl(query);
  const directionsUrl = map.directionsUrl || googleMapsDirectionsUrl(query);

  lastMapTrigger = trigger;
  mapModalTitle.textContent = title;
  mapModalFrame.replaceChildren(createMapFrame(title, embedUrl));
  mapDirectionsLink.href = directionsUrl;
  mapDirectionsLink.textContent = map.directionsLabel || "Get directions";
  mapModal.hidden = false;
  document.body.classList.add("spec-modal-open");
  mapModal.querySelector(".spec-modal-close")?.focus();
}

function renderInformationContent(information) {
  if (!information || !noticeTabs || !Array.isArray(information.categories)) return;

  setText("[data-information-eyebrow]", information.eyebrow);
  setText("[data-information-title]", information.title);
  setText("[data-information-summary]", information.summary);

  const tabs = noticeTabs.querySelector(".notice-tabs");
  const panels = noticeTabs.querySelector(".notice-panels");
  if (!tabs || !panels) return;

  tabs.replaceChildren();
  panels.replaceChildren();

  information.categories.forEach((category, index) => {
    const id = category.id || `notice-${index + 1}`;
    const panelId = `notice-panel-${id}`;
    const tabId = `notice-tab-${id}`;
    const isActive = index === 0;

    const tab = document.createElement("a");
    tab.className = `notice-tab${isActive ? " is-active" : ""}`;
    tab.href = `#${panelId}`;
    tab.id = tabId;
    tab.setAttribute("role", "tab");
    tab.setAttribute("aria-selected", String(isActive));
    tab.setAttribute("aria-controls", panelId);
    tab.dataset.noticeTab = id;
    tab.textContent = category.label || category.title || id;
    tabs.append(tab);

    const panel = document.createElement("article");
    panel.className = `notice-panel${isActive ? " is-active" : ""}`;
    panel.id = panelId;
    panel.setAttribute("role", "tabpanel");
    panel.setAttribute("aria-labelledby", tabId);
    panel.dataset.noticePanel = id;

    const content = document.createElement("div");

    const status = document.createElement("span");
    status.className = "notice-status";
    status.textContent = category.status || "Notice";
    content.append(status);

    const title = document.createElement("h3");
    title.textContent = category.title || category.label || "Information";
    content.append(title);

    const summary = document.createElement("p");
    summary.textContent = category.summary || "";
    content.append(summary);

    const list = document.createElement("ul");
    list.className = "notice-list";

    const items = Array.isArray(category.items) ? category.items : [];
    if (items.length) {
      items.forEach((item) => {
        const listItem = document.createElement("li");

        const type = document.createElement("span");
        type.textContent = item.type || "Notice";
        listItem.append(type);

        const itemTitle = document.createElement("strong");
        itemTitle.textContent = item.title || "Untitled notice";
        listItem.append(itemTitle);

        const itemSummary = document.createElement("p");
        itemSummary.textContent = item.summary || "";
        listItem.append(itemSummary);

        list.append(listItem);
      });
    } else {
      const listItem = document.createElement("li");
      const itemTitle = document.createElement("strong");
      itemTitle.textContent = "No current notices";
      const itemSummary = document.createElement("p");
      itemSummary.textContent = "New updates will be published here.";
      listItem.append(itemTitle, itemSummary);
      list.append(listItem);
    }

    content.append(list);

    const contactLink = document.createElement("a");
    contactLink.href = createMailto(category.contactEmail || "sales@aja.bt", category.contactSubject);
    contactLink.textContent = category.contactLabel || "Contact";

    panel.append(content, contactLink);
    panels.append(panel);
  });
}

function renderContactContent(contact) {
  if (!contact) return;

  contactSettings = contact;
  setText("[data-contact-eyebrow]", contact.eyebrow);
  setText("[data-contact-title]", contact.title);

  const contactGrid = document.querySelector("[data-contact-grid]");
  if (!contactGrid || !Array.isArray(contact.cards)) return;

  const contactForm = contactGrid.querySelector("[data-contact-form]");
  contactGrid.querySelectorAll(".contact-block").forEach((block) => block.remove());

  contact.cards.forEach((card) => {
    const block = document.createElement("div");
    block.className = "contact-block";

    const title = document.createElement("h3");
    title.textContent = card.title || "Contact";
    block.append(title);

    const lines = Array.isArray(card.lines) ? card.lines : [];
    const map = card.map || {};
    const query = mapQueryFromCard(card);

    lines.forEach((line) => {
      const paragraph = document.createElement("p");
      if (line.muted) {
        paragraph.className = "muted";
      }

      if (line.type === "email" && line.value) {
        const link = document.createElement("a");
        link.href = `mailto:${line.value}`;
        link.textContent = line.label || line.value;
        paragraph.append(link);
      } else if (line.type === "phone" && line.value) {
        const link = document.createElement("a");
        link.href = `tel:${line.value}`;
        link.textContent = line.label || line.value;
        paragraph.append(link);
      } else {
        paragraph.textContent = line.label || "";
      }

      block.append(paragraph);
    });

    if (map.embedUrl || query) {
      const mapLine = document.createElement("p");
      mapLine.className = "contact-map-line";
      const mapButton = document.createElement("button");
      mapButton.type = "button";
      mapButton.className = "contact-map-link";
      mapButton.textContent = map.label || "Directions";
      mapButton.addEventListener("click", () => openMapModal(card, mapButton));

      mapLine.append(mapButton);
      block.append(mapLine);
    }

    contactGrid.insertBefore(block, contactForm);
  });
}

function initialiseNoticeTabs() {
  if (!noticeTabs) return;

  const tabButtons = [...noticeTabs.querySelectorAll("[data-notice-tab]")];
  const panels = [...noticeTabs.querySelectorAll("[data-notice-panel]")];
  const panelById = new Map(panels.map((panel) => [panel.id, panel]));

  function activateNoticeTab(tabName) {
    tabButtons.forEach((button) => {
      const isActive = button.dataset.noticeTab === tabName;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-selected", String(isActive));
    });

    panels.forEach((panel) => {
      const isActive = panel.dataset.noticePanel === tabName;
      panel.classList.toggle("is-active", isActive);
      panel.setAttribute("aria-hidden", String(!isActive));
    });
  }

  function activateNoticePanelFromHash() {
    const panel = panelById.get(window.location.hash.slice(1));
    if (panel) {
      activateNoticeTab(panel.dataset.noticePanel);
    }
  }

  tabButtons.forEach((button, buttonIndex) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      activateNoticeTab(button.dataset.noticeTab);
    });

    button.addEventListener("keydown", (event) => {
      const direction = event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
      if (!direction) return;

      event.preventDefault();
      const nextIndex = (buttonIndex + direction + tabButtons.length) % tabButtons.length;
      const nextButton = tabButtons[nextIndex];
      nextButton.focus();
      activateNoticeTab(nextButton.dataset.noticeTab);
    });
  });

  activateNoticePanelFromHash();
  window.addEventListener("hashchange", activateNoticePanelFromHash);
}

async function loadSiteContent() {
  try {
    const response = await fetch("content/site.json", { cache: "no-store" });
    if (!response.ok) return;

    const siteContent = await response.json();
    renderInformationContent(siteContent.information);
    renderContactContent(siteContent.contact);
  } catch {
    return;
  } finally {
    initialiseNoticeTabs();
  }
}

syncHeader();
syncActiveNav();
applyTheme("dark");
storeTheme("dark");
syncSwipeControls();
loadSiteContent();

if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    const nextTheme = activeTheme === "light" ? "dark" : "light";
    applyTheme(nextTheme);
    storeTheme(nextTheme);
  });
}

function closePositioningModal() {
  if (!positioningModal) return;

  positioningModal.hidden = true;
  if (positioningModalBody) {
    positioningModalBody.textContent = "";
  }

  if (lastPositioningTrigger) {
    lastPositioningTrigger.focus();
  }
}

function openPositioningModal(trigger) {
  if (!positioningModal || !positioningModalTitle || !positioningModalBody) return;

  const article = trigger.closest("article");
  const title = trigger.textContent.trim();
  const body = article?.querySelector("p")?.textContent.trim();
  if (!title || !body) return;

  lastPositioningTrigger = trigger;
  positioningModalTitle.textContent = title;
  positioningModalBody.textContent = body;
  positioningModal.hidden = false;
  positioningModal.querySelector(".spec-modal-close")?.focus();
}

positioningTriggers.forEach((trigger) => {
  trigger.addEventListener("click", () => openPositioningModal(trigger));
});

positioningModalCloseButtons.forEach((button) => {
  button.addEventListener("click", closePositioningModal);
});

mapModalCloseButtons.forEach((button) => {
  button.addEventListener("click", closeMapModal);
});

window.addEventListener("keydown", (event) => {
  if (mapModal && !mapModal.hidden && event.key === "Escape") {
    closeMapModal();
    return;
  }

  if (!positioningModal || positioningModal.hidden || event.key !== "Escape") return;
  closePositioningModal();
});

companySlideshows.forEach((slideshow) => {
  const slideStage = slideshow.querySelector(".company-slides");
  const slides = [...slideshow.querySelectorAll("[data-company-slide]")];
  const caption = slideshow.querySelector("[data-company-slideshow-caption]");
  const prevButton = slideshow.querySelector("[data-company-slide-prev]");
  const nextButton = slideshow.querySelector("[data-company-slide-next]");
  const slideDelay = 15000;
  let slideTimer = null;
  let activeIndex = 0;
  let slideTouchStartX = 0;
  let slideTouchStartY = 0;
  let slidePointerStartX = 0;
  let slidePointerStartY = 0;
  let slidePointerActive = false;

  function showSlide(nextIndex) {
    activeIndex = (nextIndex + slides.length) % slides.length;

    slides.forEach((slide, slideIndex) => {
      const isActive = slideIndex === activeIndex;
      slide.classList.toggle("is-active", isActive);
      slide.setAttribute("aria-hidden", String(!isActive));
    });

    if (caption) {
      caption.textContent = slides[activeIndex].dataset.caption || slides[activeIndex].alt || "";
    }
  }

  function queueNextSlide() {
    if (slideTimer) {
      window.clearInterval(slideTimer);
    }

    slideTimer = window.setInterval(() => {
      showSlide(activeIndex + 1);
    }, slideDelay);
  }

  function moveSlide(direction) {
    showSlide(activeIndex + direction);
    queueNextSlide();
  }

  function handleSlideSwipe(deltaX, deltaY) {
    if (!isSwipeDeckViewport()) return false;
    if (Math.abs(deltaX) <= 42 || Math.abs(deltaX) <= Math.abs(deltaY) * 1.2) return false;

    moveSlide(deltaX < 0 ? 1 : -1);
    return true;
  }

  showSlide(activeIndex);

  if (slides.length > 1) {
    prevButton?.addEventListener("click", () => moveSlide(-1));
    nextButton?.addEventListener("click", () => moveSlide(1));
    slideStage?.addEventListener(
      "touchstart",
      (event) => {
        if (!isSwipeDeckViewport() || event.touches.length !== 1) return;
        slideTouchStartX = event.touches[0].clientX;
        slideTouchStartY = event.touches[0].clientY;
        event.stopPropagation();
      },
      { passive: true }
    );
    slideStage?.addEventListener(
      "touchmove",
      (event) => {
        if (!isSwipeDeckViewport() || event.touches.length !== 1) return;
        const deltaX = event.touches[0].clientX - slideTouchStartX;
        const deltaY = event.touches[0].clientY - slideTouchStartY;

        if (Math.abs(deltaX) > Math.abs(deltaY) * 1.2 && Math.abs(deltaX) > 16) {
          event.preventDefault();
          event.stopPropagation();
        }
      },
      { passive: false }
    );
    slideStage?.addEventListener("touchend", (event) => {
      if (!isSwipeDeckViewport()) return;
      const touch = event.changedTouches[0];
      if (!touch) return;

      const didSwipe = handleSlideSwipe(touch.clientX - slideTouchStartX, touch.clientY - slideTouchStartY);
      if (didSwipe) {
        event.stopPropagation();
      }
    });
    slideStage?.addEventListener("pointerdown", (event) => {
      if (!isSwipeDeckViewport() || event.pointerType === "mouse") return;
      slidePointerActive = true;
      slidePointerStartX = event.clientX;
      slidePointerStartY = event.clientY;
      event.stopPropagation();
    });
    slideStage?.addEventListener("pointerup", (event) => {
      if (!slidePointerActive || !isSwipeDeckViewport() || event.pointerType === "mouse") return;

      slidePointerActive = false;
      if (handleSlideSwipe(event.clientX - slidePointerStartX, event.clientY - slidePointerStartY)) {
        event.preventDefault();
        event.stopPropagation();
      }
    });
    queueNextSlide();
  } else {
    prevButton?.setAttribute("hidden", "");
    nextButton?.setAttribute("hidden", "");
  }
});

window.addEventListener("scroll", () => {
  syncHeader();
  syncActiveNav();
  syncSwipeControls();
});

window.addEventListener("resize", syncSwipeControls);

if (snapTargets.length > 1) {
  window.addEventListener(
    "wheel",
    (event) => {
      if (isSwipeDeckViewport()) {
        if (isFormControl(event.target) || isScrollableSpecModal(event.target)) return;

        if (Math.abs(event.deltaX) > Math.abs(event.deltaY) && Math.abs(event.deltaX) > 12) {
          event.preventDefault();
          swipeToAdjacentSection(event.deltaX > 0 ? 1 : -1);
        }

        return;
      }

      if (isSnapping || Math.abs(event.deltaY) < 12) return;
      if (isFormControl(event.target)) return;

      const direction = event.deltaY > 0 ? 1 : -1;
      if (!shouldUseSectionSnapping(direction)) return;

      event.preventDefault();
      const nextIndex = Math.max(0, Math.min(snapTargets.length - 1, currentSnapIndex() + direction));
      snapToIndex(nextIndex);
    },
    { passive: false }
  );

  window.addEventListener(
    "touchstart",
    (event) => {
      if (isFormControl(event.target) || event.touches.length !== 1) return;
      if (isScrollableSpecModal(event.target)) return;
      if (isCompanySlideshow(event.target)) return;
      touchStartY = event.touches[0].clientY;
      touchStartX = event.touches[0].clientX;
    },
    { passive: true }
  );

  window.addEventListener(
    "touchmove",
    (event) => {
      if (isScrollableSpecModal(event.target)) return;
      if (isCompanySlideshow(event.target)) return;
      if (isSnapping || isFormControl(event.target) || event.touches.length !== 1) return;
      const deltaY = event.touches[0].clientY - touchStartY;
      const deltaX = event.touches[0].clientX - touchStartX;
      const direction = deltaY < 0 ? 1 : -1;

      if (isSwipeDeckViewport()) {
        if (Math.abs(deltaX) > Math.abs(deltaY) * 1.25 && Math.abs(deltaX) > 28) {
          event.preventDefault();
        }
        return;
      }

      if (shouldUseSectionSnapping(direction) && Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > 8) {
        event.preventDefault();
      }

      if (isMobileViewport() && Math.abs(deltaX) > Math.abs(deltaY) * 1.25 && Math.abs(deltaX) > 28) {
        event.preventDefault();
      }
    },
    { passive: false }
  );

  window.addEventListener(
    "touchend",
    (event) => {
      if (isSnapping || isFormControl(event.target)) return;
      if (isScrollableSpecModal(event.target)) return;
      if (isCompanySlideshow(event.target)) return;
      const touch = event.changedTouches[0];
      if (!touch) return;

      const deltaY = touch.clientY - touchStartY;
      const deltaX = touch.clientX - touchStartX;

      if (handleHorizontalSwipe(deltaX, deltaY)) {
        return;
      }

      if (isSwipeDeckViewport()) return;

      if (Math.abs(deltaY) < 42 || Math.abs(deltaY) < Math.abs(deltaX)) return;

      const direction = deltaY < 0 ? 1 : -1;
      if (!shouldUseSectionSnapping(direction)) return;
      const nextIndex = Math.max(0, Math.min(snapTargets.length - 1, currentSnapIndex() + direction));
      snapToIndex(nextIndex);
    },
    { passive: false }
  );

  window.addEventListener("pointerdown", (event) => {
    if (isScrollableSpecModal(event.target)) return;
    if (isCompanySlideshow(event.target)) return;
    if (!isMobileViewport() || isFormControl(event.target)) return;

    pointerSwipeActive = true;
    pointerStartY = event.clientY;
    pointerStartX = event.clientX;
  });

  window.addEventListener(
    "pointerup",
    (event) => {
      if (isCompanySlideshow(event.target)) return;
      if (!pointerSwipeActive || isSnapping || isFormControl(event.target)) return;

      pointerSwipeActive = false;
      const deltaY = event.clientY - pointerStartY;
      const deltaX = event.clientX - pointerStartX;

      if (handleHorizontalSwipe(deltaX, deltaY)) {
        event.preventDefault();
      }
    },
    { passive: false }
  );

  swipePrevButton?.addEventListener("click", () => {
    swipeToAdjacentSection(-1);
  });

  swipeNextButton?.addEventListener("click", () => {
    swipeToAdjacentSection(1);
  });

  window.addEventListener("keydown", (event) => {
    const keys = ["PageDown", "PageUp", "ArrowDown", "ArrowUp", "ArrowLeft", "ArrowRight", " "];
    if (!keys.includes(event.key)) return;
    if (isFormControl(event.target)) return;

    const direction = event.key === "PageUp" || event.key === "ArrowUp" || event.key === "ArrowLeft" ? -1 : 1;
    if (isSwipeDeckViewport()) {
      event.preventDefault();
      swipeToAdjacentSection(direction);
      return;
    }

    if (!shouldUseSectionSnapping(direction)) return;

    event.preventDefault();
    const nextIndex = Math.max(0, Math.min(snapTargets.length - 1, currentSnapIndex() + direction));
    snapToIndex(nextIndex);
  });
}

if (toggle && nav) {
  toggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(isOpen));
  });

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      nav.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    });
  });
}

if (form) {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const formEndpoint = contactSettings?.formEndpoint?.trim();

    if (formEndpoint) {
      try {
        const response = await fetch(formEndpoint, {
          method: "POST",
          body: data,
          headers: {
            Accept: "application/json"
          }
        });

        if (response.ok) {
          form.reset();
          window.alert("Thank you. Your enquiry has been sent.");
          return;
        }
      } catch {
        // Fall back to email if the form endpoint is temporarily unavailable.
      }
    }

    const recipient = contactSettings?.formRecipient || "sales@aja.bt";
    const subjectPrefix = contactSettings?.formSubjectPrefix || "Aja Alloys specification request";
    const subject = encodeURIComponent(`${subjectPrefix}: ${data.get("grade")}`);
    const body = encodeURIComponent(
      [
        `Name: ${data.get("name")}`,
        `Company: ${data.get("company") || ""}`,
        `Country: ${data.get("country") || ""}`,
        `Email: ${data.get("email")}`,
        `Grade of interest: ${data.get("grade")}`,
        `Quantity: ${data.get("quantity") || ""}`,
        "",
        data.get("message")
      ].join("\n")
    );

    window.location.href = `mailto:${recipient}?subject=${subject}&body=${body}`;
  });
}

if (specTabs) {
  const tabButtons = [...specTabs.querySelectorAll("[data-spec-tab]")];
  const panels = [...specTabs.querySelectorAll("[data-spec-panel]")];
  const toggleButtons = [...specTabs.querySelectorAll("[data-spec-toggle]")];
  let lastSpecTrigger = null;

  function syncSpecToggle(panel, isExpanded) {
    const toggleButton = panel.querySelector("[data-spec-toggle]");
    if (!toggleButton) return;

    toggleButton.setAttribute("aria-expanded", String(isExpanded));
    toggleButton.textContent = isExpanded ? "Hide specifications" : "Show specifications";
  }

  function activateSpecTab(tabName) {
    tabButtons.forEach((button) => {
      const isActive = button.dataset.specTab === tabName;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-selected", String(isActive));
    });

    panels.forEach((panel) => {
      const isActive = panel.dataset.specPanel === tabName;
      panel.classList.toggle("is-active", isActive);
      panel.toggleAttribute("hidden", !isActive);
      panel.setAttribute("aria-hidden", String(!isActive));
      panel.classList.remove("is-expanded");
      syncSpecToggle(panel, false);
    });
  }

  function closeSpecModal() {
    if (!specModal) return;

    specModal.hidden = true;
    document.body.classList.remove("spec-modal-open");
    specModalBody?.replaceChildren();

    if (lastSpecTrigger) {
      lastSpecTrigger.focus();
    }
  }

  function openSpecModal(tabButton) {
    if (!specModal || !specModalTitle || !specModalBody) return;

    const panel = panels.find((specPanel) => specPanel.dataset.specPanel === tabButton.dataset.specTab);
    if (!panel) return;

    lastSpecTrigger = tabButton;
    specModalTitle.textContent = `${tabButton.textContent.trim()} specifications`;
    specModalBody.replaceChildren();

    const tableWrap = panel.querySelector(".spec-table-wrap")?.cloneNode(true);
    const note = panel.querySelector(".spec-note")?.cloneNode(true);

    if (tableWrap) {
      specModalBody.append(tableWrap);
    }

    if (note) {
      specModalBody.append(note);
    }

    specModal.hidden = false;
    document.body.classList.add("spec-modal-open");
    specModal.querySelector(".spec-modal-close")?.focus();
  }

  tabButtons.forEach((button, buttonIndex) => {
    button.addEventListener("click", () => {
      activateSpecTab(button.dataset.specTab);

      if (isSwipeDeckViewport()) {
        openSpecModal(button);
      }
    });

    button.addEventListener("keydown", (event) => {
      const direction = event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
      if (!direction) return;

      event.preventDefault();
      const nextIndex = (buttonIndex + direction + tabButtons.length) % tabButtons.length;
      const nextButton = tabButtons[nextIndex];
      nextButton.focus();
      activateSpecTab(nextButton.dataset.specTab);
    });
  });

  toggleButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const panel = button.closest("[data-spec-panel]");
      if (!panel) return;

      const isExpanded = !panel.classList.contains("is-expanded");
      panel.classList.toggle("is-expanded", isExpanded);
      syncSpecToggle(panel, isExpanded);
    });
  });

  specModalCloseButtons.forEach((button) => {
    button.addEventListener("click", closeSpecModal);
  });

  function specModalFocusables() {
    const panel = specModal?.querySelector(".spec-modal-panel");
    if (!panel) return [];

    return [...panel.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')].filter(
      (element) => !element.hasAttribute("disabled") && element.offsetParent !== null
    );
  }

  window.addEventListener("keydown", (event) => {
    if (!specModal || specModal.hidden) return;

    if (event.key === "Escape") {
      closeSpecModal();
      return;
    }

    if (event.key !== "Tab") return;

    const focusables = specModalFocusables();
    if (focusables.length === 0) return;

    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    const active = document.activeElement;

    if (event.shiftKey && (active === first || !specModal.contains(active))) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && (active === last || !specModal.contains(active))) {
      event.preventDefault();
      first.focus();
    }
  });
}
