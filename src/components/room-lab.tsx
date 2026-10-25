"use client";

import { PointerEvent, useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  boundaryPoints,
  classify,
  isInside,
  traceAll,
  type RoomRegion,
  type Vec,
} from "@/lib/penrose";

const PRESETS: { id: string; label: string; at: Vec }[] = [
  { id: "photo", label: "Как на снимке", at: { x: -10, y: 0 } },
  { id: "center", label: "Центр", at: { x: 0, y: 0 } },
  { id: "pocket", label: "Нижний карман", at: { x: -45, y: -6 } },
];

const COPY: Record<RoomRegion, { title: string; body: string }> = {
  corridor: {
    title: "Центр",
    body: "Овал залит лучами. Карманы сверху и снизу остаются тёмными — одна лампа не достаёт до всей комнаты.",
  },
  "upper-center": {
    title: "Середина",
    body: "Свет заполняет середину овала. Крайние карманы всё равно не освещаются целиком.",
  },
  "lower-center": {
    title: "Середина",
    body: "Свет заполняет середину овала. Крайние карманы всё равно не освещаются целиком.",
  },
  "upper-side": {
    title: "Карман",
    body: "Лампа в кармане. До противоположной половины комнаты лучи не доходят.",
  },
  "lower-side": {
    title: "Карман",
    body: "Лампа в кармане. До противоположной половины комнаты лучи не доходят.",
  },
};

type Layout = { cx: number; cy: number; scale: number };

function toScreen(point: Vec, layout: Layout) {
  return {
    x: layout.cx + point.y * layout.scale,
    y: layout.cy - point.x * layout.scale,
  };
}

function toMath(x: number, y: number, layout: Layout): Vec {
  return {
    x: (layout.cy - y) / layout.scale,
    y: (x - layout.cx) / layout.scale,
  };
}

