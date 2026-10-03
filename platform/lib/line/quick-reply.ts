// 確認回覆底下的「要歸到哪一場？」按鈕（spec line-group-capture「Quick-reply show buttons on confirmations」）。
// 候選演出跟網頁一樣來自 pickableShows 的 upcoming（下一場第一）；最多 3 顆演出＋「先放著」。按鈕是 postback。

export type LineQuickReply = {
  items: { type: "action"; action: { type: "postback"; label: string; data: string; displayText: string } }[];
};
export type LineTextMessage = { type: "text"; text: string; quickReply?: LineQuickReply };
export type PostbackData = { kind: "idea" | "todo"; id: string; show: string | null };

const MAX_SHOWS = 3;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** 按鈕文字：去掉開頭的「看我笑話 」，最多 20 字（LINE quick reply label 上限）。 */
export function buttonLabel(name: string): string {
  return [...name.replace(/^看我笑話\s+/, "")].slice(0, 20).join("");
}

export function showQuickReply(kind: "idea" | "todo", id: string, upcoming: { id: string; name: string }[]): LineQuickReply | null {
  if (!upcoming.length) return null;
  const shows = upcoming.slice(0, MAX_SHOWS).map((s) => {
    const label = buttonLabel(s.name);
    return { type: "action" as const, action: { type: "postback" as const, label, data: `v=1&t=${kind}&id=${id}&show=${s.id}`, displayText: `歸到 ${label}` } };
  });
  return {
    items: [...shows, { type: "action", action: { type: "postback", label: "先放著", data: `v=1&t=${kind}&id=${id}&show=none`, displayText: "先放著" } }],
  };
}

/** 解析 postback data；版本不是 1 或格式不符回 null（呼叫端記 log 後忽略）。 */
export function parsePostback(data: string): PostbackData | null {
  const p = new URLSearchParams(data);
  const t = p.get("t");
  const id = p.get("id") ?? "";
  const show = p.get("show") ?? "";
  if (p.get("v") !== "1" || (t !== "idea" && t !== "todo") || !UUID.test(id)) return null;
  if (show !== "none" && !UUID.test(show)) return null;
  return { kind: t, id, show: show === "none" ? null : show };
}
