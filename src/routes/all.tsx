import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { useSections } from "@/lib/data";
import { AccountList } from "@/components/AccountList";

export const Route = createFileRoute("/all")({
  head: () => ({
    meta: [
      { title: "جميع الحسابات — دليل سناب شات" },
      { name: "description", content: "كل الحسابات من جميع الأقسام مع تصنيف كل حساب." },
      { property: "og:title", content: "جميع الحسابات — دليل سناب شات" },
      { property: "og:description", content: "كل الحسابات من جميع الأقسام." },
    ],
  }),
  component: AllPage,
});

function AllPage() {
  const sections = useSections();
  const rows = useMemo(() => sections.flatMap((s) => s.accounts.map(([u, n, l]) => ({ u, n, l, tag: s.name }))), [sections]);
  return <AccountList title="جميع الحسابات" rows={rows} scrollKey="all" />;
}
