import { jsonResponse, requireEditor, savePostItems } from "./_shared.js";

export async function onRequestPost({ request, env }) {
  const auth = await requireEditor(request, env);
  if (auth.error) return auth.error;

  let payload;
  try {
    payload = await request.json();
  } catch {
    return jsonResponse({ ok: false, error: "Invalid save payload" }, 400);
  }

  try {
    const saved = await savePostItems(payload.key, payload.data || {}, env);
    if (saved.error) return saved.error;

    return jsonResponse({
      ok: true,
      file: saved.file,
      data: saved.data
    });
  } catch (error) {
    return jsonResponse({ ok: false, error: error.message || "Unable to save post file" }, 500);
  }
}
