import { githubGetJson, githubPutJson, jsonResponse } from "./post-editor/_shared.js";

const ANALYTICS_PATH = "content/visitor-analytics.json";
const CONSENT_COOKIE = "aja_cookie_consent";
const MAX_RECENT_VISITS = 80;
const MAX_GROUP_ROWS = 80;

export async function onRequestPost({ request, env }) {
  if (readCookie(request, CONSENT_COOKIE) !== "accepted") {
    return jsonResponse({ ok: false, error: "consent_required" }, 403);
  }

  if (!env.GITHUB_TOKEN || !env.GITHUB_REPO) {
    return jsonResponse({ ok: false, error: "missing_storage_settings" }, 500);
  }

  let payload = {};
  try {
    payload = await request.json();
  } catch {
    payload = {};
  }

  const visit = createVisitRecord(request, payload);

  try {
    const current = await githubGetJson(ANALYTICS_PATH, env).catch(() => emptyAnalytics());
    const next = updateAnalytics(current, visit);
    await githubPutJson(ANALYTICS_PATH, next, "Update visitor geolocation analytics", env);

    return jsonResponse({ ok: true });
  } catch (error) {
    return jsonResponse({ ok: false, error: error.message || "Unable to save visitor analytics" }, 500);
  }
}

export async function onRequestOptions() {
  return jsonResponse({ ok: true });
}

function createVisitRecord(request, payload) {
  const cf = request.cf || {};
  const page = cleanPage(payload.page);
  return {
    visitedAt: new Date().toISOString(),
    page,
    country: cleanText(cf.country),
    continent: cleanText(cf.continent),
    region: cleanText(cf.region),
    city: cleanText(cf.city),
    timezone: cleanText(cf.timezone),
    latitude: cleanCoordinate(cf.latitude),
    longitude: cleanCoordinate(cf.longitude)
  };
}

function updateAnalytics(current, visit) {
  const analytics = {
    ...emptyAnalytics(),
    ...current,
    countries: Array.isArray(current.countries) ? current.countries : [],
    cities: Array.isArray(current.cities) ? current.cities : [],
    pages: Array.isArray(current.pages) ? current.pages : [],
    recentVisits: Array.isArray(current.recentVisits) ? current.recentVisits : []
  };

  analytics.updatedAt = visit.visitedAt;
  analytics.totalVisits = Number(analytics.totalVisits || 0) + 1;
  analytics.countries = bumpGroup(analytics.countries, {
    key: visit.country || "Unknown",
    label: visit.country || "Unknown",
    country: visit.country || ""
  }, visit.visitedAt);

  const cityLabel = [visit.city, visit.region, visit.country].filter(Boolean).join(", ") || "Unknown";
  analytics.cities = bumpGroup(analytics.cities, {
    key: cityLabel,
    label: cityLabel,
    city: visit.city || "",
    region: visit.region || "",
    country: visit.country || "",
    latitude: visit.latitude,
    longitude: visit.longitude
  }, visit.visitedAt);

  analytics.pages = bumpGroup(analytics.pages, {
    key: visit.page || "/",
    label: visit.page || "/"
  }, visit.visitedAt);

  analytics.recentVisits = [
    visit,
    ...analytics.recentVisits
  ].slice(0, MAX_RECENT_VISITS);

  return analytics;
}

function bumpGroup(rows, incoming, visitedAt) {
  const key = incoming.key || "Unknown";
  const next = rows.map((row) => {
    if (row.key !== key) return row;
    return {
      ...row,
      ...incoming,
      count: Number(row.count || 0) + 1,
      lastSeenAt: visitedAt
    };
  });

  if (!next.some((row) => row.key === key)) {
    next.push({
      ...incoming,
      count: 1,
      firstSeenAt: visitedAt,
      lastSeenAt: visitedAt
    });
  }

  return next
    .sort((first, second) => Number(second.count || 0) - Number(first.count || 0))
    .slice(0, MAX_GROUP_ROWS);
}

function emptyAnalytics() {
  return {
    version: 1,
    updatedAt: "",
    totalVisits: 0,
    countries: [],
    cities: [],
    pages: [],
    recentVisits: []
  };
}

function readCookie(request, name) {
  const header = request.headers.get("cookie") || "";
  return header
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`))
    ?.slice(name.length + 1) || "";
}

function cleanText(value) {
  return String(value || "").trim().slice(0, 120);
}

function cleanPage(value) {
  const page = String(value || "/").trim();
  if (!page.startsWith("/")) return "/";
  return page.slice(0, 180);
}

function cleanCoordinate(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return "";
  return number.toFixed(3);
}
