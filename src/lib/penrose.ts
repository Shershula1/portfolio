export type Vec = { x: number; y: number };

type LineWall = {
  id: string;
  kind: "line";
  a: Vec;
  b: Vec;
};

type ArcWall = {
  id: string;
  kind: "arc";
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  // Keep the hit only on this side of the ellipse. The other half is not a wall.
  accept: (point: Vec) => boolean;
};

type Wall = LineWall | ArcWall;

export type RayHit = {
  point: Vec;
  normal: Vec;
};

const TOP = { cx: 0, cy: -10, rx: 50, ry: 30 };
const BOTTOM = { cx: 0, cy: 10, rx: 50, ry: 30 };
const LEFT_STEM = { cx: -40, cy: 0, rx: 5, ry: 10 };
const RIGHT_STEM = { cx: 40, cy: 0, rx: 5, ry: 10 };

function line(id: string, x1: number, y1: number, x2: number, y2: number): LineWall {
  return { id, kind: "line", a: { x: x1, y: y1 }, b: { x: x2, y: y2 } };
}

const WALLS: Wall[] = [
  line("ul-v", -40, -10, -40, -2),
  line("ul-h", -40, -2, -50, -2),
  line("ul-o", -50, -2, -50, -10),
  {
    id: "top",
    kind: "arc",
    ...TOP,
    accept: (point) => point.y <= TOP.cy + 1e-6,
  },
  line("ur-o", 50, -10, 50, -2),
  line("ur-h", 50, -2, 40, -2),
  line("ur-v", 40, -2, 40, -10),
  {
    id: "right",
    kind: "arc",
    ...RIGHT_STEM,
    accept: (point) => point.x <= RIGHT_STEM.cx + 1e-6,
  },
  line("lr-v", 40, 10, 40, 2),
  line("lr-h", 40, 2, 50, 2),
  line("lr-o", 50, 2, 50, 10),
  {
    id: "bottom",
    kind: "arc",
    ...BOTTOM,
    accept: (point) => point.y >= BOTTOM.cy - 1e-6,
  },
  line("ll-o", -50, 10, -50, 2),
  line("ll-h", -50, 2, -40, 2),
  line("ll-v", -40, 2, -40, 10),
  {
    id: "left",
    kind: "arc",
    ...LEFT_STEM,
    accept: (point) => point.x >= LEFT_STEM.cx - 1e-6,
  },
];

function ellipsePoint(
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  angle: number,
): Vec {
  return {
    x: cx + rx * Math.cos(angle),
    y: cy + ry * Math.sin(angle),
  };
}

function sampleSweep(
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  from: number,
  to: number,
  steps: number,
): Vec[] {
  const points: Vec[] = [];
  for (let i = 0; i <= steps; i++) {
    const angle = from + ((to - from) * i) / steps;
    points.push(ellipsePoint(cx, cy, rx, ry, angle));
  }
  return points;
}

let boundaryCache: Vec[] | null = null;

export function boundaryPoints(): Vec[] {
  if (boundaryCache) return boundaryCache;
  const steps = 90;
  const points: Vec[] = [
    { x: -40, y: -10 },
    { x: -40, y: -2 },
    { x: -50, y: -2 },
    { x: -50, y: -10 },
    ...sampleSweep(TOP.cx, TOP.cy, TOP.rx, TOP.ry, Math.PI, Math.PI * 2, steps).slice(1),
    { x: 50, y: -2 },
    { x: 40, y: -2 },
    { x: 40, y: -10 },
    ...sampleSweep(
      RIGHT_STEM.cx,
      RIGHT_STEM.cy,
      RIGHT_STEM.rx,
      RIGHT_STEM.ry,
      Math.PI * 1.5,
      Math.PI / 2,
      24,
    ).slice(1),
    { x: 40, y: 2 },
    { x: 50, y: 2 },
    { x: 50, y: 10 },
    ...sampleSweep(BOTTOM.cx, BOTTOM.cy, BOTTOM.rx, BOTTOM.ry, 0, Math.PI, steps).slice(1),
    { x: -50, y: 2 },
    { x: -40, y: 2 },
    { x: -40, y: 10 },
    ...sampleSweep(
      LEFT_STEM.cx,
      LEFT_STEM.cy,
      LEFT_STEM.rx,
      LEFT_STEM.ry,
      Math.PI / 2,
      -Math.PI / 2,
      24,
    ).slice(1, -1),
  ];
  boundaryCache = points;
  return points;
}