export function RoomLab() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const layoutRef = useRef<Layout>({ cx: 0, cy: 0, scale: 1 });
  const dragging = useRef(false);
  const [lamp, setLamp] = useState<Vec>(PRESETS[0].at);
  const [showFoci, setShowFoci] = useState(false);
  const lampRef = useRef(lamp);
  const fociRef = useRef(showFoci);
  lampRef.current = lamp;
  fociRef.current = showFoci;

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    if (width < 2 || height < 2) return;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const pad = 28;
    const scale = Math.min((width - pad * 2) / 92, (height - pad * 2) / 112);
    const layout = { cx: width / 2, cy: height / 2, scale };
    layoutRef.current = layout;

    ctx.fillStyle = "#050505";
    ctx.fillRect(0, 0, width, height);

    const points = boundaryPoints();
    const trace = (path: Path2D) => {
      points.forEach((point, index) => {
        const screen = toScreen(point, layout);
        if (index === 0) path.moveTo(screen.x, screen.y);
        else path.lineTo(screen.x, screen.y);
      });
      path.closePath();
    };

    const clip = new Path2D();
    trace(clip);
    ctx.save();
    ctx.clip(clip);
    ctx.globalCompositeOperation = "lighter";
    ctx.strokeStyle = "rgba(255, 226, 40, 0.42)";
    ctx.lineWidth = 1.05;
    for (const ray of traceAll(lampRef.current, 200, 28)) {
      ctx.beginPath();
      ray.forEach((point, index) => {
        const screen = toScreen(point, layout);
        if (index === 0) ctx.moveTo(screen.x, screen.y);
        else ctx.lineTo(screen.x, screen.y);
      });
      ctx.stroke();
    }
    ctx.restore();

    const wall = new Path2D();
    trace(wall);
    ctx.strokeStyle = "rgba(214, 222, 232, 0.95)";
    ctx.lineWidth = 1.6;
    ctx.stroke(wall);

    if (fociRef.current) {
      const foci = [
        { x: -40, y: -10 },
        { x: 40, y: -10 },
        { x: -40, y: 10 },
        { x: 40, y: 10 },
      ];
      ctx.strokeStyle = "#d38bff";
      ctx.lineWidth = 1.4;
      for (const focus of foci) {
        const screen = toScreen(focus, layout);
        ctx.beginPath();
        ctx.moveTo(screen.x - 6, screen.y);
        ctx.lineTo(screen.x + 6, screen.y);
        ctx.moveTo(screen.x, screen.y - 6);
        ctx.lineTo(screen.x, screen.y + 6);
        ctx.stroke();
      }
    }

    const spot = toScreen(lampRef.current, layout);
    const glow = ctx.createRadialGradient(spot.x, spot.y, 0, spot.x, spot.y, 16);
    glow.addColorStop(0, "rgba(255, 250, 220, 0.95)");
    glow.addColorStop(1, "rgba(255, 220, 60, 0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(spot.x, spot.y, 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#fffceb";
    ctx.beginPath();
    ctx.arc(spot.x, spot.y, 2.4, 0, Math.PI * 2);
    ctx.fill();
  }, []);

  useEffect(() => {
    draw();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const observer = new ResizeObserver(() => draw());
    observer.observe(canvas);
    return () => observer.disconnect();
  }, [draw, lamp, showFoci]);

  function place(event: PointerEvent<HTMLCanvasElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const point = toMath(event.clientX - rect.left, event.clientY - rect.top, layoutRef.current);
    if (!isInside(point)) return;
    setLamp(point);
  }

  function nudge(dx: number, dy: number) {
    const next = { x: lamp.x + dx, y: lamp.y + dy };
    if (isInside(next)) setLamp(next);
  }

  const activePreset = PRESETS.find(
    (preset) => Math.hypot(preset.at.x - lamp.x, preset.at.y - lamp.y) < 0.8,
  )?.id;
  const copy = COPY[classify(lamp)];

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
      <div>
        <canvas
          ref={canvasRef}
          tabIndex={0}
          aria-label="Неосвещаемая комната. Кликните, чтобы переставить лампу. Стрелки сдвигают её."
          onPointerDown={(event) => {
            const rect = event.currentTarget.getBoundingClientRect();
            const point = toMath(
              event.clientX - rect.left,
              event.clientY - rect.top,
              layoutRef.current,
            );
            if (!isInside(point)) return;
            dragging.current = true;
            event.currentTarget.setPointerCapture(event.pointerId);
            setLamp(point);
          }}
          onPointerMove={(event) => {
            if (!dragging.current) return;
            place(event);
          }}
          onPointerUp={() => {
            dragging.current = false;
          }}
          onPointerCancel={() => {
            dragging.current = false;
          }}
          onKeyDown={(event) => {
            const step = event.shiftKey ? 4 : 1.5;
            if (event.key === "ArrowUp") {
              event.preventDefault();
              nudge(step, 0);
            } else if (event.key === "ArrowDown") {
              event.preventDefault();
              nudge(-step, 0);
            } else if (event.key === "ArrowLeft") {
              event.preventDefault();
              nudge(0, -step);
            } else if (event.key === "ArrowRight") {
              event.preventDefault();
              nudge(0, step);
            }
          }}
          className="aspect-[1234/958] w-full touch-none rounded-2xl bg-black outline-none focus-visible:ring-3 focus-visible:ring-ring"
        />
        <p className="mt-2 text-sm text-muted-foreground">
          Кликните внутри комнаты или перетащите лампу. Стрелки на клавиатуре двигают её, когда сцена в фокусе.
        </p>
      </div>
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((preset) => (
            <Button
              key={preset.id}
              type="button"
              size="sm"
              variant={activePreset === preset.id ? "default" : "outline"}
              onClick={() => setLamp(preset.at)}
            >
              {preset.label}
            </Button>
          ))}
        </div>
        <Button
          type="button"
          size="sm"
          variant={showFoci ? "default" : "outline"}
          aria-pressed={showFoci}
          onClick={() => setShowFoci((value) => !value)}
        >
          Фокусы
        </Button>
        <div className="rounded-2xl border p-4">
          <h2 className="font-medium">{copy.title}</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{copy.body}</p>
        </div>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Стены — зеркала. Это лучевая модель: свет идёт прямыми и отражается. Волны здесь не считаются, поэтому тень такая резкая.
        </p>
      </div>
    </div>
  );
}

