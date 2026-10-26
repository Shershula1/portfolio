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
  "group block overflow-hidden rounded-[1.35rem] border border-[#e6e0d4] bg-white shadow-[0_1px_1px_rgba(70,55,30,0.04),0_16px_36px_-22px_rgba(70,55,30,0.35)] outline-none transition duration-200 motion-safe:hover:-translate-y-1 hover:shadow-[0_18px_40px_-18px_rgba(70,55,30,0.32)] focus-visible:ring-3 focus-visible:ring-[#202124]/15";

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
        <h2 className="font-serif text-[1.65rem] font-medium tracking-tight text-[#1c1915]">Грамоты</h2>
        <button
          type="button"
          onClick={openDialog}
          className="inline-flex h-11 items-center justify-center rounded-full bg-[#202124] px-5 text-sm font-medium text-white shadow-[0_8px_20px_-12px_rgba(28,25,21,0.8)] outline-none hover:bg-[#111] focus-visible:ring-3 focus-visible:ring-[#202124]/20"
        >
          Добавить грамоту
        </button>
      </div>

      {items === null ? (
        <p className="mt-8 text-sm text-[#8d8478]">Загружаю грамоты…</p>
      ) : visible.length === 0 ? (
        <div className="mt-8 rounded-[1.35rem] border border-dashed border-[#d5cdbf] bg-white/45 px-6 py-14 text-center">
          <p className="font-serif text-xl font-medium text-[#1c1915]">
            {query.trim() ? "В грамотах ничего не нашлось" : "Грамот пока нет"}
          </p>
          <p className="mt-2 text-sm text-[#8d8478]">
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
                <span className="block aspect-[4/3] bg-[#f7f4ee]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.previewUrl}
                    alt=""
                    className="h-full w-full object-contain"
                  />
                </span>
                <span className="block px-5 pt-4 pb-5 pr-28">
                  <span className="block truncate font-serif text-xl leading-snug font-medium tracking-tight text-[#1c1915]">
                    {item.title}
                  </span>
                  <time dateTime={item.dateTime} className="mt-1.5 block text-[0.75rem] tracking-[0.06em] text-[#8d8478]">
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
                      className="rounded-full border border-[#e6e0d4] bg-white px-3 py-1 text-xs text-[#3c3832]"
                    >
                      Отмена
                    </button>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => setPendingDelete(item.id)}
                    className="rounded-full border border-[#e6e0d4] bg-white/95 px-3 py-1 text-xs text-[#8d8478] shadow-sm hover:text-[#202124]"
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
        className="w-[min(100%-1.5rem,28rem)] rounded-[1.35rem] border border-[#e6e0d4] bg-[#fbf9f5] p-0 text-[#1c1915] shadow-[0_28px_70px_-24px_rgba(40,32,20,0.45)] backdrop:bg-[#1c1915]/40"
        onClick={(event) => {
          if (event.target === dialogRef.current) closeDialog();
        }}
      >
        <form onSubmit={onSubmit} className="space-y-4 p-6">
          <div>
            <h3 className="font-serif text-2xl font-medium tracking-tight">Добавить грамоту</h3>
            <p className="mt-1.5 text-sm text-[#8d8478]">Документ появится карточкой: снимок, подпись и дата.</p>
          </div>
          <label htmlFor={fileId} className="block space-y-1.5">
            <span className="text-sm font-medium">Документ</span>
            <input
              id={fileId}
              ref={fileRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif,application/pdf,.pdf"
              onChange={(event) => onFileChange(event.target.files?.[0])}
              className="block w-full text-sm text-[#3c3832] file:mr-3 file:rounded-full file:border-0 file:bg-[#efeae1] file:px-3 file:py-2 file:text-sm file:font-medium file:text-[#1c1915]"
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
              className="h-11 w-full rounded-xl border border-[#e4dfd4] bg-white px-3 text-base outline-none focus-visible:border-[#c9c0b2] focus-visible:ring-3 focus-visible:ring-[#202124]/12"
            />
          </label>
          <p className="text-sm text-[#8d8478]">
            Дата поставится сама: <time dateTime={stamp.dateTime}>{stamp.date}</time>
          </p>
          {error ? (
            <p role="alert" className="text-sm text-red-700">
              {error}
            </p>
          ) : null}
          <div className="flex justify-end gap-2">
            <button type="button" onClick={closeDialog} className="h-10 rounded-full px-4 text-sm text-[#3c3832] hover:bg-[#efeae1]">
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
