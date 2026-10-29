import { publicPath } from "@/lib/public-path";

const MAX_BYTES = 4 * 1024 * 1024;

export class CertificateFileError extends Error {
  constructor(
    message: string,
    readonly code: "tooBig" | "needDoc" | "pdfPage" | "pdfRead" | "readFailed" | "imagePrepare" | "imageRead",
  ) {
    super(message);
    this.name = "CertificateFileError";
  }
}

export async function prepareCertificateFile(file: File): Promise<{
  mime: string;
  previewUrl: string;
  fileUrl: string;
}> {
  if (file.size > MAX_BYTES) {
    throw new CertificateFileError("Файл больше 4 МБ. Выберите документ меньше.", "tooBig");
  }
  if (file.type.startsWith("image/")) {
    const previewUrl = await imagePreview(file);
    return { mime: "image/jpeg", previewUrl, fileUrl: previewUrl };
  }
  if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
    const [previewUrl, fileUrl] = await Promise.all([pdfPreview(file), readAsDataUrl(file)]);
    return { mime: "application/pdf", previewUrl, fileUrl };
  }
  throw new CertificateFileError("Нужен документ: изображение или PDF.", "needDoc");
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new CertificateFileError("Не удалось прочитать документ.", "readFailed"));
    reader.readAsDataURL(file);
  });
}

function imagePreview(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      const maxEdge = 1400;
      const scale = Math.min(1, maxEdge / Math.max(image.width, image.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(image.width * scale));
      canvas.height = Math.max(1, Math.round(image.height * scale));
      const context = canvas.getContext("2d");
      if (!context) {
        URL.revokeObjectURL(url);
        reject(new CertificateFileError("Не удалось подготовить изображение.", "imagePrepare"));
        return;
      }
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", 0.84));
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new CertificateFileError("Не удалось прочитать изображение.", "imageRead"));
    };
    image.src = url;
  });
}

async function pdfPreview(file: File): Promise<string> {
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = publicPath("/pdf.worker.min.mjs");
  const data = new Uint8Array(await file.arrayBuffer());
  const task = pdfjs.getDocument({ data });
  const document = await task.promise;
  try {
    const page = await document.getPage(1);
    const base = page.getViewport({ scale: 1 });
    const viewport = page.getViewport({ scale: Math.min(2, 1200 / base.width) });
    const canvas = window.document.createElement("canvas");
    canvas.width = Math.max(1, Math.floor(viewport.width));
    canvas.height = Math.max(1, Math.floor(viewport.height));
    const context = canvas.getContext("2d");
    if (!context) throw new CertificateFileError("Не удалось подготовить страницу PDF.", "pdfPage");
    await page.render({ canvasContext: context, canvas, viewport }).promise;
    return canvas.toDataURL("image/jpeg", 0.84);
  } catch (error) {
    if (error instanceof CertificateFileError) throw error;
    throw new CertificateFileError(
      "Не удалось прочитать PDF. Если он закрыт паролем, загрузите изображение.",
      "pdfRead",
    );
  } finally {
    await task.destroy();
  }
}
