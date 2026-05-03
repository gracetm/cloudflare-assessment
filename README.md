# Cloudflare Associate Solutions Engineer Assessment

This repository contains my implementation of the Cloudflare Associate Solutions Engineer take-home assessment. The project demonstrates practical application of Cloudflare's Application Services, Zero Trust, and Developer Platform products.

## Live Demo

- **Main Application**: https://tmgracee.online
- **Worker Endpoint**: https://cf-worker.gracetm.workers.dev/
- **Protected Path**: https://tmgracee.online/secure (authentication required)

## Project Overview

I built a web application to showcase Cloudflare's security, performance, and serverless capabilities. The implementation consists of three main components:

1. **Origin Server** - Node.js application hosted on Render.com
2. **Cloudflare Proxy Layer** - DNS, WAF, rate limiting, and TLS encryption
3. **Cloudflare Worker** - Serverless functions with R2 object storage and D1 database

## Architecture

```
User Browser
    ↓
Cloudflare Edge Network
    ├── DNS Resolution
    ├── WAF Protection
    ├── Rate Limiting
    ├── TLS Termination
    └── Zero Trust Access
    ↓
Origin Server (Render.com)
    └── Node.js + Express

Cloudflare Worker (Serverless)
    ├── R2 Bucket (255 flag images)
    └── D1 Database (214 flags)
```

## Technology Stack

- **Backend**: Node.js, Express.js
- **Hosting**: Render.com (free tier)
- **Domain**: tmgracee.online (Namecheap)
- **CDN/Security**: Cloudflare Free Plan
- **Serverless**: Cloudflare Workers
- **Storage**: Cloudflare R2
- **Database**: Cloudflare D1 (SQLite)
- **Authentication**: Cloudflare Zero Trust Access
- **CLI**: Wrangler

## Repository Structure

```
cloudflare-assessment/
├── cf-worker/                      # Cloudflare Worker project
│   ├── bold-pine-43c5/             # Worker deployment
│   │   ├── src/
│   │   │   └── index.js            # Worker code
│   │   ├── test/                   # Test files
│   │   ├── node_modules/           # Worker dependencies
│   │   ├── package.json            # Worker package config
│   │   ├── vitest.config.js        # Test configuration
│   │   └── wrangler.jsonc          # Worker configuration
│   ├── png1000px/                  # Flag images (1000x1000px)
│   └── seed-d1-flags.ps1           # PowerShell script for D1 seeding
├── node_modules/                   # Root dependencies
├── package-lock.json               # Dependency lock file
├── package.json                    # Root package config
├── README.md                       # This file
└── server.js                       # Origin server application
```

## Part 1: Application Services

### Origin Server (server.js)

A Node.js web application was created with multiple routes to demonstrate different Cloudflare security features:

**Routes:**
- `/` - Homepage with connection information
- `/login` - Rate limiting demonstration target
- `/secure` - Zero Trust protected area
- `/admin` - WAF protection demonstration

**Key Features:**
- Displays visitor IP, country, and Cloudflare Ray ID
- Shows authentication status for protected routes
- Provides links to test security features

### Cloudflare Configuration

**DNS Setup:**
- Domain registered through Namecheap
- Nameservers changed to Cloudflare
- CNAME records for root and www subdomain
- All traffic proxied through Cloudflare (orange cloud enabled)

**TLS Encryption:**
- Mode: Full (Strict)
- Validates origin server certificates
- End-to-end encryption from visitor to origin
- Automatic HTTPS redirect enabled

**WAF Managed Rulesets:**
- Cloudflare Managed Ruleset enabled
- Protects against OWASP Top 10 vulnerabilities
- SQL injection attempts blocked automatically
- Test by visiting: `/admin?id=1' OR '1'='1`

**Rate Limiting:**
- Applied to `/login` path
- Limit: 5 requests per 10 seconds per IP
- Action: Block for 10 seconds
- Mitigates brute force login attacks
- Test by rapidly refreshing the login page

**Origin Protection:**
- Render default domain disabled at platform level
- All traffic must flow through Cloudflare
- Direct IP access prevented

