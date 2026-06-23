const header = document.querySelector("[data-header]");
const nav = document.querySelector("[data-site-nav]");
const toggle = document.querySelector("[data-nav-toggle]");
const form = document.querySelector("[data-contact-form]");
const contactFormTitle = document.querySelector("[data-contact-form-title]");
const contactFormIntro = document.querySelector("[data-contact-form-intro]");
const contactFormStatus = document.querySelector("[data-contact-form-status]");
const enquiryTypeSelect = document.querySelector("[data-enquiry-type]");
const countrySelect = document.querySelector("[data-country-select]");
const phoneCountryCodeSelect = document.querySelector("[data-phone-country-code]");
const captchaCanvas = document.querySelector("[data-captcha-canvas]");
const captchaInput = document.querySelector("[data-captcha-input]");
const captchaRefresh = document.querySelector("[data-captcha-refresh]");
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
const noticeModal = document.querySelector("[data-notice-modal]");
const noticeModalTitle = document.querySelector("[data-notice-modal-title]");
const noticeModalBody = document.querySelector("[data-notice-modal-body]");
const noticeModalCloseButtons = [...document.querySelectorAll("[data-notice-modal-close]")];
const companySlideshows = [...document.querySelectorAll("[data-company-slideshow]")];
const snapTargets = [...document.querySelectorAll("main > section:not(.positioning-strip)")];
const sectionNavLinks = nav
  ? [...nav.querySelectorAll('a[href^="#"]')].filter((link) => document.querySelector(link.getAttribute("href")))
  : [];
const noticePreviewSentenceLimit = 2;
const noticePreviewCharacterLimit = 220;
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
let lastNoticeTrigger = null;
let captchaCode = "";
let noticeLayoutFrame = 0;
const cookieConsentName = "aja_cookie_consent";
const visitorTrackedKey = "aja_visitor_tracked";

