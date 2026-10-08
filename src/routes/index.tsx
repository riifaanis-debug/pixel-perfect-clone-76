import { createFileRoute, Link } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { ChevronLeft, Star, Layers, Upload, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { iconFor, parseExcel, setOverride, useSections, useFavorites, useHydrated, hasOverride } from "@/lib/data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "دليل حسابات سناب شات" },
      { name: "description", content: "استعرض حساباتك في سناب شات مصنفة حسب الأقسام مع روابط الإضافة المباشرة." },
      { property: "og:title", content: "دليل حسابات سناب شات" },
      { property: "og:description", content: "استعرض حساباتك في سناب شات مصنفة حسب الأقسام." },
    ],
  }),
  component: Home,
});

function Home() {
  const sections = useSections();
  const { favs } = useFavorites();
  const hydrated = useHydrated();
  const total = sections.reduce((s, x) => s + x.accounts.length, 0);
  const fileRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);

  async function onFile(f?: File) {
    if (!f) return;
    setLoading(true);
    try {
      setOverride(await parseExcel(f));
      toast.success("تم استيراد الملف بنجاح");
    } catch (e) {
      toast.error("تعذر قراءة الملف: " + (e as Error).message);
    } finally {
      setLoading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <main className="mx-auto max-w-2xl px-4 pb-[calc(env(safe-area-inset-bottom)+2rem)] pt-[calc(env(safe-area-inset-top)+1.5rem)]">
      <div className="mb-6 flex items-center gap-3">
        <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-primary text-3xl">👻</div>
        <div className="min-w-0">
          <h1 className="text-2xl font-extrabold">دليل حسابات سناب شات</h1>
          <p className="text-sm text-muted-foreground">إجمالي الحسابات: <b className="text-foreground">{total.toLocaleString("ar")}</b></p>
        </div>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-3">
        <Link to="/all" className="flex items-center gap-3 rounded-2xl bg-primary p-4 text-primary-foreground active:scale-[0.98] transition">
          <Layers className="h-6 w-6 shrink-0" />
          <div className="min-w-0"><p className="font-bold">جميع الحسابات</p><p className="text-xs opacity-80">{total.toLocaleString("ar")}</p></div>
        </Link>
        <Link to="/favorites" className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 active:scale-[0.98] transition">
          <Star className="h-6 w-6 shrink-0 fill-primary text-primary" />
          <div className="min-w-0"><p className="font-bold">المفضلة</p><p className="text-xs text-muted-foreground">{hydrated ? favs.length.toLocaleString("ar") : "—"}</p></div>
        </Link>
      </div>

      <h2 className="mb-2 px-1 text-sm font-semibold text-muted-foreground">الأقسام</h2>
      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        {sections.map((s, i) => (
          <Link key={s.id} to="/section/$id" params={{ id: s.id }} className={`flex items-center gap-3 p-4 active:bg-muted transition ${i ? "border-t border-border" : ""}`}>
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-muted text-xl">{iconFor(s.name)}</span>
            <span className="min-w-0 flex-1 truncate font-semibold">{s.name}</span>
            <span className="shrink-0 rounded-full bg-primary/20 px-2.5 py-0.5 text-sm font-bold">{s.accounts.length.toLocaleString("ar")}</span>
            <ChevronLeft className="h-5 w-5 shrink-0 text-muted-foreground" />
          </Link>
        ))}
      </div>

      <div className="mt-6 flex flex-col gap-2">
        <input ref={fileRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />
        <button disabled={loading} onClick={() => fileRef.current?.click()} className="flex h-12 items-center justify-center gap-2 rounded-xl border border-border bg-card font-semibold disabled:opacity-60">
          <Upload className="h-4 w-4" /> {loading ? "جارٍ الاستيراد…" : "استيراد ملف Excel جديد"}
        </button>
        {hydrated && hasOverride() && (
          <button onClick={() => setOverride(null)} className="flex h-10 items-center justify-center gap-2 text-sm text-muted-foreground">
            <RotateCcw className="h-4 w-4" /> الرجوع إلى الملف الأصلي
          </button>
        )}
        <p className="text-center text-xs text-muted-foreground">تتم معالجة الملف داخل جهازك فقط ولا يُرسل لأي خادم.</p>
      </div>
    </main>
  );
}
