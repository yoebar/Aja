function renderAuthPage(status, content) {
  const payload = JSON.stringify(content).replace(/</g, "\\u003c");

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Authorising GitHub</title>
</head>
<body>
  <script>
    (function () {
      var message = 'authorization:github:${status}:${payload}';
      var attempts = 0;

      function sendAuthMessage(targetOrigin) {
        if (!window.opener) return;
        window.opener.postMessage(message, targetOrigin || '*');
      }

      function receiveMessage(message) {
        sendAuthMessage(message.origin);
        window.removeEventListener('message', receiveMessage, false);
      }

      window.addEventListener('message', receiveMessage, false);
      window.opener.postMessage('authorizing:github', '*');

      var retry = window.setInterval(function () {
        attempts += 1;
        sendAuthMessage('*');

        if (attempts >= 10) {
          window.clearInterval(retry);
        }
      }, 250);
    })();
  </script>
</body>
</html>`;
}

export async function onRequest({ request, env }) {
  if (!env.GITHUB_CLIENT_ID || !env.GITHUB_CLIENT_SECRET) {
    return new Response("Missing GitHub OAuth environment variables", { status: 500 });
  }

  const url = new URL(request.url);
  const code = url.searchParams.get("code");

  if (!code) {
    return new Response(renderAuthPage("error", { message: "Missing GitHub code" }), {
      status: 400,
      headers: { "content-type": "text/html; charset=utf-8" }
    });
  }

  const response = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      "user-agent": "aja-website-admin"
    },
    body: JSON.stringify({
      client_id: env.GITHUB_CLIENT_ID,
      client_secret: env.GITHUB_CLIENT_SECRET,
      code
    })
  });

  const result = await response.json();

  if (!response.ok || result.error) {
    return new Response(renderAuthPage("error", result), {
      status: 401,
      headers: { "content-type": "text/html; charset=utf-8" }
    });
  }

  return new Response(renderAuthPage("success", {
    token: result.access_token,
    provider: "github"
  }), {
    headers: { "content-type": "text/html; charset=utf-8" }
  });
}