const countryCallingCodes = [
  ["Afghanistan", "+93"],
  ["Albania", "+355"],
  ["Algeria", "+213"],
  ["American Samoa", "+1-684"],
  ["Andorra", "+376"],
  ["Angola", "+244"],
  ["Anguilla", "+1-264"],
  ["Antigua and Barbuda", "+1-268"],
  ["Argentina", "+54"],
  ["Armenia", "+374"],
  ["Aruba", "+297"],
  ["Australia", "+61"],
  ["Austria", "+43"],
  ["Azerbaijan", "+994"],
  ["Bahamas", "+1-242"],
  ["Bahrain", "+973"],
  ["Bangladesh", "+880"],
  ["Barbados", "+1-246"],
  ["Belarus", "+375"],
  ["Belgium", "+32"],
  ["Belize", "+501"],
  ["Benin", "+229"],
  ["Bermuda", "+1-441"],
  ["Bhutan", "+975"],
  ["Bolivia", "+591"],
  ["Bosnia and Herzegovina", "+387"],
  ["Botswana", "+267"],
  ["Brazil", "+55"],
  ["British Virgin Islands", "+1-284"],
  ["Brunei", "+673"],
  ["Bulgaria", "+359"],
  ["Burkina Faso", "+226"],
  ["Burundi", "+257"],
  ["Cambodia", "+855"],
  ["Cameroon", "+237"],
  ["Canada", "+1"],
  ["Cape Verde", "+238"],
  ["Cayman Islands", "+1-345"],
  ["Central African Republic", "+236"],
  ["Chad", "+235"],
  ["Chile", "+56"],
  ["China", "+86"],
  ["Colombia", "+57"],
  ["Comoros", "+269"],
  ["Congo", "+242"],
  ["Cook Islands", "+682"],
  ["Costa Rica", "+506"],
  ["Croatia", "+385"],
  ["Cuba", "+53"],
  ["Curacao", "+599"],
  ["Cyprus", "+357"],
  ["Czech Republic", "+420"],
  ["Democratic Republic of the Congo", "+243"],
  ["Denmark", "+45"],
  ["Djibouti", "+253"],
  ["Dominica", "+1-767"],
  ["Dominican Republic", "+1-809"],
  ["Ecuador", "+593"],
  ["Egypt", "+20"],
  ["El Salvador", "+503"],
  ["Equatorial Guinea", "+240"],
  ["Eritrea", "+291"],
  ["Estonia", "+372"],
  ["Eswatini", "+268"],
  ["Ethiopia", "+251"],
  ["Falkland Islands", "+500"],
  ["Faroe Islands", "+298"],
  ["Fiji", "+679"],
  ["Finland", "+358"],
  ["France", "+33"],
  ["French Guiana", "+594"],
  ["French Polynesia", "+689"],
  ["Gabon", "+241"],
  ["Gambia", "+220"],
  ["Georgia", "+995"],
  ["Germany", "+49"],
  ["Ghana", "+233"],
  ["Gibraltar", "+350"],
  ["Greece", "+30"],
  ["Greenland", "+299"],
  ["Grenada", "+1-473"],
  ["Guadeloupe", "+590"],
  ["Guam", "+1-671"],
  ["Guatemala", "+502"],
  ["Guernsey", "+44-1481"],
  ["Guinea", "+224"],
  ["Guinea-Bissau", "+245"],
  ["Guyana", "+592"],
  ["Haiti", "+509"],
  ["Honduras", "+504"],
  ["Hong Kong", "+852"],
  ["Hungary", "+36"],
  ["Iceland", "+354"],
  ["India", "+91"],
  ["Indonesia", "+62"],
  ["Iran", "+98"],
  ["Iraq", "+964"],
  ["Ireland", "+353"],
  ["Isle of Man", "+44-1624"],
  ["Israel", "+972"],
  ["Italy", "+39"],
  ["Ivory Coast", "+225"],
  ["Jamaica", "+1-876"],
  ["Japan", "+81"],
  ["Jersey", "+44-1534"],
  ["Jordan", "+962"],
  ["Kazakhstan", "+7"],
  ["Kenya", "+254"],
  ["Kiribati", "+686"],
  ["Kosovo", "+383"],
  ["Kuwait", "+965"],
  ["Kyrgyzstan", "+996"],
  ["Laos", "+856"],
  ["Latvia", "+371"],
  ["Lebanon", "+961"],
  ["Lesotho", "+266"],
  ["Liberia", "+231"],
  ["Libya", "+218"],
  ["Liechtenstein", "+423"],
  ["Lithuania", "+370"],
  ["Luxembourg", "+352"],
  ["Macau", "+853"],
  ["Madagascar", "+261"],
  ["Malawi", "+265"],
  ["Malaysia", "+60"],
  ["Maldives", "+960"],
  ["Mali", "+223"],
  ["Malta", "+356"],
  ["Marshall Islands", "+692"],
  ["Martinique", "+596"],
  ["Mauritania", "+222"],
  ["Mauritius", "+230"],
  ["Mayotte", "+262"],
  ["Mexico", "+52"],
  ["Micronesia", "+691"],
  ["Moldova", "+373"],
  ["Monaco", "+377"],
  ["Mongolia", "+976"],
  ["Montenegro", "+382"],
  ["Montserrat", "+1-664"],
  ["Morocco", "+212"],
  ["Mozambique", "+258"],
  ["Myanmar", "+95"],
  ["Namibia", "+264"],
  ["Nauru", "+674"],
  ["Nepal", "+977"],
  ["Netherlands", "+31"],
  ["New Caledonia", "+687"],
  ["New Zealand", "+64"],
  ["Nicaragua", "+505"],
  ["Niger", "+227"],
  ["Nigeria", "+234"],
  ["Niue", "+683"],
  ["North Korea", "+850"],
  ["North Macedonia", "+389"],
  ["Northern Mariana Islands", "+1-670"],
  ["Norway", "+47"],
  ["Oman", "+968"],
  ["Pakistan", "+92"],
  ["Palau", "+680"],
  ["Palestine", "+970"],
  ["Panama", "+507"],
  ["Papua New Guinea", "+675"],
  ["Paraguay", "+595"],
  ["Peru", "+51"],
  ["Philippines", "+63"],
  ["Poland", "+48"],
  ["Portugal", "+351"],
  ["Puerto Rico", "+1-787"],
  ["Qatar", "+974"],
  ["Reunion", "+262"],
  ["Romania", "+40"],
  ["Russia", "+7"],
  ["Rwanda", "+250"],
  ["Saint Barthelemy", "+590"],
  ["Saint Helena", "+290"],
  ["Saint Kitts and Nevis", "+1-869"],
  ["Saint Lucia", "+1-758"],
  ["Saint Martin", "+590"],
  ["Saint Pierre and Miquelon", "+508"],
  ["Saint Vincent and the Grenadines", "+1-784"],
  ["Samoa", "+685"],
  ["San Marino", "+378"],
  ["Sao Tome and Principe", "+239"],
  ["Saudi Arabia", "+966"],
  ["Senegal", "+221"],
  ["Serbia", "+381"],
  ["Seychelles", "+248"],
  ["Sierra Leone", "+232"],
  ["Singapore", "+65"],
  ["Sint Maarten", "+1-721"],
  ["Slovakia", "+421"],
  ["Slovenia", "+386"],
  ["Solomon Islands", "+677"],
  ["Somalia", "+252"],
  ["South Africa", "+27"],
  ["South Korea", "+82"],
  ["South Sudan", "+211"],
  ["Spain", "+34"],
  ["Sri Lanka", "+94"],
  ["Sudan", "+249"],
  ["Suriname", "+597"],
  ["Sweden", "+46"],
  ["Switzerland", "+41"],
  ["Syria", "+963"],
  ["Taiwan", "+886"],
  ["Tajikistan", "+992"],
  ["Tanzania", "+255"],
  ["Thailand", "+66"],
  ["Timor-Leste", "+670"],
  ["Togo", "+228"],
  ["Tokelau", "+690"],
  ["Tonga", "+676"],
  ["Trinidad and Tobago", "+1-868"],
  ["Tunisia", "+216"],
  ["Turkey", "+90"],
  ["Turkmenistan", "+993"],
  ["Turks and Caicos Islands", "+1-649"],
  ["Tuvalu", "+688"],
  ["Uganda", "+256"],
  ["Ukraine", "+380"],
  ["United Arab Emirates", "+971"],
  ["United Kingdom", "+44"],
  ["United States", "+1"],
  ["Uruguay", "+598"],
  ["US Virgin Islands", "+1-340"],
  ["Uzbekistan", "+998"],
  ["Vanuatu", "+678"],
  ["Vatican City", "+379"],
  ["Venezuela", "+58"],
  ["Vietnam", "+84"],
  ["Wallis and Futuna", "+681"],
  ["Western Sahara", "+212"],
  ["Yemen", "+967"],
  ["Zambia", "+260"],
  ["Zimbabwe", "+263"]
];

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

  if (captchaCode) {
    drawCaptcha();
  }
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

