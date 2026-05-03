export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // ─── /flags/:country → R2 ───
    if (url.pathname.startsWith('/flags/')) {
      const rawCountry = url.pathname.split('/flags/')[1];
      const attempts = [rawCountry.toUpperCase() + '.png', rawCountry.toLowerCase() + '.png'];

      let object = null;
      for (const filename of attempts) {
        object = await env.FLAGS_BUCKET.get(filename);
        if (object) break;
      }

      if (!object) return new Response(`Flag not found for: ${rawCountry}`, { status: 404 });

      return new Response(object.body, {
        headers: { 'Content-Type': 'image/png', 'Cache-Control': 'public, max-age=86400' }
      });
    }

    // ─── /flags-d1/:country → D1 ───
    if (url.pathname.startsWith('/flags-d1/')) {
      const rawCountry = url.pathname.split('/flags-d1/')[1];
      const attempts = [rawCountry.toUpperCase(), rawCountry.toLowerCase()];

      let result = null;
      for (const code of attempts) {
        result = await env.flags_database.prepare(
          'SELECT flag_data FROM flags WHERE country_code = ?'
        ).bind(code).first();
        if (result) break;
      }

      if (!result) return new Response(`Flag not found in D1 for: ${rawCountry}`, { status: 404 });

      const binaryString = atob(result.flag_data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);

      return new Response(bytes, {
        headers: { 'Content-Type': 'image/png', 'Cache-Control': 'public, max-age=86400' }
      });
    }

    // ─── /secure → identity page ───
