const CONTENT_FILES = {
  notices: "content/notices.json",
  vacancies: "content/vacancies.json",
  tenders: "content/tenders.json",
  contact_form: "content/contact-form.json",
  contact_submissions: "content/contact-submissions.json",
  visitor_analytics: "content/visitor-analytics.json"
};

const POST_ITEM_KEYS = new Set(["notices", "vacancies", "tenders"]);
const FULL_CONTENT_KEYS = new Set(["contact_form", "contact_submissions", "visitor_analytics"]);
const EDITOR_WRITE_KEYS = new Set(["notices", "vacancies", "tenders", "contact_form"]);

const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif"]);
const PDF_EXTENSIONS = new Set([".pdf"]);
const SESSION_COOKIE = "aja_post_editor_session";
const SESSION_SECONDS = 60 * 60 * 8;

export function jsonResponse(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      ...extraHeaders
    }
  });
}

export function getContentPath(key) {
  return CONTENT_FILES[key] || "";
}

export function requireEnv(env) {
  const missing = [
    "GITHUB_TOKEN",
    "GITHUB_REPO",
    "POST_EDITOR_USERNAME",
    "POST_EDITOR_PASSWORD",
    "POST_EDITOR_SESSION_SECRET"
  ].filter((key) => !env[key]);

  if (missing.length) {
    return `Missing environment variables: ${missing.join(", ")}`;
  }
  return "";
}

export async function requireEditor(request, env) {
  const missing = requireEnv(env);
  if (missing) {
    return { error: jsonResponse({ ok: false, error: missing }, 500) };
  }

  const token = readCookie(request, SESSION_COOKIE);
  const session = token ? await verifySessionToken(token, env.POST_EDITOR_SESSION_SECRET) : null;
  if (!session || session.role !== "editor") {
    return { error: jsonResponse({ ok: false, error: "not_authorised" }, 401) };
  }

  return { session };
}

export async function createSessionCookie(username, env) {
  const expires = Math.floor(Date.now() / 1000) + SESSION_SECONDS;
  const token = await signSessionToken({ username, role: "editor", expires }, env.POST_EDITOR_SESSION_SECRET);
  return `${SESSION_COOKIE}=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${SESSION_SECONDS}`;
}

export function clearSessionCookie() {
  return `${SESSION_COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;
}

export async function validLogin(username, password, env) {
  const expectedUser = String(env.POST_EDITOR_USERNAME || "").trim().toLowerCase();
  const actualUser = String(username || "").trim().toLowerCase();
  const expectedPassword = String(env.POST_EDITOR_PASSWORD || "");
  const actualPassword = String(password || "");
  return safeEqual(actualUser, expectedUser) && safeEqual(actualPassword, expectedPassword);
}

export async function githubGetJson(path, env) {
  const file = await githubGetContent(path, env);
  return JSON.parse(decodeBase64(file.content));
}

export async function githubGetContent(path, env) {
  const repo = env.GITHUB_REPO;
  const branch = env.GITHUB_BRANCH || "main";
  const url = `https://api.github.com/repos/${repo}/contents/${encodeURIComponentPath(path)}?ref=${encodeURIComponent(branch)}`;
  const response = await fetch(url, { headers: githubHeaders(env) });

  if (!response.ok) {
    throw new Error(`GitHub read failed for ${path}`);
  }

  return response.json();
}

export async function githubPutJson(path, data, message, env) {
  const current = await githubGetContent(path, env);
  return githubPutContent(path, encodeBase64(JSON.stringify(data, null, 2) + "\n"), current.sha, message, env);
}

export async function githubPutContent(path, content, sha, message, env) {
  const repo = env.GITHUB_REPO;
  const branch = env.GITHUB_BRANCH || "main";
  const url = `https://api.github.com/repos/${repo}/contents/${encodeURIComponentPath(path)}`;
  const response = await fetch(url, {
    method: "PUT",
    headers: githubHeaders(env),
    body: JSON.stringify({
      branch,
      content,
      message,
      sha
    })
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`GitHub write failed for ${path}: ${detail}`);
  }

  return response.json();
}

