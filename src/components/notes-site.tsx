"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  createAccount,
  hashPassword,
  loadAccount,
  readSession,
  saveAccount,
  writeSession,
  type Account,
  type Note,
} from "@/lib/notes-store";

type Mode = "signin" | "register";
type Pane = "list" | "editor";

export function NotesSite() {
  const [ready, setReady] = useState(false);
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState("");
  const [saveError, setSaveError] = useState(false);
  const [account, setAccount] = useState<Account | null>(null);
  const [notebookId, setNotebookId] = useState<string | "all">("all");
  const [noteId, setNoteId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [pane, setPane] = useState<Pane>("list");
  const [notebookName, setNotebookName] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    const session = readSession();
    if (session) {
      const existing = loadAccount(session);
      if (existing) setAccount(existing);
      else writeSession(null);
    }
    setReady(true);
  }, []);

  function persist(next: Account) {
    setAccount(next);
    setSaveError(!saveAccount(next));
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");
    const normalized = email.trim().toLowerCase();
    if (!normalized.includes("@") || !normalized.includes(".")) {
      setFormError("Enter a valid email.");
      return;
    }
    if (password.length < 4) {
      setFormError("Password needs at least 4 characters.");
      return;
    }
    const passwordHash = await hashPassword(password);
    const existing = loadAccount(normalized);
    if (mode === "register") {
      if (existing) {
        setFormError("An account with this email already exists.");
        return;
      }
      const created = createAccount(normalized, passwordHash);
      if (!saveAccount(created)) {
        setFormError("Could not save the account in this browser.");
        return;
      }
      writeSession(created.email);
      setAccount(created);
      setPassword("");
      return;
    }
    if (!existing || existing.passwordHash !== passwordHash) {
      setFormError("Wrong email or password.");
      return;
    }
    writeSession(existing.email);
    setAccount(existing);
    setPassword("");
  }

  function logout() {
    writeSession(null);
    setAccount(null);
    setNoteId(null);
    setQuery("");
    setPane("list");
    setMode("signin");
  }

  const notes = useMemo(() => {
    if (!account) return [];
    const needle = query.trim().toLowerCase();
    return account.notes
      .filter((note) => {
        if (!needle && notebookId !== "all" && note.notebookId !== notebookId) return false;
        if (!needle) return true;
        const notebook = account.notebooks.find((item) => item.id === note.notebookId);
        return `${note.title}\n${note.body}\n${notebook?.name ?? ""}`.toLowerCase().includes(needle);
      })
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }, [account, notebookId, query]);

  const selected = account?.notes.find((note) => note.id === noteId) ?? null;

  function addNote() {
    if (!account) return;
    const target = notebookId === "all" ? account.notebooks[0] : account.notebooks.find((item) => item.id === notebookId);
    if (!target) return;
    const note: Note = {
      id: crypto.randomUUID(),
      notebookId: target.id,
      title: "",
      body: "",
      updatedAt: new Date().toISOString(),
    };
    persist({ ...account, notes: [note, ...account.notes] });
    setNoteId(note.id);
    setConfirmDelete(false);
    setPane("editor");
  }

  function updateNote(patch: Partial<Pick<Note, "title" | "body" | "notebookId">>) {
    if (!account || !selected) return;
    persist({
      ...account,
      notes: account.notes.map((note) =>
        note.id === selected.id ? { ...note, ...patch, updatedAt: new Date().toISOString() } : note,
      ),
    });
  }

  function deleteNote() {
    if (!account || !selected) return;
    persist({ ...account, notes: account.notes.filter((note) => note.id !== selected.id) });
    setNoteId(null);
    setConfirmDelete(false);
    setPane("list");
  }

  function addNotebook(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!account) return;
    const name = notebookName.trim();
    if (!name) return;
    const notebook = { id: crypto.randomUUID(), name };
    persist({ ...account, notebooks: [...account.notebooks, notebook] });
    setNotebookName("");
    setNotebookId(notebook.id);
  }

  if (!ready) {
    return (
      <main className="grid min-h-dvh place-items-center bg-[#f6f5f2] text-sm text-neutral-500">
        Opening notes…
      </main>
    );
  }

  if (!account) {
    return (
      <main className="relative grid min-h-dvh place-items-center bg-[#f6f5f2] px-4 py-16">
        <Link href="/" className="absolute top-4 left-4 text-sm text-neutral-500 hover:text-neutral-800">
          Портфолио
        </Link>
        <div className="w-full max-w-[440px]">
          <h1 className="mb-8 text-center font-serif text-4xl tracking-tight text-neutral-900">Notes</h1>
          <form onSubmit={onSubmit} className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
            <div className="space-y-4 px-6 pt-6 pb-5">
              <div>
                <h2 className="text-lg font-semibold text-neutral-900">
                  {mode === "signin" ? "Sign in" : "Create account"}
                </h2>
                <p className="mt-1 text-sm text-neutral-500">
                  {mode === "signin"
                    ? "Access your notebooks and notes."
                    : "Notes stay in this browser, on this device."}
                </p>
              </div>
              <label className="block space-y-1.5">
                <span className="text-sm font-medium text-neutral-800">Email</span>
                <Input
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  className="h-10 bg-white md:text-sm"
                />
              </label>
              <label className="block space-y-1.5">
                <span className="text-sm font-medium text-neutral-800">Password</span>
                <Input
                  type="password"
                  autoComplete={mode === "signin" ? "current-password" : "new-password"}
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="h-10 bg-white md:text-sm"
                />
              </label>
              {formError ? (
                <p role="alert" className="text-sm text-red-700">
                  {formError}
                </p>
              ) : null}
            </div>
            <div className="flex items-center justify-between gap-3 bg-[#f3f4f1] px-6 py-3">
              <Button type="submit" className="bg-[#2f6b45] text-white hover:bg-[#27583a]">
                {mode === "signin" ? "Sign in" : "Register"}
              </Button>
              <p className="text-sm text-neutral-500">
                {mode === "signin" ? "No account?" : "Have an account?"}{" "}
                <button
                  type="button"
                  className="text-neutral-800 underline underline-offset-2"
                  onClick={() => {
                    setMode(mode === "signin" ? "register" : "signin");
                    setFormError("");
                  }}
                >
                  {mode === "signin" ? "Register" : "Sign in"}
                </button>
              </p>
            </div>
          </form>
        </div>
      </main>
    );
  }

  return (
    <div className="flex h-dvh flex-col bg-white text-neutral-900">
      <header className="flex h-14 shrink-0 items-center justify-between gap-3 border-b px-4">
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-900">
          <ArrowLeft className="size-4" />
          Портфолио
        </Link>
        <h1 className="font-serif text-xl">Notes</h1>
        <div className="flex items-center gap-3">
          <span className="hidden max-w-40 truncate text-sm text-neutral-500 sm:inline">{account.email}</span>
          <Button type="button" variant="outline" size="sm" onClick={logout}>
            Log out
          </Button>
        </div>
      </header>
      {saveError ? (
        <p role="alert" className="border-b bg-red-50 px-4 py-2 text-sm text-red-800">
          Could not save notes in this browser. They remain until you close the page.
        </p>
      ) : null}
      <div className="flex min-h-0 flex-1">
        <aside className="hidden w-56 shrink-0 flex-col border-r bg-[#f6f7f8] md:flex">
          <p className="px-4 pt-4 text-xs font-medium tracking-wide text-neutral-500 uppercase">Notebooks</p>
          <nav className="mt-2 flex-1 space-y-1 overflow-auto px-2">
            <NotebookButton active={notebookId === "all"} onClick={() => setNotebookId("all")} label="All notes" count={account.notes.length} />
            {account.notebooks.map((notebook) => (
              <NotebookButton
                key={notebook.id}
                active={notebookId === notebook.id}
                onClick={() => setNotebookId(notebook.id)}
                label={notebook.name}
                count={account.notes.filter((note) => note.notebookId === notebook.id).length}
              />
            ))}
          </nav>
          <form onSubmit={addNotebook} className="flex gap-2 border-t p-3">
            <Input
              value={notebookName}
              onChange={(event) => setNotebookName(event.target.value)}
              placeholder="New notebook"
              aria-label="New notebook"
              className="h-8 bg-white"
            />
            <Button type="submit" size="icon" variant="outline" aria-label="Add notebook">
              <Plus />
            </Button>
          </form>
        </aside>

        <section className={`${pane === "list" ? "flex" : "hidden"} min-h-0 w-full flex-col border-r md:flex md:w-72`}>
          <div className="flex items-center gap-2 border-b p-3">
            <label className="min-w-0 flex-1">
              <span className="sr-only">Search notes</span>
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search"
                type="search"
                className="h-8 bg-white"
              />
            </label>
            <Button type="button" size="icon" variant="outline" aria-label="New note" onClick={addNote}>
              <Plus />
            </Button>
          </div>
          <form onSubmit={addNotebook} className="flex gap-2 border-b p-3 md:hidden">
            <Input
              value={notebookName}
              onChange={(event) => setNotebookName(event.target.value)}
              placeholder="New notebook"
              aria-label="New notebook"
              className="h-8 bg-white"
            />
            <Button type="submit" size="icon" variant="outline" aria-label="Add notebook">
              <Plus />
            </Button>
          </form>
          <label className="border-b px-3 py-2 md:hidden">
            <span className="sr-only">Notebook</span>
            <select
              value={notebookId}
              onChange={(event) => setNotebookId(event.target.value)}
              className="h-8 w-full rounded-lg border bg-white px-2 text-sm"
            >
              <option value="all">All notes</option>
              {account.notebooks.map((notebook) => (
                <option key={notebook.id} value={notebook.id}>
                  {notebook.name}
                </option>
              ))}
            </select>
          </label>
          {notes.length === 0 ? (
            <div className="grid flex-1 place-items-center px-6 text-center">
              <div>
                <p className="font-medium">{query ? "Nothing matches" : "No notes yet"}</p>
                <p className="mt-1 text-sm text-neutral-500">
                  {query ? `No notes for “${query}”.` : "Create a note in this notebook."}
                </p>
                {!query ? (
                  <Button type="button" className="mt-4" size="sm" onClick={addNote}>
                    New note
                  </Button>
                ) : null}
              </div>
            </div>
          ) : (
            <ul className="min-h-0 flex-1 overflow-auto">
              {notes.map((note) => {
                const notebook = account.notebooks.find((item) => item.id === note.notebookId);
                const active = note.id === noteId;
                return (
                  <li key={note.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setNoteId(note.id);
                        setConfirmDelete(false);
                        setPane("editor");
                      }}
                      className={`block w-full border-b px-4 py-3 text-left ${active ? "bg-neutral-100" : "hover:bg-neutral-50"}`}
                    >
                      <span className="block truncate font-medium">{note.title.trim() || "Untitled"}</span>
                      <span className="mt-0.5 block truncate text-sm text-neutral-500">
                        {note.body.trim() || "Empty note"}
                      </span>
                      <span className="mt-1 block text-xs text-neutral-400">
                        {formatWhen(note.updatedAt)}
                        {query && notebook ? ` · ${notebook.name}` : ""}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className={`${pane === "editor" ? "flex" : "hidden"} min-h-0 min-w-0 flex-1 flex-col md:flex`}>
          {selected ? (
            <>
              <div className="flex items-center justify-between gap-2 border-b px-4 py-2">
                <Button type="button" variant="ghost" size="sm" className="md:hidden" onClick={() => setPane("list")}>
                  Back
                </Button>
                <label className="min-w-0">
                  <span className="sr-only">Notebook</span>
                  <select
                    value={selected.notebookId}
                    onChange={(event) => updateNote({ notebookId: event.target.value })}
                    className="h-8 max-w-40 rounded-lg border bg-white px-2 text-sm"
                  >
                    {account.notebooks.map((notebook) => (
                      <option key={notebook.id} value={notebook.id}>
                        {notebook.name}
                      </option>
                    ))}
                  </select>
                </label>
                <div className="ml-auto flex items-center gap-2">
                  <span className="hidden text-xs text-neutral-400 sm:inline">{formatWhen(selected.updatedAt)}</span>
                  {confirmDelete ? (
                    <>
                      <Button type="button" size="sm" variant="destructive" onClick={deleteNote}>
                        Delete note
                      </Button>
                      <Button type="button" size="sm" variant="ghost" onClick={() => setConfirmDelete(false)}>
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <Button type="button" size="sm" variant="ghost" onClick={() => setConfirmDelete(true)}>
                      <Trash2 />
                      Delete
                    </Button>
                  )}
                </div>
              </div>
              <div className="flex min-h-0 flex-1 flex-col px-5 py-4">
                <Input
                  value={selected.title}
                  onChange={(event) => updateNote({ title: event.target.value })}
                  placeholder="Untitled"
                  aria-label="Note title"
                  className="h-auto border-0 px-0 text-2xl font-medium shadow-none focus-visible:ring-0 md:text-2xl"
                />
                <Textarea
                  value={selected.body}
                  onChange={(event) => updateNote({ body: event.target.value })}
                  placeholder="Start writing"
                  aria-label="Note body"
                  className="mt-2 min-h-0 flex-1 resize-none border-0 px-0 text-base shadow-none focus-visible:ring-0 field-sizing-fixed md:text-base"
                />
              </div>
            </>
          ) : (
            <div className="grid flex-1 place-items-center px-6 text-center">
              <div>
                <p className="font-medium">Select a note</p>
                <p className="mt-1 text-sm text-neutral-500">Or create a new one. Nothing is sent off this device.</p>
                <Button type="button" className="mt-4" size="sm" onClick={addNote}>
                  New note
                </Button>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function NotebookButton({
  active,
  label,
  count,
  onClick,
}: {
  active: boolean;
  label: string;
  count: number;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-left text-sm ${active ? "bg-white font-medium shadow-sm" : "hover:bg-white/70"}`}
    >
      <span className="truncate">{label}</span>
      <span className="text-xs text-neutral-400">{count}</span>
    </button>
  );
}

function formatWhen(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}
