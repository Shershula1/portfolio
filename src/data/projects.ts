export type Project = {
  slug: string;
  href: string;
  title: string;
  date: string;
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
    date: "2026",
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
    date: "2026",
    image: "/projects/evernote.webp",
    imageWidth: 960,
    imageHeight: 566,
    imageAlt: "Страница входа Notes с полями email и пароль",
    frameClass: "bg-[#f6f5f2]",
    keywords: ["evernote", "notes", "заметки", "блокнот", "login"],
  },
];