## Part 2: Zero Trust

### Cloudflare Tunnel

Set up Cloudflare Tunnel to create a secure, encrypted connection between Cloudflare and the origin server. This eliminates the need for exposing public IP addresses and provides an additional layer of security.

**Configuration:**
- Tunnel name: grace-assessment-tunnel
- Subdomain: tunnel.tmgracee.online
- Note: Encountered configuration challenges during implementation

### Identity Provider

Configured One-Time PIN as the identity provider for authentication. This email-based authentication method works with any email address and does not require OAuth setup.

**Configuration:**
- Provider: One-Time PIN
- Free tier: Up to 50 users
- Authentication flow: Email → PIN code → Access granted

### Access Policy

Created an Access policy to protect the `/secure` path with identity-based authentication.

**Policy Details:**
- Protected path: `/secure`
- Allowed users:
  - My personal Gmail address
  - Any email ending with @cloudflare.com
- Session duration: 24 hours
- Action: Require authentication before access

**Testing:**
1. Visit https://tmgracee.online/secure in incognito mode
2. Cloudflare Access login page appears
3. Enter email address
4. Receive PIN code via email
5. Enter PIN to gain access

## Part 3: Developer Platform

### Cloudflare Worker

Created a serverless Worker that serves identity information for authenticated users and displays country flags from both R2 and D1 storage.

**Worker URL**: http://cf-worker.gracetm.workers.dev/

**Routes:**
- `GET /` - Homepage with navigation
- `GET /secure` - Identity information (requires authentication)
- `GET /flags/:country` - Flag image from R2 bucket
- `GET /flags-d1/:country` - Flag image from D1 database

**Identity Information Format:**
```
${EMAIL} authenticated at ${TIMESTAMP} from ${COUNTRY}
```
The country code is a clickable link that navigates to the flag endpoint.

### R2 Object Storage

I created an R2 bucket to store country flag images as binary objects.

**Configuration:**
- Bucket name: flags-bucket
- Contents: 255 PNG flag images (1000x1000px)
- Access: Private (Worker binding only)
- Binding name: FLAGS_BUCKET

**Implementation:**
```javascript
const flag = await env.FLAGS_BUCKET.get(`${country}.png`);
return new Response(flag.body, {
  headers: { 'Content-Type': 'image/png' }
});
```

### D1 Database

I created a D1 database to store flags as base64-encoded data in SQLite.

Note: Due to file size limitations, not all flags were able to be loaded and stored. Only 214/255 flags were successfully stored.

**Configuration:**
- Database name: flags-database
- Binding name: flags_database

**Schema:**
```sql
CREATE TABLE flags (
    country_code TEXT PRIMARY KEY,
    flag_data TEXT NOT NULL,
    content_type TEXT NOT NULL,
    uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**Data:**
- 214 flags successfully seeded
- Stored as base64-encoded strings
- Retrieved and decoded on-demand

**Implementation:**
```javascript
const result = await env.flags_database
  .prepare('SELECT flag_data FROM flags WHERE country_code = ?')
  .bind(country)
  .first();

const imageBuffer = Uint8Array.from(atob(result.flag_data), c => c.charCodeAt(0));
return new Response(imageBuffer, {
  headers: { 'Content-Type': 'image/png' }
});
```

## Local Development

### Prerequisites

- Node.js 18 or higher
- npm or yarn
- Wrangler CLI
- Cloudflare account

### Setup

```bash
# Clone repository
git clone <repository-url>
cd cloudflare-assessment

# Install dependencies
npm install

# Login to Cloudflare
npx wrangler login

# Run Worker locally
npx wrangler dev

