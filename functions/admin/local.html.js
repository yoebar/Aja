export function onRequest({ request }) {
  return Response.redirect(new URL("/admin/", request.url).toString(), 302);
}