function renderSelectOptions(select, values) {
  if (!select || !Array.isArray(values) || !values.length) return;

  select.replaceChildren();
  values.forEach((value) => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = value;
    select.append(option);
  });
}

function populateCountryCallingFields() {
  if (!countrySelect || !phoneCountryCodeSelect) return;

  countrySelect.replaceChildren();
  phoneCountryCodeSelect.replaceChildren();

  countryCallingCodes.forEach(([country, code]) => {
    const countryOption = document.createElement("option");
    countryOption.value = country;
    countryOption.textContent = country;
    countryOption.selected = country === "Bhutan";
    countrySelect.append(countryOption);

    const codeOption = document.createElement("option");
    codeOption.value = code;
    codeOption.dataset.country = country;
    codeOption.textContent = code;
    codeOption.selected = country === "Bhutan";
    phoneCountryCodeSelect.append(codeOption);
  });
}

function syncPhoneCodeToCountry() {
  if (!countrySelect || !phoneCountryCodeSelect) return;

  const selectedCountry = countrySelect.value;
  const matchingOption = [...phoneCountryCodeSelect.options].find((option) => option.dataset.country === selectedCountry);
  if (matchingOption) {
    phoneCountryCodeSelect.selectedIndex = matchingOption.index;
  }
}

function randomCaptchaCode() {
  const characters = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 5 }, () => characters[Math.floor(Math.random() * characters.length)]).join("");
}

function drawCaptcha() {
  if (!captchaCanvas) return;

  const context = captchaCanvas.getContext("2d");
  if (!context) return;

  const width = captchaCanvas.width;
  const height = captchaCanvas.height;
  context.clearRect(0, 0, width, height);
  context.fillStyle = activeTheme === "light" ? "#f2f1ee" : "#181b1e";
  context.fillRect(0, 0, width, height);

  for (let i = 0; i < 18; i += 1) {
    context.strokeStyle = i % 2 ? "rgba(232, 118, 26, 0.34)" : "rgba(255, 255, 255, 0.18)";
    context.beginPath();
    context.moveTo(Math.random() * width, Math.random() * height);
    context.lineTo(Math.random() * width, Math.random() * height);
    context.stroke();
  }

  context.font = "700 24px IBM Plex Mono, monospace";
  context.textBaseline = "middle";
  context.fillStyle = activeTheme === "light" ? "#101214" : "#f6f1e7";
  captchaCode.split("").forEach((character, index) => {
    context.save();
    context.translate(19 + index * 24, height / 2 + (Math.random() * 8 - 4));
    context.rotate((Math.random() - 0.5) * 0.28);
    context.fillText(character, 0, 0);
    context.restore();
  });
}

