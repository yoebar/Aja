import { cleanUpload, githubPutContent, jsonResponse, requireEditor } from "./_shared.js";

export async function onRequestPost({ request, env }) {
  const auth = await requireEditor(request, env);
  if (auth.error) return auth.error;

  let payload;
  try {
    payload = await request.json();
  } catch {
    return jsonResponse({ ok: false, error: "Invalid upload payload" }, 400);
  }

  try {
    const upload = cleanUpload(payload.section, payload.filename);
    const content = String(payload.content || "").replace(/^data:[^,]+,/, "");
    if (!content) {
      return jsonResponse({ ok: false, error: "Missing upload content" }, 400);
    }

    await githubPutContent(
      upload.path,
      content,
      undefined,
      `Upload ${upload.kind} for ${payload.section} advert post`,
      env
    );

    return jsonResponse({
      ok: true,
      kind: upload.kind,
      path: upload.path
    });
  } catch (error) {
    return jsonResponse({ ok: false, error: error.message || "Upload failed" }, 500);
  }
}
