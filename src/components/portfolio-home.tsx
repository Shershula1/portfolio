"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CertificatesSection } from "@/components/certificates-section";
import { projects } from "@/data/projects";

const cardClass =
  "group block overflow-hidden rounded-2xl border border-[#dadce0] bg-white shadow-[0_1px_2px_rgba(60,64,67,0.12)] outline-none transition motion-safe:hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(60,64,67,0.16)] focus-visible:ring-3 focus-visible:ring-ring";

export function PortfolioHome() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [mirrored, setMirrored] = useState(false);

  const results = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return projects;
    return projects.filter((project) => {
      const haystack = [project.title, project.date, ...project.keywords].join(" ").toLowerCase();
      return haystack.includes(needle);
    });
  }, [query]);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (results.length !== 1) return;
    const href = results[0].href;
    if (href.startsWith("http")) window.location.assign(href);
    else router.push(href);
  }

  return (
    <div className={mirrored ? "origin-center [transform:scaleX(-1)]" : undefined}>
      <main className="mx-auto flex min-h-dvh w-full max-w-5xl flex-col px-4 pt-16 pb-10 sm:px-6">
        <header className="mx-auto w-full max-w-xl text-center">
          <p className="text-sm text-muted-foreground">Даня Ретивых</p>
          <h1 className="mt-2 text-4xl font-medium tracking-tight sm:text-5xl">Портфолио</h1>
          <p className="mt-3 text-sm text-muted-foreground sm:text-base">
            Сайты и грамоты. На карточке снимок, подпись и дата.
          </p>
        </header>
        <nav className="mx-auto mt-6 flex justify-center gap-2 text-sm" aria-label="Разделы">
          <a href="#sites" className="rounded-full border bg-white px-4 py-1.5 hover:bg-muted">
            Сайты
          </a>
          <a href="#certificates" className="rounded-full border bg-white px-4 py-1.5 hover:bg-muted">
            Грамоты
          </a>
        </nav>

        <form onSubmit={onSubmit} className="mx-auto mt-8 flex w-full max-w-xl flex-col gap-3 sm:flex-row">
          <label className="relative min-w-0 flex-1">
            <span className="sr-only">Поиск</span>
            <SearchIcon />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Поиск"
              type="search"
              className="h-12 w-full rounded-full border border-input bg-white pr-4 pl-11 text-base shadow-sm outline-none focus-visible:ring-3 focus-visible:ring-ring"
            />
          </label>
          <button
            type="button"
            aria-pressed={mirrored}
            onClick={() => setMirrored((value) => !value)}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-full border bg-white px-4 text-sm font-medium shadow-sm outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring"
          >
            <FlipIcon />
            Зеркало
          </button>
        </form>

        <section id="sites" className="mt-10 scroll-mt-8">
          <h2 className="text-2xl font-medium tracking-tight">Сайты</h2>
          {results.length === 0 ? (
            <div className="mt-8 rounded-2xl border border-dashed px-6 py-12 text-center">
              <p className="text-lg font-medium">В сайтах ничего не нашлось</p>
              <p className="mt-2 text-sm text-muted-foreground">Есть «комната» и «evernote».</p>
            </div>
          ) : (
            <ul className="mt-8 grid gap-8 sm:grid-cols-2">
              {results.map((project, index) => {
                const external = project.href.startsWith("http");
                const card = (
                  <>
                    <span className={`block aspect-[4/3] ${project.frameClass}`}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={project.image}
                        alt={project.imageAlt}
                        width={project.imageWidth}
                        height={project.imageHeight}
                        fetchPriority={index === 0 ? "high" : "auto"}
                        decoding="async"
                        className="h-full w-full object-contain"
                      />
                    </span>
                    <span className="block px-4 py-3.5">
                      <span className="block text-lg font-medium tracking-tight text-[#202124]">{project.title}</span>
                      <time dateTime={project.dateTime} className="mt-0.5 block text-sm text-[#70757a]">
                        {project.date}
                      </time>
                    </span>
                  </>
                );
                return (
                  <li key={project.slug}>
                    {external ? (
                      <a href={project.href} className={cardClass}>
                        {card}
                      </a>
                    ) : (
                      <Link href={project.href} className={cardClass}>
                        {card}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <CertificatesSection query={query} />

        <footer className="mt-auto pt-16 text-center text-xs text-muted-foreground">Даня Ретивых</footer>
      </main>
    </div>
  );
}

function SearchIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3.5-3.5" strokeLinecap="round" />
    </svg>
  );
}

function FlipIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-4" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 8h10a4 4 0 0 1 0 8H8" strokeLinecap="round" />
      <path d="M8 4L4 8l4 4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
