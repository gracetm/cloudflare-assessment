const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// allow Express to read form data submitted from HTML forms
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// ============================================================
// HOMEPAGE
// ============================================================
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Grace's Cloudflare Assessment</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 800px; margin: 50px auto; padding: 20px; }
          h1 { color: #f6821f; }
          nav a { margin-right: 20px; color: #f6821f; text-decoration: none; font-weight: bold; }
          nav a:hover { text-decoration: underline; }
          .card { background: #f9f9f9; border: 1px solid #ddd; padding: 20px; margin: 20px 0; border-radius: 8px; }
          .badge { background: #f6821f; color: white; padding: 3px 10px; border-radius: 12px; font-size: 12px; }
        </style>
      </head>
      <body>
        <h1>🌐 Grace's Cloudflare Assessment App</h1>
        <nav>
          <a href="/">Home</a>
          <a href="/login">Login Demo</a>
          <a href="/search">Search Demo</a>
          <a href="/admin">Admin Area</a>
          <a href="/health">Health Check</a>
        </nav>
        <hr/>

        <div class="card">
          <h2>Welcome!</h2>
          <p>This application demonstrates Cloudflare's Application Services capabilities.</p>
          <p>Each page in this app is designed to showcase a specific Cloudflare feature:</p>
          <ul>
            <li><strong>/login</strong> — Demonstrates <span class="badge">Rate Limiting</span></li>
            <li><strong>/search</strong> — Demonstrates <span class="badge">SQL Injection Protection (WAF)</span></li>
            <li><strong>/admin</strong> — Demonstrates <span class="badge">IP Bypass Prevention</span></li>
          </ul>
        </div>

        <div class="card">
          <h3>Server Info</h3>
          <p><strong>Your IP:</strong> ${req.headers['cf-connecting-ip'] || req.headers['x-forwarded-for'] || req.ip}</p>
          <p><strong>Via Cloudflare:</strong> ${req.headers['cf-ray'] ? '✅ Yes (CF-Ray: ' + req.headers['cf-ray'] + ')' : '❌ No — Direct access detected'}</p>
          <p><strong>Country:</strong> ${req.headers['cf-ipcountry'] || 'Unknown'}</p>
        </div>
      </body>
    </html>
  `);
});

// ============================================================
// LOGIN PAGE — Used to demonstrate Rate Limiting
// ============================================================
app.get('/login', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Login — Rate Limiting Demo</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 500px; margin: 80px auto; padding: 20px; }
          h2 { color: #f6821f; }
          input { width: 100%; padding: 10px; margin: 8px 0; box-sizing: border-box; border: 1px solid #ccc; border-radius: 4px; }
          button { background: #f6821f; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; width: 100%; }
          .info { background: #fff3e0; border-left: 4px solid #f6821f; padding: 10px; margin-bottom: 20px; font-size: 14px; }
          nav a { color: #f6821f; }
        </style>
      </head>
      <body>
        <p><nav><a href="/">← Back to Home</a></nav></p>
        <h2>🔐 Login Page</h2>
        <div class="info">
          <strong>Demo Note:</strong> This page is protected by a Cloudflare Rate Limiting rule. 
          Submitting this form more than 5 times in 60 seconds from the same IP will trigger a block.
        </div>
        <form method="POST" action="/login">
          <input type="text" name="username" placeholder="Username" required />
          <input type="password" name="password" placeholder="Password" required />
          <button type="submit">Login</button>
        </form>
      </body>
    </html>
  `);
});

app.post('/login', (req, res) => {
  // This simulates a login attempt. In a real app this would check a database.
  // For demo purposes, it always returns "invalid credentials"
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Login Failed</title>
        <style>body { font-family: Arial, sans-serif; max-width: 500px; margin: 80px auto; padding: 20px; }</style>
      </head>
      <body>
        <h2>❌ Invalid credentials</h2>
        <p>Username or password is incorrect.</p>
        <a href="/login">Try again</a>
      </body>
    </html>
  `);
});

// ============================================================
// SEARCH PAGE — Used to demonstrate SQL Injection Protection
// ============================================================
app.get('/search', (req, res) => {
  const query = req.query.q || '';
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Search — WAF/SQLi Demo</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 600px; margin: 80px auto; padding: 20px; }
          h2 { color: #f6821f; }
          input { width: 80%; padding: 10px; border: 1px solid #ccc; border-radius: 4px; }
          button { background: #f6821f; color: white; padding: 10px 15px; border: none; border-radius: 4px; cursor: pointer; }
          .info { background: #fff3e0; border-left: 4px solid #f6821f; padding: 10px; margin-bottom: 20px; font-size: 14px; }
          .result { background: #f9f9f9; padding: 10px; border-radius: 4px; margin-top: 15px; }
          nav a { color: #f6821f; }
        </style>
      </head>
      <body>
        <p><nav><a href="/">← Back to Home</a></nav></p>
        <h2>🔍 Search Page</h2>
        <div class="info">
          <strong>Demo Note:</strong> This search box is protected by Cloudflare's Web Application Firewall (WAF). 
          Try submitting a SQL injection payload like <code>' OR '1'='1</code> — Cloudflare will block it before it reaches this server.
        </div>
        <form method="GET" action="/search">
          <input type="text" name="q" placeholder="Search..." value="${query}" />
          <button type="submit">Search</button>
        </form>
        ${query ? `<div class="result"><strong>You searched for:</strong> ${query}</div>` : ''}
      </body>
    </html>
  `);
});

// ============================================================
// ADMIN PAGE — Used to demonstrate IP Bypass Prevention
// ============================================================
app.get('/admin', (req, res) => {
  const isViaCF = req.headers['cf-ray'];
  const connectingIP = req.headers['cf-connecting-ip'] || req.headers['x-forwarded-for'] || req.ip;

  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Admin — IP Bypass Demo</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 600px; margin: 80px auto; padding: 20px; }
          h2 { color: #f6821f; }
          .via-cf { background: #e8f5e9; border-left: 4px solid #4caf50; padding: 15px; border-radius: 4px; }
          .direct { background: #ffebee; border-left: 4px solid #f44336; padding: 15px; border-radius: 4px; }
          nav a { color: #f6821f; }
        </style>
      </head>
      <body>
        <p><nav><a href="/">← Back to Home</a></nav></p>
        <h2>🛡️ Admin Area</h2>
        ${isViaCF
          ? `<div class="via-cf">
              <strong>✅ Access via Cloudflare detected</strong><br/>
              CF-Ray: ${req.headers['cf-ray']}<br/>
              Your visible IP (as seen by server): ${connectingIP}<br/>
              Country: ${req.headers['cf-ipcountry'] || 'Unknown'}
             </div>`
          : `<div class="direct">
              <strong>⚠️ Direct access detected — not coming through Cloudflare</strong><br/>
              IP: ${connectingIP}<br/>
              This request bypassed Cloudflare entirely. In a properly secured setup, this should be blocked.
             </div>`
        }
      </body>
    </html>
  `);
});

// ============================================================
// HEALTH CHECK — Simple status endpoint
// ============================================================
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    via_cloudflare: !!req.headers['cf-ray'],
    cf_ray: req.headers['cf-ray'] || null,
    country: req.headers['cf-ipcountry'] || null
  });
});

// ============================================================
// START SERVER
// ============================================================
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});