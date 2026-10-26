export type Project = {
  slug: string;
  href: string;
  title: string;
  date: string;
  dateTime: string;
  image: string;
  imageWidth: number;
  imageHeight: number;
  imageAlt: string;
  frameClass: string;
  keywords: string[];
};

export const projects: Project[] = [
  {
    slug: "room",
    href: "https://cartoons-ones-missed-village.trycloudflare.com/",
    title: "Неосвещаемая комната",
    date: "26.10.2026",
    dateTime: "2026-10-26",
    image: "/projects/room.webp",
    imageWidth: 960,
    imageHeight: 746,
    imageAlt: "Овальная зеркальная комната: жёлтые лучи на чёрном фоне и тёмные карманы",
    frameClass: "bg-black",
    keywords: ["комната", "неосвещаемая", "пенроуз", "свет", "room"],
  },
  {
    slug: "evernote",
    href: "/evernote",
    title: "Evernote",
    date: "20.10.2026",
    dateTime: "2026-10-20",
    image: "/projects/evernote.webp",
    imageWidth: 960,
    imageHeight: 566,
    imageAlt: "Страница входа Notes с полями email и пароль",
    frameClass: "bg-[#f7f4ee]",
    keywords: ["evernote", "notes", "заметки", "блокнот", "login"],
  },
];
