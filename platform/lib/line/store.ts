// WebhookStore 的 Supabase 實作；所有寫入的 actor 都是 line-bot。
import { db } from "../supabase.ts";
import { getGroupMemberProfile } from "./api.ts";
import type { CapturedMessage, WebhookStore } from "./webhook.ts";

const GROUP_KEY = "line_group_id";

type MessageRow = {
  id: string; group_id: string; user_id: string; sent_at: string; text: string;
  mentions: CapturedMessage["mentions"]; quoted_message_id: string | null;
};

function fail(what: string, error: { message: string } | null): never {
  throw new Error(`${what}: ${error?.message ?? "unknown error"}`);
}

export function supabaseWebhookStore(): WebhookStore {
  const client = db("line-bot");
  return {
    async getRegisteredGroup() {
      const { data, error } = await client.from("app_settings").select("value").eq("key", GROUP_KEY).maybeSingle();
      if (error) fail("read group", error);
      return data?.value ?? null;
    },
    async registerGroup(groupId) {
      // 用 insert 而非 upsert：已登記就不覆蓋（衝突時忽略）。
      const { error } = await client.from("app_settings").insert({ key: GROUP_KEY, value: groupId });
      if (error && error.code !== "23505") fail("register group", error);
    },
    async saveMessage(m) {
      const { data, error } = await client
        .from("line_messages")
        .upsert(
          {
            id: m.id, group_id: m.groupId, user_id: m.userId, sent_at: m.sentAt, text: m.text,
            mentions: m.mentions, quoted_message_id: m.quotedMessageId,
          },
          { onConflict: "id", ignoreDuplicates: true },
        )
        .select("id");
      if (error) fail("save message", error);
      return (data?.length ?? 0) > 0;
    },
    async getMessage(id) {
      const { data, error } = await client.from("line_messages").select("*").eq("id", id).maybeSingle<MessageRow>();
      if (error) fail("get message", error);
      if (!data) return null;
      return {
        id: data.id, groupId: data.group_id, userId: data.user_id, sentAt: data.sent_at, text: data.text,
        mentions: data.mentions ?? [], quotedMessageId: data.quoted_message_id,
      };
    },
    async createTodo({ title, assigneeUserIds, createdBy, sourceMessageId }) {
      const { data, error } = await client
        .from("todos")
        .insert({ title, source: "command", created_by: createdBy })
        .select("id")
        .single();
      if (error || !data) fail("create todo", error);
      if (assigneeUserIds.length) {
        const { error: e2 } = await client.from("todo_assignees").insert(assigneeUserIds.map((u) => ({ todo_id: data.id, user_id: u })));
        if (e2) fail("assign todo", e2);
      }
      const { error: e3 } = await client.from("todo_sources").insert({ todo_id: data.id, line_message_id: sourceMessageId });
      if (e3) fail("link todo source", e3);
    },
    async ensureUsers(groupId, userIds) {
      const ids = [...new Set(userIds.filter((u) => u && u !== "unknown"))];
      if (!ids.length) return;
      const { data, error } = await client.from("users").select("id").in("id", ids);
      if (error) fail("read users", error);
      const known = new Set((data ?? []).map((r: { id: string }) => r.id));
      for (const id of ids.filter((u) => !known.has(u))) {
        const profile = await getGroupMemberProfile(groupId, id);
        if (!profile) continue;
        const { error: e2 } = await client
          .from("users")
          .insert({ id, display_name: profile.displayName, picture_url: profile.pictureUrl, status: "pending" });
        if (e2 && e2.code !== "23505") fail("insert user stub", e2);
      }
    },
    async createIdea({ text, authorUserId, sourceMessageId }) {
      const { error } = await client.from("ideas").insert({ text, author_user_id: authorUserId, line_message_id: sourceMessageId });
      if (error) fail("create idea", error);
    },
  };
}
