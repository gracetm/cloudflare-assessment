# cloudflare-assessment
Cloudflare Associate Solutions Engineer - Take Home Assessment 2026

==
# Part 1: Application Services
1. Host your own origin web server: Render.com chosen
2. Create your own web application & provide access via your domain: https://cloudflare-assessment.onrender.com/
3. Proxy traffic to this server through Cloudflare: Used wrangler (Cloudflare worker) to proxy traffic (https://proxy-worker.gracetm.workers.dev/)
- Current Flow: User → Cloudflare Worker → Render
4. Secure the communication with TLS: Full (Strict) encryption mode is recommended as it ensures end-to-end encryption and validates the origin server’s certificate, preventing man-in-the-middle attacks. For any customers handling sensitive data, such as those in BFSI or government sectors, this is non-negotiable.
- In this scenario, since a Worker is already in use, TLS has already been implemented as Worker uses HTTPS. The system is effectively running on a Full (Strict)-equivalent behaviour, even if the feature was not toggled on a dashboard.
- For non-Worker set-up / personal domain, referenced resource: https://dev.to/freedom-coder/how-to-set-up-tls-on-cloudflare-a-step-by-step-guide-2p1g
5. Turn on Cloudflare Managed Rulesets: Navigating to Security -> Settings -> Cloudflare Managed Ruleset, we see that it is on/activated by default. 
Cloudflare managed ruleset: Created and maintained by Cloudflare, this ruleset provides fast and effective protection for all of the client's applications. Cloudflare recommends that clients enable the rules whose tags correspond to their technology stack.

==
updated step 3 & 4:
3. Proxy traffic to this server through Cloudflare: Trid to use no-ip to create a new and unique free domain (cfaseassessment.ddns.net). Then added this as a new domain in Cloudflare, selecting the Free tier. However, as the free domain "ddns.net" is owned and managed by no-ip, I was unable to replace the current nameservers with Cloudflare nameservers to activate Cloudflare for the manual set-up of TLS encryption.


==