if (url.pathname === '/secure') {
  const email = request.headers.get('Cf-Access-Authenticated-User-Email') || 'unauthenticated@unknown.com';
  const country = request.cf?.country || 'XX';
  const timestamp = new Date().toISOString(); // ISO format: 2026-05-03T18:31:17.013Z


  // Create the exact format requested
  const identityText = `${email} authenticated at ${timestamp} from ${country}`;


  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Secure Area</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500&family=Inter+Tight:wght@600;700&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Inter', sans-serif;
      background: #f9f9f8;
      color: #1a1a1a;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
    }
    .card {
      background: #fff;
      border: 1px solid #e8e8e5;
      border-radius: 16px;
      padding: 40px;
      width: 100%;
      max-width: 600px;
      box-shadow: 0 2px 16px rgba(0,0,0,0.06);
    }
    .top {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 32px;
    }
    .dot {
      width: 8px; height: 8px;
      background: #f6821f;
      border-radius: 50%;
    }
    .top-label {
      font-size: 12px;
      font-weight: 500;
      color: #888;
      letter-spacing: 0.06em;
      text-transform: uppercase;
    }
    .identity-text {
      font-family: 'Inter Tight', sans-serif;
      font-size: 16px;
      font-weight: 600;
      color: #1a1a1a;
      line-height: 1.6;
      margin-bottom: 32px;
      padding: 20px;
      background: #f9f9f8;
      border-radius: 10px;
      word-break: break-word;
    }
    .identity-text .email { color: #f6821f; }
    .identity-text .country {
      color: #f6821f;
      text-decoration: underline;
      cursor: pointer;
    }
    .row { margin-bottom: 20px; }
    .label {
      font-size: 11px;
      font-weight: 500;
      color: #aaa;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      margin-bottom: 6px;
    }
    .value {
      font-family: 'Inter Tight', sans-serif;
      font-size: 15px;
      font-weight: 600;
      color: #1a1a1a;
      word-break: break-all;
    }
    .value.orange { color: #f6821f; }
    .divider { height: 1px; background: #f0f0ee; margin: 28px 0; }
    .flag-link {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      color: #f6821f;
      text-decoration: none;
      font-size: 14px;
      font-weight: 500;
      transition: opacity 0.15s;
    }
    .flag-link:hover { opacity: 0.7; }
    .d1-link {
      display: block;
      margin-top: 10px;
      font-size: 12px;
      color: #bbb;
      text-decoration: none;
      transition: color 0.15s;
    }
    .d1-link:hover { color: #888; }
  </style>
</head>
<body>
  <div class="card">
    <div class="top">
      <div class="dot"></div>
      <span class="top-label">Authenticated Session</span>
    </div>


    <!-- Exact format as requested in assignment -->
    <div class="identity-text">
      <span class="email">${email}</span> authenticated at <strong>${timestamp}</strong> from <a href="/flags/${country}" class="country">${country}</a>
    </div>


    <div class="divider"></div>


    <!-- Detailed breakdown -->
    <div class="row">
      <div class="label">User Email</div>
      <div class="value orange">${email}</div>
    </div>


    <div class="row">
      <div class="label">Timestamp (ISO 8601)</div>
      <div class="value">${timestamp}</div>
    </div>


    <div class="row">
      <div class="label">Country Code</div>
      <div class="value">${country}</div>
    </div>


    <div class="divider"></div>


    <a class="flag-link" href="/flags/${country}">
      View flag for ${country} from R2 &rarr;
    </a>
    <a class="d1-link" href="/flags-d1/${country}">Also available via D1 &rarr;</a>
  </div>
</body>
</html>`;


  return new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}

    // ─── Homepage ───
    const homeHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CF Worker Demo</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500&family=Inter+Tight:wght@600;700&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Inter', sans-serif;
      background: #f9f9f8;
      color: #1a1a1a;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
    }
    .card {
      background: #fff;
      border: 1px solid #e8e8e5;
      border-radius: 16px;
      padding: 40px;
      width: 100%;
      max-width: 480px;
      box-shadow: 0 2px 16px rgba(0,0,0,0.06);
    }
    .cf-tag {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 11px;
      font-weight: 500;
      color: #f6821f;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      margin-bottom: 20px;
    }
    .cf-dot { width: 6px; height: 6px; background: #f6821f; border-radius: 50%; }
    h1 {
      font-family: 'Inter Tight', sans-serif;
      font-size: 26px;
      font-weight: 700;
      margin-bottom: 8px;
      letter-spacing: -0.02em;
    }
    .subtitle { font-size: 13px; color: #999; margin-bottom: 36px; }
    .route-list { display: flex; flex-direction: column; gap: 8px; }
    .route {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      border: 1px solid #f0f0ee;
      border-radius: 10px;
      text-decoration: none;
      color: inherit;
      transition: border-color 0.15s, background 0.15s;
    }
    .route:hover { border-color: #f6821f; background: #fff8f4; }
    .method {
      font-size: 10px;
      font-weight: 600;
      color: #f6821f;
      background: #fff3eb;
      padding: 3px 8px;
      border-radius: 5px;
      letter-spacing: 0.05em;
      min-width: 36px;
      text-align: center;
    }
    .path {
      font-family: 'Inter Tight', sans-serif;
      font-size: 14px;
      font-weight: 600;
    }
    .desc { font-size: 12px; color: #aaa; margin-left: auto; }
  </style>
</head>
<body>
  <div class="card">
    <div class="cf-tag"><span class="cf-dot"></span> Cloudflare Workers</div>
    <h1>Assessment Demo</h1>
    <p class="subtitle">Cloudflare Associate SE &mdash; Grace</p>

    <div class="route-list">
      <a class="route" href="/secure">
        <span class="method">GET</span>
        <span class="path">/secure</span>
        <span class="desc">Identity info</span>
      </a>
      <a class="route" href="/flags/SG">
        <span class="method">GET</span>
        <span class="path">/flags/:country</span>
        <span class="desc">Flag from R2</span>
      </a>
      <a class="route" href="/flags-d1/SG">
        <span class="method">GET</span>
        <span class="path">/flags-d1/:country</span>
        <span class="desc">Flag from D1</span>
      </a>
    </div>
  </div>
</body>
</html>`;

    return new Response(homeHtml, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
  }
};