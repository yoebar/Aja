import { githubGetJson, githubPutJson, jsonResponse } from "./post-editor/_shared.js";

const ANALYTICS_PATH = "content/visitor-analytics.json";
const CONSENT_COOKIE = "aja_cookie_consent";
const MAX_RECENT_VISITS = 80;
const MAX_GROUP_ROWS = 80;
const MAX_VISITOR_ROWS = 500;
const SESSION_TIMEOUT_MS = 30 * 60 * 1000;

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

  const visit = await createVisitRecord(request, payload, env);

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

async function createVisitRecord(request, payload, env) {
  const cf = request.cf || {};
  const page = cleanPage(payload.page);
  const visitorHash = await hashVisitorId(payload.visitorId, env);
  return {
    visitedAt: new Date().toISOString(),
    page,
    visitorHash,
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
    recentVisits: Array.isArray(current.recentVisits) ? current.recentVisits : [],
    visitors: Array.isArray(current.visitors) ? current.visitors : []
  };

  analytics.updatedAt = visit.visitedAt;
  analytics.totalVisits = Number(analytics.totalVisits || 0) + 1;
  const visitorUpdate = updateVisitorRows(analytics.visitors, visit);
  analytics.visitors = visitorUpdate.visitors;
  visit.visitorType = visitorUpdate.visitorType;
  visit.sessionType = visitorUpdate.sessionType;
  visit.visitorVisitCount = visitorUpdate.visitCount;

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
    publicVisitRecord(visit),
    ...analytics.recentVisits
  ].slice(0, MAX_RECENT_VISITS);
  analytics.identifiedVisits = analytics.visitors.reduce((total, visitor) => total + Number(visitor.visitCount || 0), 0);
  analytics.uniqueVisitors = analytics.visitors.length;
  analytics.returningVisitors = analytics.visitors.filter((visitor) => Number(visitor.visitCount || 0) > 1).length;
  analytics.repeatVisits = Math.max(0, analytics.identifiedVisits - analytics.uniqueVisitors);
  analytics.legacyVisits = Math.max(0, analytics.totalVisits - analytics.identifiedVisits);

  return analytics;
}

function updateVisitorRows(rows, visit) {
  if (!visit.visitorHash) {
    return {
      visitors: rows,
      visitorType: "legacy",
      sessionType: "unknown",
      visitCount: 0
    };
  }

  let matched = false;
  let visitorType = "new";
  let sessionType = "new";
  let visitCount = 1;
  const next = rows.map((row) => {
    if (row.key !== visit.visitorHash) return row;
    matched = true;
    visitorType = "returning";
    const previousSeen = new Date(row.lastSeenAt || row.firstSeenAt || 0).getTime();
    const currentSeen = new Date(visit.visitedAt).getTime();
    const startsNewSession = !Number.isFinite(previousSeen) || currentSeen - previousSeen > SESSION_TIMEOUT_MS;
    sessionType = startsNewSession ? "new" : "same";
    visitCount = Number(row.visitCount || 0) + 1;
    return {
      ...row,
      visitCount,
      sessionCount: Number(row.sessionCount || 1) + (startsNewSession ? 1 : 0),
      lastSeenAt: visit.visitedAt,
      lastPage: visit.page,
      lastCountry: visit.country || "",
      lastRegion: visit.region || "",
      lastCity: visit.city || "",
      lastTimezone: visit.timezone || "",
      lastLatitude: visit.latitude || "",
      lastLongitude: visit.longitude || ""
    };
  });

  if (!matched) {
    next.push({
      key: visit.visitorHash,
      firstSeenAt: visit.visitedAt,
      lastSeenAt: visit.visitedAt,
      visitCount: 1,
      sessionCount: 1,
      firstPage: visit.page,
      lastPage: visit.page,
      firstCountry: visit.country || "",
      firstRegion: visit.region || "",
      firstCity: visit.city || "",
      firstTimezone: visit.timezone || "",
      lastCountry: visit.country || "",
      lastRegion: visit.region || "",
      lastCity: visit.city || "",
      lastTimezone: visit.timezone || "",
      lastLatitude: visit.latitude || "",
      lastLongitude: visit.longitude || ""
    });
  }

  return {
    visitors: next
      .sort((first, second) => String(second.lastSeenAt || "").localeCompare(String(first.lastSeenAt || "")))
      .slice(0, MAX_VISITOR_ROWS),
    visitorType,
    sessionType,
    visitCount
  };
}

function publicVisitRecord(visit) {
  const {
    visitorHash,
    ...publicVisit
  } = visit;
  return publicVisit;
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
    recentVisits: [],
    visitors: [],
    identifiedVisits: 0,
    uniqueVisitors: 0,
    returningVisitors: 0,
    repeatVisits: 0,
    legacyVisits: 0
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
  try {
    const url = new URL(page, "https://aja.bt");
    const noisyPrefixes = ["utm_", "_ga"];
    const noisyKeys = new Set(["fbclid", "gclid", "msclkid", "mc_cid", "mc_eid", "igshid"]);
    [...url.searchParams.keys()].forEach((key) => {
      const lower = key.toLowerCase();
      if (noisyKeys.has(lower) || noisyPrefixes.some((prefix) => lower.startsWith(prefix))) {
        url.searchParams.delete(key);
      }
    });
    const query = url.searchParams.toString();
    return `${url.pathname}${query ? `?${query}` : ""}`.slice(0, 180);
  } catch {
    return page.split("?")[0].slice(0, 180) || "/";
  }
}

function cleanCoordinate(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return "";
  return number.toFixed(3);
}

async function hashVisitorId(value, env) {
  const visitorId = cleanText(value);
  if (!visitorId || visitorId.length < 12) return "";
  const secret = env.VISITOR_ANALYTICS_SECRET || env.POST_EDITOR_SESSION_SECRET || env.GITHUB_TOKEN || "aja-visitor-analytics";
  const bytes = new TextEncoder().encode(`${secret}:${visitorId}`);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}
