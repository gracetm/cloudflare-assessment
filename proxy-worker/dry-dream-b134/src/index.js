/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    // the Render origin server URL
    const ORIGIN = "https://cloudflare-assessment.onrender.com";
    
    // build the new URL pointing to the Render server
    const originUrl = ORIGIN + url.pathname + url.search;
    
    // forward the request to Render
    const originRequest = new Request(originUrl, {
      method: request.method,
      headers: request.headers,
      body: request.body
    });
    
    const response = await fetch(originRequest);
    
    // return the response back to the visitor
    return response;
  }
};