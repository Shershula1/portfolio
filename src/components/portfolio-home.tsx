"use client";

import { FormEvent, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FlipHorizontal2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { projects } from "@/data/projects";

export function PortfolioHome() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [mirrored, setMirrored] = useState(false);

  const results = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return projects;
    return projects.filter((project) => {
      const haystack = [project.title, project.date, ...project.keywords]
        .join(" ")
        .toLowerCase();
      return haystack.includes(needle);
    });
  }, [query]);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (results.length === 1) router.push(results[0].href);
  }

  return (
    <div className={mirrored ? "origin-center [transform:scaleX(-1)]" : undefined}>
      <main className="mx-auto flex min-h-dvh w-full max-w-5xl flex-col px-4 pt-16 pb-10 sm:px-6">
        <header className="mx-auto w-full max-w-xl text-center">
          <p className="text-sm text-muted-foreground">Даня Ретивых</p>
          <h1 className="mt-2 text-4xl font-medium tracking-tight sm:text-5xl">Портфолио</h1>
          <p className="mt-3 text-sm text-muted-foreground sm:text-base">
            Картинка, название и год. Нажмите на снимок — откроется сам проект.
          </p>
        </header>

        <form onSubmit={onSubmit} className="mx-auto mt-8 flex w-full max-w-xl flex-col gap-3 sm:flex-row">
          <label className="relative min-w-0 flex-1">
            <span className="sr-only">Поиск по проектам</span>
            <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Поиск по проектам"
              type="search"
              className="h-12 rounded-full bg-white pr-4 pl-11 text-base shadow-sm md:text-base"
            />
          </label>
          <Button
            type="button"
            variant="outline"
            aria-pressed={mirrored}
            onClick={() => setMirrored((value) => !value)}
            className="h-12 rounded-full px-4"
          >
            <FlipHorizontal2 />
            Зеркало
          </Button>
        </form>

        {results.length === 0 ? (
          <div className="mx-auto mt-16 max-w-md text-center">
            <p className="text-lg font-medium">Ничего не нашлось</p>
            <p className="mt-2 text-sm text-muted-foreground">
              В портфолио есть «комната» и «evernote».
            </p>
          </div>
        ) : (
          <ul className="mt-10 grid gap-8 sm:grid-cols-2">
            {results.map((project) => (
              <li key={project.slug}>
                <Link
                  href={project.href}
                  className="group block overflow-hidden rounded-2xl border border-[#dadce0] bg-white shadow-[0_1px_2px_rgba(60,64,67,0.12)] outline-none transition motion-safe:hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(60,64,67,0.16)] focus-visible:ring-3 focus-visible:ring-ring"
                >
                  <span className={`relative block aspect-[4/3] ${project.frameClass}`}>
                    <Image
                      src={project.image}
                      alt={project.imageAlt}
                      fill
                      sizes="(min-width: 640px) 480px, 100vw"
                      className="object-contain"
                    />
                  </span>
                  <span className="block px-4 py-3.5">
                    <span className="block text-lg font-medium tracking-tight text-[#202124]">
                      {project.title}
                    </span>
                    <time dateTime={project.date} className="mt-0.5 block text-sm text-[#70757a]">
                      {project.date}
                    </time>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}

        <footer className="mt-auto pt-16 text-center text-xs text-muted-foreground">
          Даня Ретивых
        </footer>
      </main>
    </div>
  );
}
