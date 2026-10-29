import { publicPath } from "@/lib/public-path";

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
  titleEn?: string;
  imageAltEn?: string;
  frameClass: string;
  keywords: string[];
};

export const projects: Project[] = [
  {
    slug: "room",
    href: "https://shershula1.github.io/penrose-rays/",
    title: "Неосвещаемая комната",
    titleEn: "Unilluminable room",
    date: "26.10.2026",
    dateTime: "2026-10-26",
    image: publicPath("/projects/room.webp"),
    imageWidth: 960,
    imageHeight: 746,
    imageAlt: "Овальная зеркальная комната: жёлтые лучи на чёрном фоне и тёмные карманы",
    imageAltEn: "An oval mirrored room: yellow rays on black and dark pockets",
    frameClass: "bg-black",
    keywords: ["комната", "неосвещаемая", "пенроуз", "свет", "room", "unilluminable"],
  },
  {
    slug: "cube",
    href: "https://shershula1.github.io/tesseract/",
    title: "Четырёхмерный куб",
    titleEn: "Four-dimensional cube",
    date: "28.10.2026",
    dateTime: "2026-10-28",
    image: publicPath("/projects/cube.webp"),
    imageWidth: 614,
    imageHeight: 546,
    imageAlt: "Проволочный четырёхмерный куб: внешняя оболочка и куб внутри",
    imageAltEn: "A wireframe four-dimensional cube, with an inner cube inside the outer shell",
    frameClass: "bg-black",
    keywords: ["куб", "четырёхмерный", "четырехмерный", "тессеракт", "tesseract", "cube", "4d"],
  },
  {
    slug: "evernote",
    href: "/evernote",
    title: "Evernote",
    date: "20.10.2026",
    dateTime: "2026-10-20",
    image: publicPath("/projects/evernote.webp"),
    imageWidth: 960,
    imageHeight: 566,
    imageAlt: "Страница входа Notes с полями email и пароль",
    frameClass: "bg-[#f7f4ee]",
    keywords: ["evernote", "notes", "заметки", "блокнот", "login"],
  },
];
