import { jsonResponse, requireEditor } from "./_shared.js";

export async function onRequestGet({ request, env }) {
  const auth = await requireEditor(request, env);
  if (auth.error) {
    return jsonResponse({ authenticated: false, user: null }, 200);
  }

  return jsonResponse({
    authenticated: true,
    user: {
      name: "Post Editor",
      username: auth.session.username,
      role: "editor",
      status: "active"
    }
  });
}
