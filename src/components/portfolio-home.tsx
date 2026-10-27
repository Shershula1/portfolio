"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CertificatesSection } from "@/components/certificates-section";
import { projects } from "@/data/projects";
import { copy, type Lang } from "@/lib/copy";

type Section = "sites" | "certificates";

const cardClass =
  "group block overflow-hidden rounded-[1.35rem] border border-[#e6e0d4] bg-white shadow-[0_1px_1px_rgba(70,55,30,0.04),0_16px_36px_-22px_rgba(70,55,30,0.35)] outline-none transition duration-200 motion-safe:hover:-translate-y-1 hover:shadow-[0_18px_40px_-18px_rgba(70,55,30,0.32)] focus-visible:ring-3 focus-visible:ring-[#202124]/15";

export function PortfolioHome() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [mirrored, setMirrored] = useState(false);
  const [section, setSection] = useState<Section>("sites");
  const [aboutPinned, setAboutPinned] = useState(false);
  const [aboutHover, setAboutHover] = useState(false);
  const [canHover, setCanHover] = useState(false);
  const [lang, setLang] = useState<Lang>("ru");
  const aboutOpen = aboutPinned || aboutHover;
  const text = copy[lang];

  useEffect(() => {
    if (window.location.hash === "#certificates") setSection("certificates");
    const media = window.matchMedia("(hover: hover) and (pointer: fine)");
    const update = () => setCanHover(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.title = lang === "en" ? "Danya Retivykh — portfolio" : "Даня Ретивых — портфолио";
  }, [lang]);

  function chooseSection(next: Section) {
    setSection(next);
    const hash = next === "certificates" ? "#certificates" : "#sites";
    if (window.location.hash !== hash) history.replaceState(null, "", hash);
  }

  const results = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return projects;
    return projects.filter((project) => {
      const titles = [project.title, project.titleEn].filter(Boolean);
      const haystack = [...titles, project.date, ...project.keywords].join(" ").toLowerCase();
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
    <div className="min-h-dvh bg-[#f3efe6] text-[#1c1915]">
      <button
        type="button"
        onClick={() => {
          setLang((current) => (current === "ru" ? "en" : "ru"));
          setAboutPinned(true);
        }}
        aria-label={text.translateLabel}
        className="fixed top-4 right-4 z-20 inline-flex h-14 items-center rounded-full border border-[#e4dfd4] bg-white px-6 text-lg font-semibold text-[#1c1915] shadow-[0_10px_28px_-16px_rgba(40,32,20,0.45)] outline-none hover:bg-[#fbf9f5] focus-visible:ring-3 focus-visible:ring-[#202124]/12 sm:top-6 sm:right-6 sm:h-16 sm:px-8 sm:text-xl"
      >
        {text.translate}
      </button>
      <div className={mirrored ? "origin-center [transform:scaleX(-1)]" : undefined}>
      <main className="mx-auto flex min-h-dvh w-full max-w-5xl flex-col px-4 pt-24 pb-10 sm:px-6 sm:pt-14">
        <header className="mx-auto w-full max-w-xl text-center">
          <div
            className="group"
            onMouseEnter={() => {
              if (canHover) setAboutHover(true);
            }}
            onMouseLeave={() => setAboutHover(false)}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/portrait.webp"
              alt={text.name}
              width={720}
              height={961}
              fetchPriority="high"
              decoding="async"
              className="mx-auto h-52 w-40 rounded-[1.6rem] object-cover object-[center_18%] shadow-[0_16px_40px_-24px_rgba(40,32,20,0.55)] ring-4 ring-white sm:h-64 sm:w-48"
            />
            <h1 className="mt-6">
              <button
                type="button"
                aria-expanded={aboutOpen}
                aria-controls="about-danya"
                onClick={() => setAboutPinned((value) => !value)}
                className="outline-none"
              >
                <span className="block font-serif text-[2.75rem] leading-[0.92] font-bold tracking-[-0.035em] text-[#1c1915] sm:text-7xl">
                  {text.name}
                </span>
                <span className="mt-3 block text-[0.72rem] font-medium tracking-[0.18em] text-[#8d8478] uppercase">
                  {text.aboutLabel}
                </span>
              </button>
            </h1>
            <div
              id="about-danya"
              className={`grid transition-[grid-template-rows] duration-300 ease-out ${aboutOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"} [@media(hover:hover)_and_(pointer:fine)]:group-hover:grid-rows-[1fr]`}
            >
              <div className="overflow-hidden">
                <p className="mx-auto max-w-md pt-4 text-[0.98rem] leading-7 text-[#3c3832]">{text.about}</p>
              </div>
            </div>
          </div>
          <p className="mt-8 font-serif text-3xl font-medium tracking-tight text-[#1c1915] sm:text-4xl">{text.portfolio}</p>
          <span aria-hidden className="mx-auto mt-5 block h-px w-12 bg-[#cfc6b6]" />
        </header>
        <div
          role="group"
          aria-label={text.section}
          className="mx-auto mt-6 flex w-fit gap-1 rounded-full border border-[#dadce0] bg-white p-1 shadow-[0_1px_2px_rgba(60,64,67,0.08)]"
        >
          <SectionButton pressed={section === "sites"} onClick={() => chooseSection("sites")}>
            {text.sites}
          </SectionButton>
          <SectionButton pressed={section === "certificates"} onClick={() => chooseSection("certificates")}>
            {text.certificates}
          </SectionButton>
        </div>

        <form onSubmit={onSubmit} className="mx-auto mt-8 flex w-full max-w-xl flex-col gap-3 sm:flex-row">
          <label className="relative min-w-0 flex-1">
            <span className="sr-only">{text.search}</span>
            <SearchIcon />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={text.search}
              type="search"
              className="h-12 w-full rounded-full border border-[#e4dfd4] bg-white/90 pr-4 pl-11 text-base text-[#1c1915] shadow-[0_1px_2px_rgba(70,55,30,0.04)] outline-none placeholder:text-[#a3998d] focus-visible:border-[#c9c0b2] focus-visible:ring-3 focus-visible:ring-[#202124]/12"
            />
          </label>
          <button
            type="button"
            aria-pressed={mirrored}
            onClick={() => setMirrored((value) => !value)}
            className={`inline-flex h-12 items-center justify-center gap-2 rounded-full border px-4 text-sm font-medium shadow-[0_1px_2px_rgba(70,55,30,0.04)] outline-none focus-visible:ring-3 focus-visible:ring-[#202124]/12 ${
              mirrored
                ? "border-[#202124] bg-[#202124] text-white"
                : "border-[#e4dfd4] bg-white/90 text-[#3c3832] hover:bg-white"
            }`}
          >
            <FlipIcon />
            {text.mirror}
          </button>
        </form>

        <section id="sites" hidden={section !== "sites"} className="mt-10">
          <h2 className="font-serif text-[1.65rem] font-medium tracking-tight text-[#1c1915]">{text.sites}</h2>
          {results.length === 0 ? (
            <div className="mt-8 rounded-[1.35rem] border border-dashed border-[#d5cdbf] bg-white/45 px-6 py-14 text-center">
              <p className="font-serif text-xl font-medium">{text.sitesEmpty}</p>
              <p className="mt-2 text-sm text-[#8d8478]">{text.sitesHint}</p>
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
                        alt={lang === "en" && project.imageAltEn ? project.imageAltEn : project.imageAlt}
                        width={project.imageWidth}
                        height={project.imageHeight}
                        fetchPriority={index === 0 ? "high" : "auto"}
                        decoding="async"
                        className="h-full w-full object-contain"
                      />
                    </span>
                    <span className="block px-5 pt-4 pb-5">
                      <span className="block font-serif text-xl leading-snug font-medium tracking-tight text-[#1c1915]">
                        {lang === "en" && project.titleEn ? project.titleEn : project.title}
                      </span>
                      <time dateTime={project.dateTime} className="mt-1.5 block text-[0.75rem] tracking-[0.06em] text-[#8d8478]">
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

        <div hidden={section !== "certificates"}>
          <CertificatesSection query={query} lang={lang} />
        </div>

        <footer className="mt-auto flex flex-col items-center gap-2 pt-20 text-center">
          <p className="text-[0.68rem] tracking-[0.2em] text-[#a3998d] uppercase">{text.name}</p>
          <a
            href="mailto:danyaretivykh@gmail.com"
            className="text-sm text-[#1c1915] underline decoration-[#cfc6b6] underline-offset-4 hover:decoration-[#1c1915]"
          >
            danyaretivykh@gmail.com
          </a>
        </footer>
      </main>
      </div>
    </div>
  );
}

function SectionButton({
  pressed,
  onClick,
  children,
}: {
  pressed: boolean;
  onClick: () => void;
  children: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
        pressed
          ? "border-[#202124] bg-[#202124] text-white"
          : "border-transparent bg-transparent text-[#70757a] hover:text-[#202124]"
      }`}
    >
      {children}
    </button>
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
