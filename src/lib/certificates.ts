export const certificateSections = ["karate", "acrobatics", "frontend", "blender", "roblox", "scratch"] as const;

export type CertificateSection = (typeof certificateSections)[number];

export type Certificate = {
  id: string;
  title: string;
  date: string;
  dateTime: string;
  mime: string;
  previewUrl: string;
  fileUrl: string;
  section?: CertificateSection;
};

export function isCertificateSection(value: unknown): value is CertificateSection {
  return typeof value === "string" && (certificateSections as readonly string[]).includes(value);
}

const STORAGE_KEY = "portfolio-certificates-v1";

export function stampDate(date: Date): { date: string; dateTime: string } {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return { date: `${day}.${month}.${year}`, dateTime: `${year}-${month}-${day}` };
}

export function titleFromFileName(name: string): string {
  const trimmed = name.trim();
  const withoutExtension = trimmed.replace(/\.[^.]+$/, "").trim();
  return withoutExtension || "Грамота";
}

export function loadCertificates(): Certificate[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Certificate[];
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((item) => item && item.id && item.title && item.previewUrl && item.date)
      .map((item) => ({
        ...item,
        section: isCertificateSection(item.section) ? item.section : undefined,
      }));
  } catch {
    return [];
  }
}

export function saveCertificates(items: Certificate[]): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    return true;
  } catch {
    return false;
  }
}
