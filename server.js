const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send(`
    <html>
      <body>
        <h1>Hello! This is Grace's Cloudflare Assessment</h1>
        <p>This server is protected by Cloudflare.</p>
        <a href="/secure">Access Secure Area</a>
      </body>
    </html>
  `);
});

app.get('/secure', (req, res) => {
  res.send('<h1>Secure Area</h1><p>This page is protected.</p>');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});