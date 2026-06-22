import { clearSessionCookie, jsonResponse } from "./_shared.js";

export async function onRequestPost() {
  return jsonResponse({ ok: true }, 200, { "set-cookie": clearSessionCookie() });
}
