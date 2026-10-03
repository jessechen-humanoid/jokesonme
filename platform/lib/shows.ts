import { db, type Actor } from "./supabase.ts";

export type ShowType = "monthly" | "special" | "other";
export type Show = { id: string; name: string; type: ShowType; performanceDate: string | null; status: string };

export const SHOW_TYPE_LABEL: Record<ShowType, string> = { monthly: "月號", special: "專場", other: "其他" };

export async function listShows(actor: Actor): Promise<Show[]> {
  const { data, error } = await db(actor).from("shows").select("id, name, type, performance_date, status");
  if (error) throw new Error(`list shows: ${error.message}`);
  return (data ?? [])
    .map((r: { id: string; name: string; type: ShowType; performance_date: string | null; status: string }) => ({
      id: r.id, name: r.name, type: r.type, performanceDate: r.performance_date, status: r.status,
    }))
    .sort((a, b) => (b.performanceDate ?? "").localeCompare(a.performanceDate ?? "") || a.name.localeCompare(b.name, "zh-Hant"));
}

/** 從 today 起算最近的一場（含當天）。 */
export function nextShow(shows: Show[], today: string): Show | null {
  return shows.filter((s) => s.performanceDate && s.performanceDate >= today).sort((a, b) => a.performanceDate!.localeCompare(b.performanceDate!))[0] ?? null;
}

export function daysBetween(fromIso: string, toIso: string): number {
  return Math.round((Date.parse(`${toIso}T00:00:00Z`) - Date.parse(`${fromIso}T00:00:00Z`)) / 86400000);
}
