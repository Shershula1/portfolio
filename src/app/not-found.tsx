import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid min-h-dvh place-items-center px-6 text-center">
      <div>
        <p className="text-sm text-muted-foreground">404</p>
        <h1 className="mt-2 text-3xl font-medium tracking-tight">Такой страницы нет</h1>
        <p className="mt-2 text-muted-foreground">В портфолио две работы: комната и заметки.</p>
        <Link href="/" className="mt-6 inline-block text-sm underline underline-offset-4">
          На главную
        </Link>
      </div>
    </main>
  );
}
