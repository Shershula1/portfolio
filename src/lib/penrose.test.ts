import assert from "node:assert/strict";
import { test } from "node:test";
import { classify, fractionIn, isInside, traceRay } from "./penrose";

test("room contains the corridor, bulbs, and pockets", () => {
  assert.equal(isInside({ x: 0, y: 0 }), true);
  assert.equal(isInside({ x: 0, y: -30 }), true);
  assert.equal(isInside({ x: 0, y: 30 }), true);
  assert.equal(isInside({ x: 45, y: -6 }), true);
  assert.equal(isInside({ x: -45, y: 6 }), true);
  assert.equal(isInside({ x: 34, y: 0 }), true);
});

test("room excludes the space outside the mirrors", () => {
  assert.equal(isInside({ x: 48, y: 0 }), false);
  assert.equal(isInside({ x: 0, y: 46 }), false);
  assert.equal(isInside({ x: 70, y: 0 }), false);
  assert.equal(isInside({ x: 36, y: 0 }), false);
});

test("a ray in the corridor hits the inner stem and comes back", () => {
  const ray = traceRay({ x: 0, y: 0 }, { x: 1, y: 0 }, 2);
  assert.ok(ray.length >= 2);
  assert.ok(Math.abs(ray[1].y) < 0.5, `hit y ${ray[1].y}`);
  assert.ok(ray[1].x > 30 && ray[1].x < 40, `hit x ${ray[1].x}`);
  assert.ok(ray.length >= 3);
  assert.ok(ray[2].x < ray[1].x);
});

test("light in the center leaves the side pockets dark", () => {
  const leak = fractionIn({ x: 0, y: 0 }, (point) => Math.abs(point.x) > 41.5);
  assert.ok(leak < 0.02, `center leak ${leak}`);
});

test("light in the upper center leaves the lower pockets dark", () => {
  const leak = fractionIn({ x: 0, y: -24 }, (point) => Math.abs(point.x) > 41.5 && point.y > 2);
  assert.ok(leak < 0.02, `upper leak ${leak}`);
});

test("light in the upper center still reaches the lower bulb", () => {
  const reached = fractionIn({ x: 0, y: -24 }, (point) => point.y > 18 && Math.abs(point.x) < 15);
  assert.ok(reached > 0.01, `lower bulb coverage ${reached}`);
});

test("light in the left pocket never reaches the lower half", () => {
  const leak = fractionIn({ x: -45, y: -6 }, (point) => point.y > 1);
  assert.ok(leak < 0.02, `pocket leak ${leak}`);
});

test("light in the left pocket still reaches the opposite upper pocket", () => {
  const reached = fractionIn(
    { x: -45, y: -6 },
    (point) => point.x > 42 && point.y < -12,
  );
  assert.ok(reached > 0.01, `opposite pocket coverage ${reached}`);
});

test("classify matches the three classic placements", () => {
  assert.equal(classify({ x: 0, y: -24 }), "upper-center");
  assert.equal(classify({ x: 0, y: 0 }), "corridor");
  assert.equal(classify({ x: -45, y: -6 }), "upper-side");
  assert.equal(classify({ x: 45, y: 6 }), "lower-side");
});
