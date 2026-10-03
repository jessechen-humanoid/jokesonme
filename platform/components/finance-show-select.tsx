"use client";
import { useRouter } from "next/navigation";

export default function FinanceShowSelect({ shows, value }: { shows: { id: string; name: string }[]; value: string }) {
  const router = useRouter();
  return (
    <select className="select" aria-label="選擇專案" value={value} onChange={(e) => router.push(`/finance/transactions?show=${e.target.value}`)}>
      {shows.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
    </select>
  );
}
