# Live counter + visitor map — Cloudflare Worker (free)

Turns the "—" counter into a **real** total, and drops a dot on the map for
every visitor. Cloudflare provides the visitor geo for free (`request.cf`), so
no external API and no keys. Only a coarse, rounded (≈city) lat/lon is stored —
never the IP.

## Deploy (once, ~3 min)

```bash
npm i -g wrangler          # or use: npx wrangler <cmd>
cd flasher/worker
wrangler login             # opens your browser → your Cloudflare account

wrangler kv namespace create STATS
# → prints:  id = "abc123..."   ← paste that id into wrangler.toml (kv_namespaces)

wrangler deploy
# → prints:  https://ciccirix-flasher-stats.<you>.workers.dev
```

## Wire it into the page
In `flasher/index.html` set:
```js
const STATS_API = "https://ciccirix-flasher-stats.<you>.workers.dev/hit";
```
Commit + push → the counter goes live and the map fills with visitor dots.

## Dashboard alternative (no CLI)
Workers & Pages → Create Worker → paste `worker.js` → Settings → Variables → KV
Namespace Bindings: `STATS` → a namespace you create in Storage → KV. Deploy,
copy the `*.workers.dev` URL, use it (with `/hit`) as `STATS_API`.

## Endpoint
`GET /hit` → increments + records, returns `{ "count": N, "points": [[lat,lon],…] }`.
Any other path just reads current stats without counting.
