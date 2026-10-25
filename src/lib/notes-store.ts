export type Notebook = { id: string; name: string };

export type Note = {
  id: string;
  notebookId: string;
  title: string;
  body: string;
  updatedAt: string;
};

export type Account = {
  email: string;
  passwordHash: string;
  notebooks: Notebook[];
  notes: Note[];
};

const ACCOUNTS_KEY = "notes-accounts-v1";
const SESSION_KEY = "notes-session";

export async function hashPassword(password: string): Promise<string> {
  const data = new TextEncoder().encode(password);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function readAccounts(): Account[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(ACCOUNTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Account[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAccounts(accounts: Account[]): boolean {
  try {
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
    return true;
  } catch {
    return false;
  }
}

export function loadAccount(email: string): Account | null {
  const needle = email.trim().toLowerCase();
  return readAccounts().find((account) => account.email === needle) ?? null;
}

export function saveAccount(account: Account): boolean {
  const accounts = readAccounts().filter((item) => item.email !== account.email);
  accounts.push(account);
  return writeAccounts(accounts);
}

export function readSession(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(SESSION_KEY);
}

export function writeSession(email: string | null) {
  if (email) sessionStorage.setItem(SESSION_KEY, email);
  else sessionStorage.removeItem(SESSION_KEY);
}

export function createAccount(email: string, passwordHash: string): Account {
  const notebookId = crypto.randomUUID();
  return {
    email: email.trim().toLowerCase(),
    passwordHash,
    notebooks: [{ id: notebookId, name: "Inbox" }],
    notes: [],
  };
}
