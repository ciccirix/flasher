// 13:37 Flasher — live counter + visitor dot-map backend (Cloudflare Worker, free tier).
//
// Cloudflare hands us the visitor's approximate geo for free (request.cf.*),
// so no external IP-geo API and no keys. GET /hit increments the counter and
// records a rounded (city-level) point; any other path just reads current stats.
// Returns: { "count": <int>, "points": [[lat,lon], ...] }
//
// Deploy (once, ~5 min):
//   1) Cloudflare dashboard → Workers & Pages → Create Worker → paste this.
//   2) Storage → KV → create a namespace (e.g. "STATS").
//   3) Worker → Settings → Variables → KV Namespace Bindings:
//        Variable name: STATS   →   your KV namespace.
//   4) Deploy. Copy the https://<name>.<you>.workers.dev URL.
//   5) In flasher/index.html set:  const STATS_API = "https://<name>.<you>.workers.dev/hit";
//
// Privacy: only a coarse, rounded lat/lon (≈city) is stored — never the IP.

export default {
  async fetch(request, env) {
    const cors = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "content-type": "application/json; charset=utf-8",
    };
    if (request.method === "OPTIONS") return new Response(null, { headers: cors });

    const url = new URL(request.url);
    let count = parseInt((await env.STATS.get("count")) || "0", 10);
    let points = JSON.parse((await env.STATS.get("points")) || "[]");

    if (url.pathname.endsWith("/hit")) {
      count++;
      const cf = request.cf || {};
      const lat = cf.latitude != null ? Math.round(parseFloat(cf.latitude) * 100) / 100 : null;
      const lon = cf.longitude != null ? Math.round(parseFloat(cf.longitude) * 100) / 100 : null;
      if (lat != null && lon != null && !Number.isNaN(lat) && !Number.isNaN(lon)) {
        points.push([lat, lon]);
        if (points.length > 800) points = points.slice(-800);   // cap history
        await env.STATS.put("points", JSON.stringify(points));
      }
      await env.STATS.put("count", String(count));
    }

    return new Response(JSON.stringify({ count, points }), { headers: cors });
  },
};
