import { useEffect, useState, useSyncExternalStore } from "react";
import bundled from "@/data/snapchat.json";

export type Account = [username: string, name: string, link: string];
export type Section = { id: string; name: string; accounts: Account[] };

const ORDER = ["الأصدقاء", "تم إرسال طلبات", "المعلّقة", "المحذوفون", "المحظورون", "المخفية", "المتجاهَلون", "الاشتراكات"];
const ICONS = ["👥", "📤", "⏳", "🗑️", "🚫", "🙈", "🔕", "🔔"];

export function sortSections(s: Section[]) {
  const rank = (n: string) => {
    const i = ORDER.findIndex((k) => n.includes(k));
    return i === -1 ? 99 : i;
  };
  return [...s].sort((a, b) => rank(a.name) - rank(b.name));
}
export function iconFor(name: string) {
  const i = ORDER.findIndex((k) => name.includes(k));
  return i === -1 ? "📁" : ICONS[i];
}

const KEY = "snap-data-override";
const listeners = new Set<() => void>();
let cache: Section[] | null = null;
function read(): Section[] {
  if (cache) return cache;
  try {
    const raw = localStorage.getItem(KEY);
    cache = raw ? JSON.parse(raw) : (bundled as Section[]);
  } catch {
    cache = bundled as Section[];
  }
  return cache!;
}
export function setOverride(s: Section[] | null) {
  if (s) localStorage.setItem(KEY, JSON.stringify(s));
  else localStorage.removeItem(KEY);
  cache = null;
  listeners.forEach((l) => l());
}
const sub = (l: () => void) => (listeners.add(l), () => listeners.delete(l));
export function useSections(): Section[] {
  const s = useSyncExternalStore(sub, read, () => bundled as Section[]);
  return sortSections(s);
}
export const hasOverride = () => typeof localStorage !== "undefined" && !!localStorage.getItem(KEY);

export async function parseExcel(file: File): Promise<Section[]> {
  const XLSX = await import("xlsx");
  const wb = XLSX.read(await file.arrayBuffer());
  const out: Section[] = wb.SheetNames.map((name, i) => {
    const rows = XLSX.utils.sheet_to_json<unknown[]>(wb.Sheets[name], { header: 1 }).slice(1);
    const accounts: Account[] = [];
    for (const r of rows) {
      const u = String(r?.[0] ?? "").trim();
      if (!u) continue;
      const link = String(r?.[2] ?? "").trim() || `https://www.snapchat.com/add/${u}`;
      accounts.push([u, String(r?.[1] ?? ""), link]);
    }
    return { id: "s" + i, name, accounts };
  });
  if (!out.some((s) => s.accounts.length)) throw new Error("لم يتم العثور على حسابات في الملف");
  return out;
}

// Favorites
const FKEY = "snap-favs";
const flisteners = new Set<() => void>();
let fcache: string[] | null = null;
const fread = () => (fcache ??= JSON.parse(localStorage.getItem(FKEY) || "[]") as string[]);
const fsub = (l: () => void) => (flisteners.add(l), () => flisteners.delete(l));
const empty: string[] = [];
export function useFavorites() {
  const favs = useSyncExternalStore(fsub, fread, () => empty);
  const toggle = (u: string) => {
    const next = favs.includes(u) ? favs.filter((x) => x !== u) : [...favs, u];
    localStorage.setItem(FKEY, JSON.stringify(next));
    fcache = next;
    flisteners.forEach((l) => l());
  };
  return { favs, toggle };
}

export function useHydrated() {
  const [h, setH] = useState(false);
  useEffect(() => setH(true), []);
  return h;
}
