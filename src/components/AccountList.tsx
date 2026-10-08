import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useWindowVirtualizer } from "@tanstack/react-virtual";
import { ChevronRight, Copy, Link2, Search, Star, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { useFavorites } from "@/lib/data";

export type Row = { u: string; n: string; l: string; tag?: string };

const norm = (s: string) => s.toLowerCase().normalize("NFKD").replace(/[\u064B-\u065F\u0640\u200f\u200e]/g, "");

function copy(text: string, msg: string) {
  navigator.clipboard?.writeText(text).then(() => toast.success(msg), () => toast.error("تعذر النسخ"));
}

export function AccountList({ title, rows, scrollKey }: { title: string; rows: Row[]; scrollKey: string }) {
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<"orig" | "name" | "user">("orig");
  const { favs, toggle } = useFavorites();

  const list = useMemo(() => {
    const nq = norm(q.trim());
    let r = nq ? rows.filter((x) => norm(x.u).includes(nq) || norm(x.n).includes(nq)) : rows;
    if (sort !== "orig") {
      const k = sort === "name" ? "n" : "u";
      r = [...r].sort((a, b) => (a[k] || "￿").localeCompare(b[k] || "￿", "ar"));
    }
    return r;
  }, [rows, q, sort]);

  const ssKey = "scroll:" + scrollKey;
  const v = useWindowVirtualizer({
    count: list.length,
    estimateSize: () => 132,
    overscan: 8,
    initialOffset: () => Number(sessionStorage.getItem(ssKey) || 0),
  });
  useEffect(() => {
    const y = Number(sessionStorage.getItem(ssKey) || 0);
    if (y) requestAnimationFrame(() => window.scrollTo(0, y));
    const on = () => sessionStorage.setItem(ssKey, String(window.scrollY));
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, [ssKey]);

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 border-b border-border bg-background/85 backdrop-blur-xl pt-[env(safe-area-inset-top)]">
        <div className="mx-auto flex max-w-2xl items-center gap-2 px-3 py-2.5">
          <Link to="/" className="grid h-10 w-10 shrink-0 place-items-center rounded-full hover:bg-muted" aria-label="رجوع">
            <ChevronRight className="h-6 w-6" />
          </Link>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-lg font-bold">{title}</h1>
            <p className="text-xs text-muted-foreground">{rows.length.toLocaleString("ar")} حساب{q && ` · ${list.length.toLocaleString("ar")} نتيجة`}</p>
          </div>
        </div>
        <div className="mx-auto flex max-w-2xl gap-2 px-3 pb-3">
          <label className="flex min-w-0 flex-1 items-center gap-2 rounded-xl bg-muted px-3">
            <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="ابحث بالاسم أو اسم المستخدم" className="h-10 min-w-0 flex-1 bg-transparent text-base outline-none" />
          </label>
          <select value={sort} onChange={(e) => setSort(e.target.value as typeof sort)} className="h-10 shrink-0 rounded-xl bg-muted px-2 text-sm outline-none" aria-label="الترتيب">
            <option value="orig">ترتيب الملف</option>
            <option value="name">الاسم</option>
            <option value="user">اسم المستخدم</option>
          </select>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-3 pb-[calc(env(safe-area-inset-bottom)+1.5rem)] pt-3">
        {list.length === 0 ? (
          <p className="py-20 text-center text-muted-foreground">{rows.length ? "لا توجد نتائج مطابقة" : "لا توجد حسابات في هذا القسم"}</p>
        ) : (
          <div style={{ height: v.getTotalSize(), position: "relative" }}>
            {v.getVirtualItems().map((it) => {
              const r = list[it.index];
              const fav = favs.includes(r.u);
              return (
                <div key={it.key} data-index={it.index} ref={v.measureElement} className="absolute inset-x-0 pb-3" style={{ transform: `translateY(${it.start - v.options.scrollMargin}px)` }}>
                  <article className="rounded-2xl border border-border bg-card p-4 shadow-sm">
                    <div className="flex items-start gap-3">
                      <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
                        {(r.n || r.u).trim().charAt(0).toUpperCase() || "؟"}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold" dir="auto">{r.n || <span className="text-muted-foreground">بدون اسم</span>}</p>
                        <button onClick={() => copy(r.u, "تم نسخ اسم المستخدم")} className="flex max-w-full items-center gap-1 text-sm text-muted-foreground" dir="ltr">
                          <span className="truncate">@{r.u}</span>
                          <Copy className="h-3.5 w-3.5 shrink-0" />
                        </button>
                        {r.tag && <span className="mt-1 inline-block rounded-full bg-accent px-2 py-0.5 text-[11px] text-accent-foreground">{r.tag}</span>}
                      </div>
                      <button onClick={() => toggle(r.u)} aria-label="مفضلة" className="grid h-9 w-9 shrink-0 place-items-center rounded-full hover:bg-muted">
                        <Star className={`h-5 w-5 ${fav ? "fill-primary text-primary" : "text-muted-foreground"}`} />
                      </button>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <a href={r.l} target="_blank" rel="noopener noreferrer" className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-primary font-bold text-primary-foreground active:scale-[0.98] transition">
                        <ExternalLink className="h-4 w-4" /> فتح الحساب
                      </a>
                      <button onClick={() => copy(r.l, "تم نسخ الرابط")} aria-label="نسخ الرابط" className="grid h-11 w-11 place-items-center rounded-xl bg-muted">
                        <Link2 className="h-5 w-5" />
                      </button>
                    </div>
                  </article>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
