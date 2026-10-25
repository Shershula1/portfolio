import type { Metadata } from "next";
import { NotesSite } from "@/components/notes-site";

export const metadata: Metadata = {
  title: "Evernote",
  description: "Notes: блокноты и записи в браузере. Вход по email, данные остаются на этом устройстве.",
};

export default function EvernotePage() {
  return <NotesSite />;
}