function refreshCaptcha() {
  captchaCode = randomCaptchaCode();
  if (captchaInput) {
    captchaInput.value = "";
    captchaInput.setCustomValidity("");
  }
  drawCaptcha();
}

function validateCaptcha(formData) {
  if (formData.get("website")) {
    if (contactFormStatus) {
      contactFormStatus.textContent = "Thank you. Your enquiry has been received.";
    }
    refreshCaptcha();
    return false;
  }

  if (!captchaInput) return true;

  const enteredCode = String(formData.get("captcha") || "").replace(/\s+/g, "").toUpperCase();
  if (enteredCode === captchaCode) {
    captchaInput.setCustomValidity("");
    return true;
  }

  captchaInput.setCustomValidity("Enter the security code shown.");
  captchaInput.reportValidity();
  if (contactFormStatus) {
    contactFormStatus.textContent = "Please enter the security code shown in the image.";
  }
  refreshCaptcha();
  captchaInput.focus();
  return false;
}

function appendNoticeMeta(listItem, item) {
  const postDate = item.postDate || item.date || item.closingDate;
  const meta = [["Date", postDate]];
  if (item.postDate && item.closingDate) {
    meta.push(["Closing Date", item.closingDate]);
  }
  const visibleMeta = meta.filter((detail) => detail[1]);

  if (visibleMeta.length) {
    const metaList = document.createElement("dl");
    metaList.className = "notice-meta";
    visibleMeta.forEach(([label, value]) => {
      const term = document.createElement("dt");
      term.textContent = label;
      const description = document.createElement("dd");
      description.textContent = value;
      metaList.append(term, description);
    });
    listItem.append(metaList);
  }
}

function externalLinkAttributes(link, href) {
  if (/^https?:\/\//.test(href)) {
    link.target = "_blank";
    link.rel = "noreferrer";
  }
}

function createNoticeCarousel(item) {
  const imageUrls = Array.isArray(item.imageUrls) ? item.imageUrls.filter(Boolean) : [];
  if (!imageUrls.length) return null;

  const figure = document.createElement("figure");
  figure.className = "company-photo notice-media-carousel";
  const slides = document.createElement("div");
  slides.className = "company-slides";
  let activeIndex = 0;

  imageUrls.forEach((url, index) => {
    const image = document.createElement("img");
    image.src = url;
    image.alt = item.title ? `${item.title} image ${index + 1}` : `Advert image ${index + 1}`;
    image.loading = "lazy";
    image.decoding = "async";
    image.dataset.companySlide = "";
    image.dataset.caption = item.title || "Advert image";
    if (index === 0) {
      image.className = "is-active";
    }
    slides.append(image);
  });

  function showSlide(nextIndex) {
    const images = [...slides.querySelectorAll("img")];
    activeIndex = (nextIndex + images.length) % images.length;
    images.forEach((image, index) => {
      image.classList.toggle("is-active", index === activeIndex);
      image.setAttribute("aria-hidden", String(index !== activeIndex));
    });
  }

  if (imageUrls.length > 1) {
    const previous = document.createElement("button");
    previous.className = "company-slide-control company-slide-control-prev";
    previous.type = "button";
    previous.setAttribute("aria-label", "Previous advert image");
    previous.textContent = "‹";
    previous.addEventListener("click", () => showSlide(activeIndex - 1));

    const next = document.createElement("button");
    next.className = "company-slide-control company-slide-control-next";
    next.type = "button";
    next.setAttribute("aria-label", "Next advert image");
    next.textContent = "›";
    next.addEventListener("click", () => showSlide(activeIndex + 1));
    slides.append(previous, next);
  }

  figure.append(slides);
  return figure;
}

