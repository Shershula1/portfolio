"use client";

import { FormEvent, useEffect, useId, useMemo, useRef, useState } from "react";
import { prepareCertificateFile, CertificateFileError } from "@/lib/certificate-file";
import {
  loadCertificates,
  saveCertificates,
  stampDate,
  titleFromFileName,
  type Certificate,
} from "@/lib/certificates";

const cardClass =
  "group block overflow-hidden rounded-2xl border border-[#dadce0] bg-white shadow-[0_1px_2px_rgba(60,64,67,0.12)] outline-none transition motion-safe:hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(60,64,67,0.16)] focus-visible:ring-3 focus-visible:ring-ring";

export function CertificatesSection({ query }: { query: string }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const titleId = useId();
  const fileId = useId();
  const [items, setItems] = useState<Certificate[] | null>(null);
  const [title, setTitle] = useState("");
  const [titleEdited, setTitleEdited] = useState(false);
  const [stamp, setStamp] = useState(() => stampDate(new Date()));
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);

  useEffect(() => {
    setItems(loadCertificates());
  }, []);

  const visible = useMemo(() => {
    if (!items) return [];
    const needle = query.trim().toLowerCase();
    if (!needle) return items;
    return items.filter((item) => `${item.title} ${item.date} грамота`.toLowerCase().includes(needle));
  }, [items, query]);

  function openDialog() {
    setStamp(stampDate(new Date()));
    setTitle("");
    setTitleEdited(false);
    setError("");
    setSaving(false);
    if (fileRef.current) fileRef.current.value = "";
    dialogRef.current?.showModal();
  }

  function closeDialog() {
    dialogRef.current?.close();
  }

  function onFileChange(file: File | undefined) {
    if (!file || titleEdited) return;
    setTitle(titleFromFileName(file.name));
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const file = fileRef.current?.files?.[0];
    const caption = title.trim();
    if (!file) {
      setError("Выберите документ.");
      return;
    }
    if (!caption) {
      setError("Напишите подпись.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const prepared = await prepareCertificateFile(file);
      const next: Certificate = {
        id: crypto.randomUUID(),
        title: caption,
        ...stampDate(new Date()),
        mime: prepared.mime,
        previewUrl: prepared.previewUrl,
        fileUrl: prepared.fileUrl,
      };
      const stored = [next, ...(items ?? [])];
      if (!saveCertificates(stored)) {
        setError("Браузер не сохранил грамоту: документ слишком большой для памяти этой страницы.");
        return;
      }
      setItems(stored);
      closeDialog();
    } catch (caught) {
      setError(caught instanceof CertificateFileError ? caught.message : "Не удалось добавить грамоту.");
    } finally {
      setSaving(false);
    }
  }

  function remove(id: string) {
    const stored = (items ?? []).filter((item) => item.id !== id);
    if (!saveCertificates(stored)) {
      setError("Не удалось удалить грамоту.");
      return;
    }
    setItems(stored);
    setPendingDelete(null);
  }

  function openCertificate(item: Certificate) {
    const blob = dataUrlToBlob(item.fileUrl);
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank", "noopener");
    window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
  }

  return (
    <section id="certificates" className="mt-10">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <h2 className="text-2xl font-medium tracking-tight">Грамоты</h2>
        <button
          type="button"
          onClick={openDialog}
          className="inline-flex h-11 items-center justify-center rounded-full bg-[#202124] px-4 text-sm font-medium text-white outline-none hover:bg-black focus-visible:ring-3 focus-visible:ring-ring"
        >
          Добавить грамоту
        </button>
      </div>

      {items === null ? (
        <p className="mt-8 text-sm text-muted-foreground">Загружаю грамоты…</p>
      ) : visible.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed px-6 py-12 text-center">
          <p className="text-lg font-medium">
            {query.trim() ? "В грамотах ничего не нашлось" : "Грамот пока нет"}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            {query.trim()
              ? "Попробуйте другое слово или очистите поиск."
              : "Нажмите «Добавить грамоту» и загрузите документ. Дата поставится сама."}
          </p>
        </div>
      ) : (
        <ul className="mt-8 grid gap-8 sm:grid-cols-2">
          {visible.map((item) => (
            <li key={item.id} className="relative">
              <button type="button" onClick={() => openCertificate(item)} className={`${cardClass} w-full text-left`}>
                <span className="block aspect-[4/3] bg-[#f6f5f2]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.previewUrl}
                    alt=""
                    className="h-full w-full object-contain"
                  />
                </span>
                <span className="block px-4 py-3.5 pr-28">
                  <span className="block truncate text-lg font-medium tracking-tight text-[#202124]">{item.title}</span>
                  <time dateTime={item.dateTime} className="mt-0.5 block text-sm text-[#70757a]">
                    {item.date}
                  </time>
                </span>
              </button>
              <div className="absolute right-3 bottom-3">
                {pendingDelete === item.id ? (
                  <span className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => remove(item.id)}
                      className="rounded-full bg-red-700 px-3 py-1 text-xs font-medium text-white"
                    >
                      Удалить
                    </button>
                    <button
                      type="button"
                      onClick={() => setPendingDelete(null)}
                      className="rounded-full border bg-white px-3 py-1 text-xs"
                    >
                      Отмена
                    </button>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => setPendingDelete(item.id)}
                    className="rounded-full border bg-white px-3 py-1 text-xs text-[#70757a] hover:text-[#202124]"
                  >
                    Удалить
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      <dialog
        ref={dialogRef}
        className="w-[min(100%,28rem)] rounded-2xl border border-[#dadce0] bg-white p-0 text-[#202124] shadow-xl backdrop:bg-black/40"
        onClick={(event) => {
          if (event.target === dialogRef.current) closeDialog();
        }}
      >
        <form onSubmit={onSubmit} className="space-y-4 p-6">
          <div>
            <h3 className="text-xl font-medium">Добавить грамоту</h3>
            <p className="mt-1 text-sm text-[#70757a]">Документ появится карточкой: снимок, подпись и дата.</p>
          </div>
          <label htmlFor={fileId} className="block space-y-1.5">
            <span className="text-sm font-medium">Документ</span>
            <input
              id={fileId}
              ref={fileRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif,application/pdf,.pdf"
              onChange={(event) => onFileChange(event.target.files?.[0])}
              className="block w-full text-sm file:mr-3 file:rounded-full file:border-0 file:bg-[#f3f4f1] file:px-3 file:py-2 file:text-sm file:font-medium"
            />
          </label>
          <label htmlFor={titleId} className="block space-y-1.5">
            <span className="text-sm font-medium">Подпись</span>
            <input
              id={titleId}
              value={title}
              onChange={(event) => {
                setTitleEdited(true);
                setTitle(event.target.value);
              }}
              placeholder="Например, олимпиада"
              className="h-11 w-full rounded-xl border border-input bg-white px-3 text-base outline-none focus-visible:ring-3 focus-visible:ring-ring"
            />
          </label>
          <p className="text-sm text-[#70757a]">
            Дата поставится сама: <time dateTime={stamp.dateTime}>{stamp.date}</time>
          </p>
          {error ? (
            <p role="alert" className="text-sm text-red-700">
              {error}
            </p>
          ) : null}
          <div className="flex justify-end gap-2">
            <button type="button" onClick={closeDialog} className="h-10 rounded-full px-4 text-sm hover:bg-muted">
              Отмена
            </button>
            <button
              type="submit"
              disabled={saving}
              className="h-10 rounded-full bg-[#202124] px-4 text-sm font-medium text-white disabled:opacity-60"
            >
              {saving ? "Сохраняю…" : "Сохранить"}
            </button>
          </div>
        </form>
      </dialog>
    </section>
  );
}

function dataUrlToBlob(dataUrl: string): Blob {
  const [header, data] = dataUrl.split(",");
  const mime = /data:([^;]+)/.exec(header)?.[1] ?? "application/octet-stream";
  const binary = atob(data);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return new Blob([bytes], { type: mime });
}
