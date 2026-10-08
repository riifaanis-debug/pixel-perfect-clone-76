import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { useFavorites, useSections } from "@/lib/data";
import { AccountList, type Row } from "@/components/AccountList";

export const Route = createFileRoute("/favorites")({
  head: () => ({
    meta: [
      { title: "المفضلة — دليل سناب شات" },
      { name: "description", content: "الحسابات التي أضفتها إلى المفضلة على جهازك." },
      { property: "og:title", content: "المفضلة — دليل سناب شات" },
      { property: "og:description", content: "حساباتك المفضلة." },
    ],
  }),
  component: FavPage,
});

function FavPage() {
  const sections = useSections();
  const { favs } = useFavorites();
  const rows = useMemo(() => {
    const map = new Map<string, Row>();
    for (const s of sections) for (const [u, n, l] of s.accounts) if (!map.has(u)) map.set(u, { u, n, l, tag: s.name });
    return favs.map((u) => map.get(u)).filter(Boolean) as Row[];
  }, [sections, favs]);
  return <AccountList key={favs.length === 0 ? "e" : "f"} title="المفضلة" rows={rows} scrollKey="favs" />;
}