function appendNoticeMedia(listItem, item) {
  const carousel = createNoticeCarousel(item);
  if (carousel) {
    listItem.append(carousel);
  }

  if (item.pdfUrl) {
    const pdfLink = document.createElement("a");
    pdfLink.className = "notice-item-link";
    pdfLink.href = item.pdfUrl;
    pdfLink.textContent = item.pdfLabel || "View PDF";
    externalLinkAttributes(pdfLink, item.pdfUrl);
    listItem.append(pdfLink);
  }
}

function appendNoticeAction(listItem, item) {
  if (item.actionUrl) {
    const action = document.createElement("a");
    action.className = "notice-item-link";
    action.href = item.actionUrl;
    action.textContent = item.actionLabel || "View advert";
    externalLinkAttributes(action, item.actionUrl);
    listItem.append(action);
  }
}

function normaliseNoticeText(text) {
  return String(text || "").replace(/\s+/g, " ").trim();
}

function noticePreviewText(text) {
  const normalised = normaliseNoticeText(text);
  if (!normalised) return "";

  const sentences = normalised.match(/[^.!?]+[.!?]+|[^.!?]+$/g)?.map((sentence) => sentence.trim()).filter(Boolean) || [];
  let preview = sentences.slice(0, noticePreviewSentenceLimit).join(" ");

  if (!preview || preview.length > noticePreviewCharacterLimit) {
    preview = normalised.slice(0, noticePreviewCharacterLimit).trim();
    preview = preview.replace(/\s+\S*$/, "");
  }

  return preview && preview.length < normalised.length ? `${preview}...` : preview;
}

function hasLongerNoticeText(text) {
  return normaliseNoticeText(noticePreviewText(text)) !== normaliseNoticeText(text);
}

function noticeDateValue(item) {
  const rawDate = item?.postDate || item?.date || item?.closingDate || "";
  const timestamp = Date.parse(rawDate);
  return Number.isNaN(timestamp) ? Number.NEGATIVE_INFINITY : timestamp;
}

function sortedNoticeItems(items) {
  return [...items].sort((firstItem, secondItem) => noticeDateValue(secondItem) - noticeDateValue(firstItem));
}

function fitNoticePanelItems(panel) {
  const content = panel.querySelector(".notice-panel-content");
  const list = panel.querySelector(".notice-list");
  if (!content || !list) return;

  const items = [...list.querySelectorAll(":scope > li")];
  if (!items.length) return;

  items.forEach((item) => {
    item.hidden = false;
  });

  const contentBottom = content.getBoundingClientRect().bottom;
  let visibleCount = 0;

  items.forEach((item) => {
    const itemBottom = item.getBoundingClientRect().bottom;
    const fits = itemBottom <= contentBottom + 1;
    item.hidden = !fits;
    if (fits) {
      visibleCount += 1;
    }
  });

  if (!visibleCount) {
    items[0].hidden = false;
  }
}

function syncNoticeLayoutLimits() {
  if (!noticeTabs) return;

  noticeLayoutFrame = 0;
  const visiblePanels = [...noticeTabs.querySelectorAll("[data-notice-panel]")].filter((panel) => {
    return panel.getClientRects().length && window.getComputedStyle(panel).display !== "none";
  });

  visiblePanels.forEach(fitNoticePanelItems);
}

function scheduleNoticeLayoutSync() {
  if (noticeLayoutFrame) {
    window.cancelAnimationFrame(noticeLayoutFrame);
  }
  noticeLayoutFrame = window.requestAnimationFrame(syncNoticeLayoutLimits);
}

function appendNoticeTextBlock(parent, text) {
  const blocks = String(text || "")
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean);

  if (!blocks.length && text) {
    blocks.push(String(text).trim());
  }

  blocks.forEach((block) => {
    const paragraph = document.createElement("p");
    paragraph.textContent = block;
    parent.append(paragraph);
  });
}

function createNoticeDetailArticle(item, category) {
  const article = document.createElement("article");
  article.className = "notice-modal-item";
  const hasImages = Array.isArray(item.imageUrls) && item.imageUrls.filter(Boolean).length > 0;
  const copy = document.createElement("div");
  copy.className = "notice-modal-copy";

  const type = document.createElement("span");
  type.textContent = item.type || category.status || "Notice";
  copy.append(type);

  const title = document.createElement("h3");
  title.textContent = item.title || "Untitled notice";
  copy.append(title);

  appendNoticeTextBlock(copy, item.summary || "");
  appendNoticeMeta(copy, item);
  appendNoticeAction(copy, item);

  if (hasImages) {
    article.classList.add("has-media");
    const media = document.createElement("div");
    media.className = "notice-modal-media";
    appendNoticeMedia(media, item);
    article.append(media, copy);
  } else {
    appendNoticeMedia(copy, item);
    article.append(copy);
  }

  return article;
}

