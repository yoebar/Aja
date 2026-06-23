import { getContentPath, githubGetJson, jsonResponse, requireEditor } from "./_shared.js";

const KEYS = ["notices", "vacancies", "tenders", "contact_form", "contact_submissions", "visitor_analytics"];

export async function onRequestGet({ request, env }) {
  const auth = await requireEditor(request, env);
  if (auth.error) return auth.error;

  try {
    const files = {};
    await Promise.all(KEYS.map(async (key) => {
      files[key] = await githubGetJson(getContentPath(key), env);
    }));
    return jsonResponse(files);
  } catch (error) {
    return jsonResponse({ ok: false, error: error.message || "Unable to load post files" }, 500);
  }
}
