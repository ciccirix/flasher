# 13:37 Flasher

Web installer (one-click, from the browser) for **T-Watch Ultra (13:37)**, **Marauder C5 (koko)** and **generic ESP32**. Built on [ESP Web Tools](https://esphome.github.io/esp-web-tools/). Needs desktop **Chrome/Edge** (Web Serial) and **HTTPS** (GitHub Pages provides it).

## Layout
```
flasher/
  index.html            the page (device picker + install + live map)
  manifests/            one manifest per device (chipFamily + bin path)
    twatch.json   → firmware/1337-vXX.bin   (ESP32-S3)
    c5.json       → firmware/koko-c5-v9.bin (ESP32-C5)
    esp32.json    → firmware/esp32.bin      (ESP32)
  firmware/             the merged .bin files (flashed at offset 0)
  worker/worker.js      optional Cloudflare Worker: live counter + visitor map
```

## Publish on GitHub Pages
1. Put this `flasher/` content in a repo (or a `docs/` folder / `gh-pages` branch).
2. Repo → Settings → Pages → Source = that branch/folder.
3. Open `https://<user>.github.io/<repo>/`.

## Add / update firmware
Each device flashes a **merged** image at `0x0`. Build it with:
```
python -m esptool --chip <esp32s3|esp32c5|esp32> merge-bin -o firmware/<name>.bin \
  --flash-size 16MB 0x0 bootloader.bin 0x8000 partitions.bin \
  0xe000 boot_app0.bin 0x10000 firmware.bin
```
Then point the matching `manifests/*.json` at it and bump its `version`.
**Rename the bin on every release** (e.g. `1337-v18.bin`) so browsers don't serve a cached old one.

## Live counter + visitor map (optional, real numbers only)
Out of the box the counter shows `—` (no fake numbers); the "you are here" pin
works via a free IP lookup. For a **real global counter + a dot for every
visitor**, deploy `worker/worker.js` (free Cloudflare Worker, ~5 min — steps in
that file) and paste its URL into `index.html`:
```js
const STATS_API = "https://<name>.<you>.workers.dev/hit";
```

## Notes
- **ESP32-C5** is new — web-flashing it depends on esptool-js support; if it
  fails, flash the C5 with the `esptool` CLI instead.
- Only for hardware you own or are authorized to flash.
