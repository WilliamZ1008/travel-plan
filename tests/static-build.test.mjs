import assert from "node:assert/strict";
import { access, readFile, readdir } from "node:fs/promises";
import test from "node:test";

test("builds a CloudBase-compatible static website", async () => {
  const html = await readFile(
    new URL("../dist/index.html", import.meta.url),
    "utf8",
  );
  const assets = await readdir(new URL("../dist/assets/", import.meta.url));

  assert.match(html, /<div id="root"><\/div>/);
  assert.match(html, /漫行 MANXING/);
  assert.match(html, /\.\/assets\/.*\.js/);
  assert.ok(assets.some((file) => file.endsWith(".js")));
  assert.ok(assets.some((file) => file.endsWith(".css")));
  assert.doesNotMatch(html, /\/api\/trip/);
  assert.doesNotMatch(html, /_next|vinext|cloudflare/i);

  await Promise.all([
    access(new URL("../dist/favicon.svg", import.meta.url)),
    access(new URL("../dist/manifest.webmanifest", import.meta.url)),
    access(new URL("../dist/og.png", import.meta.url)),
    access(new URL("../dist/beijing-map-art.jpg", import.meta.url)),
  ]);
});

test("ships the Beijing itinerary and CloudBase persistence", async () => {
  const [planner, storage] = await Promise.all([
    readFile(new URL("../src/TripPlanner.tsx", import.meta.url), "utf8"),
    readFile(new URL("../src/lib/trip-storage.ts", import.meta.url), "utf8"),
  ]);

  assert.match(planner, /周文龙/);
  assert.match(planner, /吴志宏/);
  assert.match(planner, /中国国家博物馆/);
  assert.match(planner, /故宫博物院/);
  assert.match(storage, /travel_plans/);
  assert.match(storage, /\.watch\(/);
  assert.match(planner, /removeItem/);
  assert.match(planner, /removeExpense/);
  assert.match(planner, /toggleBudgetVisibility/);
  assert.match(
    planner,
    /https:\/\/wia\.amap\.com\/#\/map\?orgId=10017639980195568214&workMapId=1763998222564620/,
  );
  assert.doesNotMatch(planner, /\/api\/trip/);
});
