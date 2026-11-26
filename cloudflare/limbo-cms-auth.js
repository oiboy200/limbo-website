const ORIGIN = "https://limbo-website.pages.dev";
const GITHUB_AUTHORIZE = "https://github.com/login/oauth/authorize";
const GITHUB_TOKEN = "https://github.com/login/oauth/access_token";

function html(body, status = 200) {
  return new Response(`<!doctype html><html><head><meta charset="utf-8"><title>LIMBO CMS authentication</title></head><body>${body}</body></html>`, {
    status,
    headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" }
  });
}

function randomState() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, b => b.toString(16).padStart(2, "0")).join("");
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method !== "GET") return new Response("Method not allowed", { status: 405 });

    if (url.pathname === "/auth") {
      if (!env.GITHUB_CLIENT_ID || !env.GITHUB_CLIENT_SECRET) {
        return new Response("OAuth secrets are not configured.", { status: 503 });
      }
      const state = randomState();
      const redirect = new URL(GITHUB_AUTHORIZE);
      redirect.searchParams.set("client_id", env.GITHUB_CLIENT_ID);
      redirect.searchParams.set("redirect_uri", new URL("/callback", url.origin).toString());
      redirect.searchParams.set("scope", "repo");
      redirect.searchParams.set("state", state);
      return new Response(null, {
        status: 302,
        headers: {
          "location": redirect.toString(),
          "set-cookie": `limbo_oauth_state=${state}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=600`,
          "cache-control": "no-store"
        }
      });
    }

    if (url.pathname === "/callback") {
      const code = url.searchParams.get("code");
      const returnedState = url.searchParams.get("state");
      const cookie = request.headers.get("cookie") || "";
      const match = cookie.match(/(?:^|;\s*)limbo_oauth_state=([a-f0-9]+)/);
      const savedState = match?.[1];
      if (!code || !returnedState || !savedState || returnedState !== savedState) {
        return html("<h2>Autenticazione non valida</h2><p>Chiudi questa finestra e riprova dal CMS.</p>", 400);
      }

      const tokenResponse = await fetch(GITHUB_TOKEN, {
        method: "POST",
        headers: {
          "accept": "application/json",
          "content-type": "application/json",
          "user-agent": "LIMBO-Decap-CMS"
        },
        body: JSON.stringify({
          client_id: env.GITHUB_CLIENT_ID,
          client_secret: env.GITHUB_CLIENT_SECRET,
          code,
          redirect_uri: new URL("/callback", url.origin).toString()
        })
      });
      const tokenData = await tokenResponse.json();
      if (!tokenResponse.ok || !tokenData.access_token) {
        return html("<h2>Accesso GitHub non riuscito</h2><p>Chiudi questa finestra e riprova.</p>", 502);
      }

      const payload = JSON.stringify({ token: tokenData.access_token, provider: "github" });
      const message = "authorization:github:success:" + payload;
      return new Response(`<!doctype html><html><head><meta charset="utf-8"><title>LIMBO CMS</title></head><body><p>Accesso completato. Puoi tornare al CMS.</p><script>if(window.opener){window.opener.postMessage(${JSON.stringify(message)}, ${JSON.stringify(ORIGIN)});window.close();}</script></body></html>`, {
        headers: {
          "content-type": "text/html; charset=utf-8",
          "cache-control": "no-store",
          "set-cookie": "limbo_oauth_state=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0"
        }
      });
    }

    return new Response("LIMBO CMS OAuth service", {
      headers: { "content-type": "text/plain; charset=utf-8" }
    });
  }
};
