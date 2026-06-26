import { getContentPath, githubGetJson, jsonResponse, requireEditor } from "../api/post-editor/_shared.js";

export async function onRequest({ request, env }) {
  if (request.method !== "GET") {
    return jsonResponse({ ok: false, error: "method_not_allowed" }, 405);
  }

  const auth = await requireEditor(request, env);
  if (auth.error) return auth.error;

  const data = await githubGetJson(getContentPath("visitor_analytics"), env);
  return jsonResponse(data);
}
