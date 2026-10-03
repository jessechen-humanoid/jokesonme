// LINE 推播：整個專案只有演出前提醒可以用這裡（spec: Push only for reminders）。
// 推播會真的發訊息給群組裡的人，所以預設只預覽：環境變數 REMINDERS_LIVE=1 才真的送出。
export function remindersLive(): boolean {
  return process.env.REMINDERS_LIVE === "1";
}

function token(): string {
  const t = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  if (!t) throw new Error("LINE_CHANNEL_ACCESS_TOKEN 未設定");
  return t;
}

/** 群組人數（推播額度依收件人數計）。 */
export async function groupMemberCount(groupId: string): Promise<number> {
  const res = await fetch(`https://api.line.me/v2/bot/group/${encodeURIComponent(groupId)}/members/count`, { headers: { Authorization: `Bearer ${token()}` } });
  if (!res.ok) throw new Error(`group member count ${res.status}`);
  return Number(((await res.json()) as { count?: number }).count ?? 0);
}

export async function pushToGroup(groupId: string, text: string): Promise<void> {
  if (!remindersLive()) throw new Error("推播尚未開啟（REMINDERS_LIVE 不是 1）");
  const res = await fetch("https://api.line.me/v2/bot/message/push", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}` },
    body: JSON.stringify({ to: groupId, messages: [{ type: "text", text: text.slice(0, 5000) }] }),
  });
  if (!res.ok) throw new Error(`LINE push ${res.status}: ${(await res.text()).slice(0, 200)}`);
}
