import { createSessionCookie, jsonResponse, requireEnv, validLogin } from "./_shared.js";

export async function onRequestPost({ request, env }) {
  const missing = requireEnv(env);
  if (missing) {
    return jsonResponse({ ok: false, error: missing }, 500);
  }

  let payload;
  try {
    payload = await request.json();
  } catch {
    return jsonResponse({ ok: false, error: "Invalid login payload" }, 400);
  }

  const username = String(payload.username || "").trim();
  const password = String(payload.password || "");
  if (!(await validLogin(username, password, env))) {
    return jsonResponse({ ok: false, error: "Invalid username or password" }, 401);
  }

  return jsonResponse(
    {
      ok: true,
      user: {
        name: "Post Editor",
        username,
        role: "editor",
        status: "active"
      },
      redirect: "/admin/post-editor.html"
    },
    200,
    { "set-cookie": await createSessionCookie(username, env) }
  );
}
