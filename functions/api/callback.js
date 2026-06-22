function renderAuthPage(status, content) {
  const payload = JSON.stringify(content).replace(/</g, "\\u003c");

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Authorising GitHub</title>
  <style>
    body {
      align-items: center;
      background: #f5f7fb;
      color: #172026;
      display: flex;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      justify-content: center;
      margin: 0;
      min-height: 100vh;
    }

    main {
      background: #ffffff;
      border: 1px solid #d8dee8;
      border-radius: 8px;
      box-shadow: 0 16px 45px rgba(15, 23, 42, 0.12);
      max-width: 520px;
      padding: 28px;
      width: calc(100% - 48px);
    }

    h1 {
      font-size: 22px;
      margin: 0 0 10px;
    }

    p {
      line-height: 1.5;
      margin: 0;
    }

    code {
      background: #eef2f7;
      border-radius: 4px;
      display: block;
      margin-top: 16px;
      overflow-wrap: anywhere;
      padding: 12px;
    }
  </style>
</head>
<body>
  <main>
    <h1>Authorising GitHub</h1>
    <p id="status">Waiting for the admin page to complete login...</p>
    <code id="details"></code>
  </main>
  <script>
    (function () {
      var payload = ${payload};
      var message = 'authorization:github:${status}:' + JSON.stringify(payload);
      var attempts = 0;
      var authorised = ${JSON.stringify(status === "success")};
      var statusText = document.getElementById('status');
      var details = document.getElementById('details');
      var channelName = 'aja-decap-auth';
      var storageKey = 'aja-decap-auth-message';

      details.textContent = authorised
        ? 'GitHub approved this login. Returning to the admin page.'
        : 'GitHub returned: ' + JSON.stringify(payload);

      function updateStatus(text) {
        statusText.textContent = text;
      }

      function sendAuthMessage(targetOrigin) {
        if (!window.opener) {
          updateStatus('This login window cannot find the admin page. Close this window, return to /admin/, and click Login with GitHub again.');
          return false;
        }

        window.opener.postMessage(message, targetOrigin || window.location.origin);
        return true;
      }

      function broadcastAuthMessage(data) {
        if ('BroadcastChannel' in window) {
          var channel = new BroadcastChannel(channelName);
          channel.postMessage(data);
          channel.close();
        }

        try {
          localStorage.setItem(storageKey, JSON.stringify({
            message: data,
            time: Date.now()
          }));
        } catch (error) {
          console.error('Unable to store admin login message', error);
        }
      }

      function sendHandshake() {
        broadcastAuthMessage('authorizing:github');

        if (!window.opener) {
          updateStatus('This login window cannot find the admin page. Close this window, return to /admin/, and click Login with GitHub again.');
          return false;
        }

        window.opener.postMessage('authorizing:github', window.location.origin);
        return true;
      }

      function receiveMessage(event) {
        sendAuthMessage(event.origin);
        broadcastAuthMessage(message);
        window.removeEventListener('message', receiveMessage, false);

        window.setTimeout(function () {
          window.close();
        }, 600);
      }

      window.addEventListener('message', receiveMessage, false);
      sendHandshake();

      var retry = window.setInterval(function () {
        attempts += 1;
        sendHandshake();

        if (attempts > 1) {
          broadcastAuthMessage(message);
        }

        if (attempts >= 20) {
          window.clearInterval(retry);
          sendAuthMessage(window.location.origin);
          broadcastAuthMessage(message);
          updateStatus(authorised
            ? 'GitHub approved this login, but the admin page did not respond. Close this window, refresh /admin/, and try once more.'
            : 'GitHub returned an error. Close this window, return to /admin/, and try once more.');
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
