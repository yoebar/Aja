export async function onRequest({ request, env }) {
  if (!env.GITHUB_CLIENT_ID) {
    return new Response("Missing GITHUB_CLIENT_ID", { status: 500 });
  }

  const url = new URL(request.url);
  const redirectUrl = new URL("https://github.com/login/oauth/authorize");
  redirectUrl.searchParams.set("client_id", env.GITHUB_CLIENT_ID);
  redirectUrl.searchParams.set("redirect_uri", `${url.origin}/api/callback`);
  redirectUrl.searchParams.set("scope", "repo user");
  redirectUrl.searchParams.set("state", crypto.randomUUID());

  return Response.redirect(redirectUrl.toString(), 302);
}