export function boundaryPathD(): string {
  return (
    boundaryPoints()
      .map((point, index) => `${index === 0 ? "M" : "L"}${point.x.toFixed(2)} ${point.y.toFixed(2)}`)
      .join(" ") + " Z"
  );
}

export function isInside(point: Vec): boolean {
  const polygon = boundaryPoints();
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const a = polygon[j];
    const b = polygon[i];
    const crosses = a.y > point.y !== b.y > point.y;
    if (!crosses) continue;
    const xAtY = ((b.x - a.x) * (point.y - a.y)) / (b.y - a.y) + a.x;
    if (point.x < xAtY) inside = !inside;
  }
  return inside;
}

function dot(a: Vec, b: Vec): number {
  return a.x * b.x + a.y * b.y;
}

function length(v: Vec): number {
  return Math.hypot(v.x, v.y);
}

function normalize(v: Vec): Vec {
  const len = length(v) || 1;
  return { x: v.x / len, y: v.y / len };
}

function reflect(direction: Vec, normal: Vec): Vec {
  let n = normalize(normal);
  if (dot(n, direction) > 0) n = { x: -n.x, y: -n.y };
  const amount = dot(direction, n);
  return normalize({
    x: direction.x - 2 * amount * n.x,
    y: direction.y - 2 * amount * n.y,
  });
}

type Hit = {
  t: number;
  point: Vec;
  normal: Vec;
  id: string;
};

function rayLine(origin: Vec, direction: Vec, wall: LineWall): Hit | null {
  const vx = wall.b.x - wall.a.x;
  const vy = wall.b.y - wall.a.y;
  const denom = direction.x * vy - direction.y * vx;
  if (Math.abs(denom) < 1e-10) return null;
  const wx = wall.a.x - origin.x;
  const wy = wall.a.y - origin.y;
  const t = (wx * vy - wy * vx) / denom;
  const u = (wx * direction.y - wy * direction.x) / denom;
  if (t <= 1e-3 || u < -1e-4 || u > 1 + 1e-4) return null;
  return {
    t,
    point: { x: origin.x + direction.x * t, y: origin.y + direction.y * t },
    normal: { x: -vy, y: vx },
    id: wall.id,
  };
}

function rayArc(origin: Vec, direction: Vec, wall: ArcWall): Hit | null {
  const ox = origin.x - wall.cx;
  const oy = origin.y - wall.cy;
  const a =
    (direction.x * direction.x) / (wall.rx * wall.rx) +
    (direction.y * direction.y) / (wall.ry * wall.ry);
  const b =
    2 *
    ((ox * direction.x) / (wall.rx * wall.rx) + (oy * direction.y) / (wall.ry * wall.ry));
  const c = (ox * ox) / (wall.rx * wall.rx) + (oy * oy) / (wall.ry * wall.ry) - 1;
  const disc = b * b - 4 * a * c;
  if (disc < 0 || Math.abs(a) < 1e-12) return null;
  const root = Math.sqrt(disc);
  const candidates = [(-b - root) / (2 * a), (-b + root) / (2 * a)];
  let best: Hit | null = null;
  for (const t of candidates) {
    if (t <= 1e-3) continue;
    const point = { x: origin.x + direction.x * t, y: origin.y + direction.y * t };
    if (!wall.accept(point)) continue;
    const normal = {
      x: (point.x - wall.cx) / (wall.rx * wall.rx),
      y: (point.y - wall.cy) / (wall.ry * wall.ry),
    };
    if (!best || t < best.t) best = { t, point, normal, id: wall.id };
  }
  return best;
}