function createNoticeNavIcon(direction) {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("aria-hidden", "true");
  svg.setAttribute("focusable", "false");

  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute("d", direction === "previous" ? "M15 5 8 12l7 7" : "m9 5 7 7-7 7");
  svg.append(path);

  return svg;
}

function createNoticeItemNavigation(category, items, activeIndex) {
  if (items.length <= 1) return null;

  const nav = document.createElement("div");
  nav.className = "notice-modal-nav";

  const previous = document.createElement("button");
  previous.type = "button";
  previous.className = "notice-modal-nav-button notice-modal-nav-prev";
  previous.disabled = activeIndex <= 0;
  previous.setAttribute("aria-label", "Previous notice");
  previous.append(createNoticeNavIcon("previous"));

  const previousLabel = document.createElement("span");
  previousLabel.textContent = "Previous";
  previous.append(previousLabel);

  const count = document.createElement("span");
  count.className = "notice-modal-count";
  count.textContent = `${activeIndex + 1} / ${items.length}`;

  const next = document.createElement("button");
  next.type = "button";
  next.className = "notice-modal-nav-button notice-modal-nav-next";
  next.disabled = activeIndex >= items.length - 1;
  next.setAttribute("aria-label", "Next notice");

  const nextLabel = document.createElement("span");
  nextLabel.textContent = "Next";
  next.append(nextLabel, createNoticeNavIcon("next"));

  previous.addEventListener("click", () => {
    openNoticeItemModal(category, items[activeIndex - 1], previous, activeIndex - 1);
  });

  next.addEventListener("click", () => {
    openNoticeItemModal(category, items[activeIndex + 1], next, activeIndex + 1);
  });

  nav.append(previous, count, next);
  return nav;
}

function closeNoticeModal() {
  if (!noticeModal) return;

  noticeModal.hidden = true;
  document.body.classList.remove("spec-modal-open");
  noticeModalBody?.replaceChildren();
  delete noticeModal.dataset.noticeMode;

  if (lastNoticeTrigger) {
    lastNoticeTrigger.focus();
  }
}

function openNoticeItemModal(category, item, trigger, preferredIndex) {
  if (!noticeModal || !noticeModalTitle || !noticeModalBody) return;

  const items = sortedNoticeItems(Array.isArray(category.items) ? category.items : []);
  const activeIndex = Number.isInteger(preferredIndex) ? preferredIndex : Math.max(0, items.indexOf(item));
  const activeItem = items[activeIndex] || item;

  if (!noticeModal.contains(trigger)) {
    lastNoticeTrigger = trigger;
  }
  noticeModal.dataset.noticeMode = "item";
  noticeModalTitle.textContent = activeItem.title || category.title || category.label || "Information";
  const detail = createNoticeDetailArticle(activeItem, category);
  const navigation = createNoticeItemNavigation(category, items, activeIndex);
  noticeModalBody.replaceChildren(...[detail, navigation].filter(Boolean));
  noticeModal.hidden = false;
  document.body.classList.add("spec-modal-open");
  noticeModal.querySelector(".spec-modal-close")?.focus();
}

