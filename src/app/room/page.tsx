import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { RoomLab } from "@/components/room-lab";

export const metadata: Metadata = {
  title: "Неосвещаемая комната",
  description:
    "Зеркальная комната Пенроуза. Лампу можно поставить где угодно — часть комнаты всё равно остаётся тёмной.",
};

export default function RoomPage() {
  return (
    <div className="min-h-dvh">
      <header className="border-b">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            Портфолио
          </Link>
          <time dateTime="2026" className="text-sm text-muted-foreground">
            2026
          </time>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="max-w-2xl">
          <h1 className="text-3xl font-medium tracking-tight">Неосвещаемая комната</h1>
          <p className="mt-3 text-muted-foreground">
            Комната Пенроуза из эллиптических зеркал. Переставьте лампу — тёмное место находится всегда.
          </p>
        </div>
        <div className="mt-8">
          <RoomLab />
        </div>
      </main>
    </div>
  );
}