function nearestHit(origin: Vec, direction: Vec, skipId?: string): Hit | null {
  let best: Hit | null = null;
  for (const wall of WALLS) {
    const hit = wall.kind === "line" ? rayLine(origin, direction, wall) : rayArc(origin, direction, wall);
    if (!hit) continue;
    if (skipId && hit.id === skipId && hit.t < 0.12) continue;
    if (!best || hit.t < best.t) best = hit;
  }
  return best;
}

export function traceRay(origin: Vec, direction: Vec, maxBounces = 28): Vec[] {
  const points: Vec[] = [{ x: origin.x, y: origin.y }];
  let position = origin;
  let dir = normalize(direction);
  let skipId: string | undefined;
  for (let bounce = 0; bounce < maxBounces; bounce++) {
    const hit = nearestHit(position, dir, skipId);
    if (!hit || hit.t > 400) break;
    points.push(hit.point);
    dir = reflect(dir, hit.normal);
    skipId = hit.id;
    position = {
      x: hit.point.x + dir.x * 0.04,
      y: hit.point.y + dir.y * 0.04,
    };
  }
  return points;
}

export function traceAll(origin: Vec, count: number, maxBounces = 28): Vec[][] {
  const rays: Vec[][] = [];
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2;
    rays.push(traceRay(origin, { x: Math.cos(angle), y: Math.sin(angle) }, maxBounces));
  }
  return rays;
}

export type RoomRegion = "upper-side" | "upper-center" | "lower-side" | "lower-center" | "corridor";

export function classify(point: Vec): RoomRegion {
  if (point.y < -10) return Math.abs(point.x) > 40 ? "upper-side" : "upper-center";
  if (point.y > 10) return Math.abs(point.x) > 40 ? "lower-side" : "lower-center";
  if (Math.abs(point.x) > 40) return point.y < 0 ? "upper-side" : "lower-side";
  return "corridor";
}

export const REGION_COPY: Record<RoomRegion, { title: string; body: string }> = {
  "upper-side": {
    title: "Верхний карман",
    body: "Свет остаётся в верхней половине. До нижних стен он не доходит: луч между фокусом и краем эллипса не пересекает середину оси.",
  },
  "upper-center": {
    title: "Верхний центр",
    body: "Верхняя половина и середина снизу загораются. Нижние карманы за изгибами остаются тёмными.",
  },
  "lower-side": {
    title: "Нижний карман",
    body: "Свет заперт в нижней половине. Верхняя часть комнаты его не видит.",
  },
  "lower-center": {
    title: "Нижний центр",
    body: "Нижняя и верхняя середина освещены. Боковые карманы за изгибами стен — нет.",
  },
  corridor: {
    title: "Коридор",
    body: "Отсюда свет проходит в обе половины через промежуток между фокусами, но в карманы не заворачивает.",
  },
};

export const LAMP_PRESETS: { id: string; label: string; at: Vec }[] = [
  { id: "upper", label: "Верх", at: { x: 0, y: -24 } },
  { id: "center", label: "Центр", at: { x: 0, y: 0 } },
  { id: "pocket", label: "Левый карман", at: { x: -45, y: -6 } },
];

export function fractionIn(
  origin: Vec,
  forbidden: (point: Vec) => boolean,
  rays = 120,
  bounces = 24,
): number {
  let bad = 0;
  let total = 0;
  for (const ray of traceAll(origin, rays, bounces)) {
    for (let i = 1; i < ray.length; i++) {
      const a = ray[i - 1];
      const b = ray[i];
      for (let step = 0; step <= 6; step++) {
        const t = step / 6;
        const point = { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
        if (!isInside(point)) continue;
        total += 1;
        if (forbidden(point)) bad += 1;
      }
    }
  }
  return total === 0 ? 1 : bad / total;
}