function openNoticeModal(category, trigger) {
  if (!noticeModal || !noticeModalTitle || !noticeModalBody) return;

  const items = sortedNoticeItems(Array.isArray(category.items) ? category.items : []);
  lastNoticeTrigger = trigger;
  noticeModal.dataset.noticeMode = "category";
  noticeModalTitle.textContent = category.title || category.label || "Information";
  noticeModalBody.replaceChildren();

  if (category.summary) {
    const intro = document.createElement("p");
    intro.className = "notice-modal-intro";
    intro.textContent = category.summary;
    noticeModalBody.append(intro);
  }

  const list = document.createElement("div");
  list.className = "notice-modal-list";

  if (items.length) {
    items.forEach((item) => {
      list.append(createNoticeDetailArticle(item, category));
    });
  } else {
    const empty = document.createElement("article");
    empty.className = "notice-modal-item";
    const title = document.createElement("h3");
    title.textContent = "No current notices";
    const summary = document.createElement("p");
    summary.textContent = "New updates will be published here.";
    empty.append(title, summary);
    list.append(empty);
  }

  noticeModalBody.append(list);
  noticeModal.hidden = false;
  document.body.classList.add("spec-modal-open");
  noticeModal.querySelector(".spec-modal-close")?.focus();
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
    content.className = "notice-panel-content";
    const shouldShowIntro = !category.hideIntro;

    if (shouldShowIntro) {
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
    }

    const list = document.createElement("ul");
    list.className = "notice-list";

    const items = sortedNoticeItems(Array.isArray(category.items) ? category.items : []);
    if (items.length) {
      items.forEach((item) => {
        const listItem = document.createElement("li");

        const type = document.createElement("span");
        type.textContent = item.type || "Notice";
        listItem.append(type);

        const itemTitle = document.createElement("button");
        itemTitle.type = "button";
        itemTitle.className = "notice-item-title";
        itemTitle.textContent = item.title || "Untitled notice";
        itemTitle.addEventListener("click", () => openNoticeItemModal(category, item, itemTitle));
        listItem.append(itemTitle);

        const itemSummary = document.createElement("p");
        itemSummary.textContent = noticePreviewText(item.summary || "");
        listItem.append(itemSummary);

        appendNoticeMeta(listItem, item);
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

    const contactLink = document.createElement("button");
    contactLink.type = "button";
    contactLink.className = "notice-more-link";
    contactLink.textContent = "Click for more";
    contactLink.addEventListener("click", () => openNoticeModal(category, contactLink));

    panel.append(content, contactLink);
    panels.append(panel);
  });

  scheduleNoticeLayoutSync();
}

function renderContactContent(contact) {
  if (!contact) return;

  contactSettings = contact;
  setText("[data-contact-eyebrow]", contact.eyebrow);
  setText("[data-contact-title]", contact.title);
  if (contactFormTitle) {
    contactFormTitle.textContent = contact.formTitle || "Send an enquiry";
  }
  if (contactFormIntro) {
    contactFormIntro.textContent = contact.formIntro || "Share your requirement and the right team will respond.";
  }
  renderSelectOptions(enquiryTypeSelect, contact.enquiryTypes);

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

async function fetchJson(path) {
  const response = await fetch(path, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Unable to load ${path}`);
  }

  return response.json();
}

function readCookie(name) {
  return document.cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`))
    ?.slice(name.length + 1) || "";
}

function writeCookie(name, value, days) {
  const maxAge = Math.max(1, days) * 24 * 60 * 60;
  document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; SameSite=Lax; Max-Age=${maxAge}`;
}

function sessionValue(key) {
  try {
    return window.sessionStorage.getItem(key);
  } catch {
    return "";
  }
}

function setSessionValue(key, value) {
  try {
    window.sessionStorage.setItem(key, value);
  } catch {
    // Consent still works when session storage is unavailable.
  }
}

async function trackVisitorLocation() {
  if (readCookie(cookieConsentName) !== "accepted" || sessionValue(visitorTrackedKey)) return;

  setSessionValue(visitorTrackedKey, "pending");
  try {
    const response = await fetch("/api/visitor-track", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        page: `${window.location.pathname}${window.location.search}`
      })
    });

    if (response.ok) {
      setSessionValue(visitorTrackedKey, "done");
    } else {
      setSessionValue(visitorTrackedKey, "");
    }
  } catch {
    setSessionValue(visitorTrackedKey, "");
  }
}

function initialiseCookieConsent() {
  const consent = readCookie(cookieConsentName);
  if (consent === "accepted") {
    trackVisitorLocation();
    return;
  }
  if (consent === "declined" || document.querySelector("[data-cookie-consent]")) return;

  const banner = document.createElement("section");
  banner.className = "cookie-consent";
  banner.dataset.cookieConsent = "true";
  banner.setAttribute("aria-label", "Cookie consent");

  const copy = document.createElement("p");
  copy.textContent = "Aja Alloys uses a small cookie to understand approximate visitor locations and improve the website.";

  const actions = document.createElement("div");
  const decline = document.createElement("button");
  decline.type = "button";
  decline.className = "cookie-consent-secondary";
  decline.textContent = "Decline";

  const accept = document.createElement("button");
  accept.type = "button";
  accept.textContent = "Accept";

  decline.addEventListener("click", () => {
    writeCookie(cookieConsentName, "declined", 180);
    banner.remove();
  });

  accept.addEventListener("click", () => {
    writeCookie(cookieConsentName, "accepted", 365);
    banner.remove();
    trackVisitorLocation();
  });

  actions.append(decline, accept);
  banner.append(copy, actions);
  document.body.append(banner);
}

function normaliseInformationCategory(category, fallback) {
  return {
    ...fallback,
    ...category,
    items: Array.isArray(category?.items) ? category.items : []
  };
}

async function loadSplitSiteContent() {
  const [
    information,
    notices,
    vacancies,
    tenders,
    contactForm,
    contactCards
  ] = await Promise.all([
    fetchJson("content/information.json"),
    fetchJson("content/notices.json"),
    fetchJson("content/vacancies.json"),
    fetchJson("content/tenders.json"),
    fetchJson("content/contact-form.json"),
    fetchJson("content/contact-cards.json")
  ]);

  return {
    information: {
      ...information,
      categories: [
        normaliseInformationCategory(notices, { id: "news", label: "Notices" }),
        normaliseInformationCategory(vacancies, { id: "vacancies", label: "Vacancies" }),
        normaliseInformationCategory(tenders, { id: "tenders", label: "Tenders" })
      ]
    },
    contact: {
      ...contactForm,
      cards: Array.isArray(contactCards.cards) ? contactCards.cards : []
    }
  };
}

async function loadLegacySiteContent() {
  return fetchJson("content/site.json");
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

    scheduleNoticeLayoutSync();
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
    let siteContent;

    try {
      siteContent = await loadSplitSiteContent();
    } catch {
      siteContent = await loadLegacySiteContent();
    }

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
populateCountryCallingFields();
loadSiteContent();
initialiseCookieConsent();

if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    const nextTheme = activeTheme === "light" ? "dark" : "light";
    applyTheme(nextTheme);
    storeTheme(nextTheme);
  });
}

if (countrySelect) {
  countrySelect.addEventListener("change", syncPhoneCodeToCountry);
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

noticeModalCloseButtons.forEach((button) => {
  button.addEventListener("click", closeNoticeModal);
});

if (captchaCanvas && captchaInput) {
  refreshCaptcha();
}

if (captchaRefresh) {
  captchaRefresh.addEventListener("click", refreshCaptcha);
}

if (captchaInput) {
  captchaInput.addEventListener("input", () => {
    captchaInput.setCustomValidity("");
  });
}

window.addEventListener("keydown", (event) => {
  if (noticeModal && !noticeModal.hidden && event.key === "Escape") {
    closeNoticeModal();
    return;
  }

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

window.addEventListener("resize", () => {
  syncSwipeControls();
  scheduleNoticeLayoutSync();
});

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
    if (!form.reportValidity()) return;

    const data = new FormData(form);
    if (!validateCaptcha(data)) return;

    const formEndpoint = contactSettings?.formEndpoint?.trim();
    const enquiryType = data.get("enquiryType") || "General enquiry";

    if (contactFormStatus) {
      contactFormStatus.textContent = "Preparing your enquiry...";
    }

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
          refreshCaptcha();
          if (contactFormStatus) {
            contactFormStatus.textContent = "Thank you. Your enquiry has been sent.";
          }
          return;
        }
      } catch {
        // Fall back to email if the form endpoint is temporarily unavailable.
      }
    }

    const recipient = contactSettings?.formRecipient || "sales@aja.bt";
    const subjectPrefix = contactSettings?.formSubjectPrefix || "Aja Alloys specification request";
    const subject = encodeURIComponent(`${subjectPrefix}: ${enquiryType}`);
    const phoneCode = data.get("phoneCountryCode") || "";
    const phoneNumber = data.get("phone") || "";
    const phoneLine = [phoneCode, phoneNumber].filter(Boolean).join(" ");
    const body = encodeURIComponent(
      [
        `Name: ${data.get("name")}`,
        `Company: ${data.get("company") || ""}`,
        `Country: ${data.get("country") || ""}`,
        `Email: ${data.get("email")}`,
        `Phone: ${phoneLine}`,
        `Enquiry type: ${enquiryType}`,
        `Product or grade: ${data.get("grade")}`,
        `Quantity: ${data.get("quantity") || ""}`,
        "",
        data.get("message")
      ].join("\n")
    );

    if (contactFormStatus) {
      contactFormStatus.textContent = "Opening your email app with the enquiry details filled in.";
    }
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