export async function savePostItems(key, incomingData, env) {
  const path = getContentPath(key);
  if (!path) {
    return { error: jsonResponse({ ok: false, error: "Unknown post section" }, 400) };
  }
  if (!EDITOR_WRITE_KEYS.has(key)) {
    return { error: jsonResponse({ ok: false, error: "Section is read only" }, 403) };
  }

  const current = await githubGetJson(path, env);
  const next = POST_ITEM_KEYS.has(key)
    ? {
      ...current,
      items: Array.isArray(incomingData.items) ? incomingData.items : current.items || []
    }
    : FULL_CONTENT_KEYS.has(key)
      ? incomingData
      : current;

  await githubPutJson(path, next, `Update ${key.replaceAll("_", " ")} content`, env);
  return { file: path, data: next };
}

export function cleanUpload(section, filename) {
  const safeSection = safeSegment(section);
  if (!POST_ITEM_KEYS.has(safeSection)) {
    throw new Error("Invalid advert section");
  }

  const safeName = safeFilename(filename);
  const extension = extensionOf(safeName);
  let kind = "";
  if (IMAGE_EXTENSIONS.has(extension)) {
    kind = "image";
  } else if (PDF_EXTENSIONS.has(extension)) {
    kind = "pdf";
  } else {
    throw new Error("Only image and PDF uploads are supported");
  }

  const stem = safeName.slice(0, safeName.length - extension.length).slice(0, 64) || "advert-file";
  const targetName = `${Date.now()}-${stem}${extension}`;
  return {
    kind,
    path: `assets/adverts/${safeSection}/${targetName}`
  };
}

function githubHeaders(env) {
  return {
    accept: "application/vnd.github+json",
    authorization: `Bearer ${env.GITHUB_TOKEN}`,
    "content-type": "application/json",
    "user-agent": "aja-post-editor",
    "x-github-api-version": "2022-11-28"
  };
}

async function signSessionToken(payload, secret) {
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signature = await hmac(encodedPayload, secret);
  return `${encodedPayload}.${signature}`;
}

async function verifySessionToken(token, secret) {
  const parts = String(token || "").split(".");
  if (parts.length !== 2) return null;

  const [encodedPayload, signature] = parts;
  const expected = await hmac(encodedPayload, secret);
  if (!safeEqual(signature, expected)) return null;

  try {
    const payload = JSON.parse(base64UrlDecode(encodedPayload));
    if (!payload.expires || payload.expires < Math.floor(Date.now() / 1000)) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

async function hmac(value, secret) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value));
  return base64UrlEncodeBytes(new Uint8Array(signature));
}

function readCookie(request, name) {
  const header = request.headers.get("cookie") || "";
  return header
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`))
    ?.slice(name.length + 1) || "";
}

function encodeBase64(value) {
  const bytes = new TextEncoder().encode(value);
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
}

function decodeBase64(value) {
  const binary = atob(String(value || "").replace(/\s/g, ""));
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

function base64UrlEncode(value) {
  return base64UrlEncodeBytes(new TextEncoder().encode(value));
}

function base64UrlEncodeBytes(bytes) {
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64UrlDecode(value) {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
  return decodeBase64(padded);
}

function safeEqual(left, right) {
  if (left.length !== right.length) return false;
  let result = 0;
  for (let index = 0; index < left.length; index += 1) {
    result |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }
  return result === 0;
}

function safeSegment(value) {
  return String(value || "").toLowerCase().replace(/[^a-z0-9_-]+/g, "-").replace(/^-+|-+$/g, "") || "general";
}

function safeFilename(value) {
  const name = String(value || "").split(/[\\/]/).pop() || "";
  const safe = name.replace(/[^A-Za-z0-9._-]+/g, "-").replace(/^[.-]+|[.-]+$/g, "");
  if (!safe) {
    throw new Error("Missing filename");
  }
  return safe;
}

function extensionOf(filename) {
  const match = filename.toLowerCase().match(/\.[a-z0-9]+$/);
  return match ? match[0] : "";
}

function encodeURIComponentPath(path) {
  return path.split("/").map(encodeURIComponent).join("/");
}
