// 靈感（spec: idea-library）。群組「#」指令與網頁都會建立；可指派到演出、封存。
import { db, type Actor } from "./supabase.ts";

export type Idea = {
  id: string; text: string; authorUserId: string | null; showId: string | null; createdAt: string; archivedAt: string | null;
  source: { userId: string; sentAt: string } | null;
};

type Row = {
  id: string; text: string; author_user_id: string | null; show_id: string | null; created_at: string; archived_at: string | null;
  line_messages: { user_id: string; sent_at: string } | null;
};

export async function listIdeas(actor: Actor, filter: { showId?: string; library?: boolean; archived?: boolean }): Promise<Idea[]> {
  let q = db(actor).from("ideas").select("id, text, author_user_id, show_id, created_at, archived_at, line_messages(user_id, sent_at)").order("created_at", { ascending: false });
  if (filter.showId) q = q.eq("show_id", filter.showId);
  if (filter.library) q = q.is("show_id", null);
  q = filter.archived ? q.not("archived_at", "is", null) : q.is("archived_at", null);
  const { data, error } = await q.returns<Row[]>();
  if (error) throw new Error(`list ideas: ${error.message}`);
  return (data ?? []).map((r) => ({
    id: r.id, text: r.text, authorUserId: r.author_user_id, showId: r.show_id, createdAt: r.created_at, archivedAt: r.archived_at,
    source: r.line_messages ? { userId: r.line_messages.user_id, sentAt: r.line_messages.sent_at } : null,
  }));
}