# Deploy to production
npx wrangler deploy
```

### Environment Configuration

The Worker requires two bindings configured in `wrangler.jsonc`:

**R2 Bucket:**
```json
{
  "binding": "FLAGS_BUCKET",
  "bucket_name": "flags-bucket"
}
```

**D1 Database:**
```json
{
  "binding": "flags_database",
  "database_name": "flags-database",
  "database_id": "82ef7d8a-87df-4fce-ae40-1e7ba20a4018"
}
```

## Testing

### Application Services

**TLS Encryption:**
```
Visit: https://tmgracee.online
Verify: Browser shows secure padlock
Check: Certificate issued by Cloudflare
```

**WAF Protection:**
```
Visit: https://tmgracee.online/admin?id=1' OR '1'='1
Expected: Blocked by Cloudflare WAF
```

**Rate Limiting:**
```
Visit: https://tmgracee.online/login
Refresh 6+ times rapidly
Expected: Error 1015 (Rate Limited)
```

### Zero Trust

**Access Control:**
```
1. Open incognito window
2. Visit: https://tmgracee.online/secure
3. Expected: Login page appears
4. Enter email and PIN
5. Expected: Access granted
```

### Developer Platform

**R2 Flags:**
```
Visit: https://bold-pine-43c5.gracetm.workers.dev/flags/SG
Expected: Singapore flag image
```

**D1 Flags:**
```
Visit: https://bold-pine-43c5.gracetm.workers.dev/flags-d1/SG
Expected: Singapore flag image from database
```

## Challenges and Solutions

### D1 Database Seeding

**Challenge**: Windows command length limits prevented batch insertion of base64-encoded flags.

**Solution**: Created a PowerShell script (`seed-d1-flags.ps1`) to insert flags one at a time. Successfully seeded 214 out of 255 flags. The remaining 41 flags had file sizes that exceeded even single-command limits.

### Cloudflare Tunnel Configuration

**Challenge**: Encountered 403 Forbidden errors when attempting to access the tunnel endpoint.

**Solution**: Documented the tunnel setup process and infrastructure. The tunnel was successfully created and connected, though routing configuration presented challenges. This demonstrates understanding of the architecture even when facing implementation obstacles.

### Rate Limiting on Free Plan

**Challenge**: Free plan limits rate limiting periods to 10-second intervals.

**Solution**: Configured rule to work within plan constraints (5 requests per 10 seconds, block for 10 seconds). This actually provides a better demonstration as the rate limit triggers faster during testing.

## Key Learnings

Through this assessment, I gained hands-on experience with:

1. **DNS Management** - Configuring nameservers, CNAME records, and proxy settings
2. **TLS/SSL** - Implementing end-to-end encryption with certificate validation
3. **Web Application Firewall** - Configuring managed rulesets for OWASP protection
4. **Rate Limiting** - Creating rules to mitigate brute force attacks
5. **Zero Trust Security** - Implementing identity-based access control
6. **Serverless Computing** - Deploying Workers at the edge with sub-millisecond response times
7. **Edge Storage** - Using R2 for object storage and D1 for SQL databases
8. **CLI Tools** - Working with Wrangler for Worker development and deployment

## Use Cases

### Application Services
- E-commerce platforms protecting checkout pages from bots and DDoS attacks
- SaaS applications securing API endpoints with rate limiting and WAF
- Content delivery networks improving performance and reducing origin load

### Zero Trust
- Remote work environments securing access to internal tools without VPN
- Contractor access management with temporary, email-based authentication
- Compliance requirements with audit logs and session management

### Developer Platform
- Global applications deploying serverless functions at 200+ edge locations
- Media delivery storing and serving assets from edge storage
- Dynamic content generation based on user location and identity

## Resources

During this assessment, I filled knowledge gaps through:

- **Official Documentation**: Cloudflare Docs, Wrangler CLI documentation, R2 and D1 API references
- **Video Tutorials**: YouTube tutorials on Cloudflare Workers, Cloudflare TV technical sessions
- **Online Articles**: Blog posts about Zero Trust implementation, WAF configuration best practices
- **Structured Learning**: Udemy courses on Cloudflare fundamentals and Workers development

## Acknowledgements

Thank you to the Cloudflare team for providing this comprehensive assessment. It offered valuable hands-on experience with the platform and deepened my understanding of modern web infrastructure, security, and edge computing. I had a lot of fun completing this assignment and look forward to applying these skills in real-world projects :)