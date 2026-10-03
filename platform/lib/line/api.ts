// LINE Messaging API：這裡只有 reply（不計推播額度）。推播只允許在演出前提醒模組使用（spec: Push only for reminders）。
export async function replyText(replyToken: string, text: string): Promise<void> {
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  if (!token) throw new Error("LINE_CHANNEL_ACCESS_TOKEN 未設定");
  const res = await fetch("https://api.line.me/v2/bot/message/reply", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ replyToken, messages: [{ type: "text", text: text.slice(0, 5000) }] }),
  });
  if (!res.ok) throw new Error(`LINE reply ${res.status}: ${(await res.text()).slice(0, 300)}`);
}

/** 群組成員的 LINE 顯示名稱與大頭照；對方不在群組或查不到時回 null。 */
export async function getGroupMemberProfile(groupId: string, userId: string): Promise<{ displayName: string; pictureUrl: string | null } | null> {
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  if (!token) throw new Error("LINE_CHANNEL_ACCESS_TOKEN 未設定");
  const res = await fetch(`https://api.line.me/v2/bot/group/${encodeURIComponent(groupId)}/member/${encodeURIComponent(userId)}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return null;
  const p = (await res.json()) as { displayName?: string; pictureUrl?: string };
  return p.displayName ? { displayName: p.displayName, pictureUrl: p.pictureUrl ?? null } : null;
}
