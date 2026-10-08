import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { useSections } from "@/lib/data";
import { AccountList } from "@/components/AccountList";

export const Route = createFileRoute("/section/$id")({
  head: () => ({
    meta: [
      { title: "قسم الحسابات — دليل سناب شات" },
      { name: "description", content: "قائمة حسابات القسم مع البحث والترتيب وروابط الإضافة." },
      { property: "og:title", content: "قسم الحسابات — دليل سناب شات" },
      { property: "og:description", content: "قائمة حسابات القسم مع روابط الإضافة." },
    ],
  }),
  component: SectionPage,
});

function SectionPage() {
  const { id } = Route.useParams();
  const s = useSections().find((x) => x.id === id);
  const rows = useMemo(() => (s ? s.accounts.map(([u, n, l]) => ({ u, n, l })) : []), [s]);
  if (!s)
    return (
      <div className="p-10 text-center">
        <p className="mb-4">القسم غير موجود</p>
        <Link to="/" className="text-primary underline">الرئيسية</Link>
      </div>
    );
  return <AccountList key={id} title={s.name} rows={rows} scrollKey={id} />;
}
