import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

test("contains the finished travel planner product surface", async () => {
  const planner = await readFile(
    new URL("../app/TripPlanner.tsx", import.meta.url),
    "utf8",
  );

  assert.match(planner, /漫行/);
  assert.match(planner, /去闽南/);
  assert.match(planner, /厦门 · 泉州/);
  assert.match(planner, /旅程首页/);
  assert.match(planner, /每日行程/);
  assert.match(planner, /共同预算/);
  assert.match(planner, /\/api\/trip/);
  assert.match(planner, /mobile-nav/);
});

test("ships product metadata and removes the starter preview", async () => {
  const [layout, page, packageJson] = await Promise.all([
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
  ]);

  assert.match(layout, /漫行 MANXING/);
  assert.match(layout, /og\.png/);
  assert.match(page, /TripPlanner/);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);
  await access(new URL("../public/og.png", import.meta.url));
});
