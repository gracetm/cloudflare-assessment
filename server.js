const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// ============================================
// MIDDLEWARE - Block direct Render access
// Only allow requests coming through Cloudflare
// ============================================
// app.use((req, res, next) => {
//   const cfRay = req.headers['cf-ray'];

//   if (!cfRay) {
//     return res.status(403).send(`
//       <html>
//         <head>
//           <title>403 - Access Forbidden</title>
//           <style>
//             body { 
//               font-family: Arial, sans-serif; 
//               text-align: center; 
//               padding: 50px;
//               background: #f5f5f5;
//             }
//             .error-box {
//               background: white;
//               border: 2px solid #e74c3c;
//               border-radius: 8px;
//               padding: 40px;
//               max-width: 600px;
//               margin: 0 auto;
//             }
//             h1 { color: #e74c3c; }
//             .icon { font-size: 64px; margin-bottom: 20px; }
//           </style>
//         </head>
//         <body>
//           <div class="error-box">
//             <div class="icon">🚫</div>
//             <h1>403 - Direct Access Forbidden</h1>
//             <p>This server can only be accessed through Cloudflare.</p>
//             <p>Please visit via the proper domain: <strong>tmgracee.online</strong></p>
//             <hr>
//             <small>Request ID: ${Date.now()}</small>
//           </div>
//         </body>
//       </html>
//     `);
//   }

//   next();
// });

// ============================================
// HOMEPAGE
// ============================================
app.get('/', (req, res) => {
  const country = req.headers['cf-ipcountry'] || 'Unknown';
  const cfRay = req.headers['cf-ray'] || 'Not via Cloudflare';
  const ip = req.headers['cf-connecting-ip'] || req.ip;

  res.send(`
    <html>
      <head>
        <title>Grace's Cloudflare Assessment</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 800px; margin: 50px auto; padding: 20px; }
          .card { background: #f5f5f5; border-radius: 8px; padding: 20px; margin: 20px 0; }
          .badge { background: #F6821F; color: white; padding: 4px 10px; border-radius: 4px; font-size: 12px; }
          a { color: #F6821F; }
          h1 { color: #404040; }
        </style>
      </head>
      <body>
        <h1>🌐 Grace's Cloudflare Assessment</h1>
        <span class="badge">Protected by Cloudflare</span>
        
        <div class="card">
          <h2>📡 Connection Info</h2>
          <p><strong>Your IP:</strong> ${ip}</p>
          <p><strong>Your Country:</strong> ${country}</p>
          <p><strong>CF-Ray ID:</strong> ${cfRay}</p>
        </div>

        <div class="card">
          <h2>🗺️ Demo Pages</h2>
          <ul>
            <li><a href="/login">Login Page</a> — Rate Limiting Demo</li>
            <li><a href="/secure">Secure Area</a> — Zero Trust Protected</li>
            // <li><a href="/admin">Admin Panel</a> — WAF Demo</li>
            // <li><a href="/api/data">API Endpoint</a> — SQL Injection Test</li>
          </ul>
        </div>
      </body>
    </html>
  `);
});

// ============================================
// LOGIN PAGE - For Rate Limiting Demo
// ============================================
app.get('/login', (req, res) => {
  res.send(`
    <html>
      <head>
        <title>Login - Rate Limiting Demo</title>
        <style>
          body { font-family: Arial; max-width: 400px; margin: 100px auto; padding: 20px; }
          input { width: 100%; padding: 10px; margin: 10px 0; box-sizing: border-box; }
          button { width: 100%; padding: 10px; background: #F6821F; color: white; border: none; cursor: pointer; }
          .info { background: #fff3cd; padding: 10px; border-radius: 4px; font-size: 13px; }
        </style>
      </head>
      <body>
        <h2>🔐 Login</h2>
        <div class="info">
          ⚠️ This page is rate-limited by Cloudflare.<br>
          More than 5 requests/10 seconds from the same IP will be blocked.
        </div>
        <br>
        <input type="text" placeholder="Username" />
        <input type="password" placeholder="Password" />
        <button>Login</button>
      </body>
    </html>
  `);
});

// ============================================
// ADMIN PAGE - WAF Demo
// ============================================
// app.get('/admin', (req, res) => {
//   res.send(`
//     <html>
//       <body style="font-family: Arial; max-width: 600px; margin: 50px auto; padding: 20px;">
//         <h2>⚙️ Admin Panel</h2>
//         <p>This page is protected by Cloudflare's WAF Managed Rulesets.</p>
//         <p>Try appending <code>?id=1' OR '1'='1</code> to the URL — Cloudflare will block it.</p>
//       </body>
//     </html>
//   `);
// });

// // ============================================
// // API ENDPOINT - SQL Injection Demo Target
// // ============================================
// app.get('/api/data', (req, res) => {
//   const id = req.query.id;
//   res.json({
//     message: "If you see this, Cloudflare WAF allowed the request",
//     requested_id: id || "none",
//     data: [{ id: 1, name: "Sample Record" }]
//   });
// });

// ============================================
// SECURE PAGE - Zero Trust Protected
// (Worker will override this in Part 3)
// ============================================
app.get('/secure', (req, res) => {
  res.send(`
    <html>
      <head>
        <title>Secure Area</title>
        <style>
          body { font-family: Arial; max-width: 600px; margin: 50px auto; padding: 20px; }
          .secure-badge { background: #28a745; color: white; padding: 6px 14px; border-radius: 4px; }
        </style>
      </head>
      <body>
        <h1>🔒 Secure Area</h1>
        <span class="secure-badge">Zero Trust Protected</span>
        <p>You have successfully authenticated.</p>
      </body>
    </html>
  `);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});