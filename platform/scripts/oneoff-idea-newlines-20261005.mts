// 一次性修復（idea-rich-text task 1.2）：`/靈感` 存靈感時換行被壓掉的那幾則，用 LINE 原始訊息重算內容。
// 預設 dry-run 只列差異；加 --apply 才寫入（actor = migration，留 audit）。
// 用法：node --env-file=.env.local scripts/oneoff-idea-newlines-20261005.mts [--apply]
import { db } from "../lib/supabase.ts";
import { parseCommand } from "../lib/line/commands.ts";

const apply = process.argv.includes("--apply");
const client = db("migration");
const { data, error } = await client.from("ideas").select("id, text, line_messages(text, mentions)").not("line_message_id", "is", null);
if (error) throw error;
type Row = { id: string; text: string; line_messages: { text: string; mentions: { index: number; length: number; userId?: string; isSelf?: boolean }[] } | null };
const fixes: { id: string; before: string; after: string }[] = [];
for (const r of (data ?? []) as unknown as Row[]) {
  const m = r.line_messages;
  if (!m || !/^\s*[/／]\s*靈感/.test(m.text)) continue; // 只處理 /靈感 建的
  const cmd = parseCommand({ text: m.text, mentions: m.mentions ?? [] });
  if (cmd.kind !== "idea" || cmd.text === r.text) continue;
  if (cmd.text.replace(/\s+/g, " ").trim() !== r.text.replace(/\s+/g, " ").trim()) continue; // 內容被人改過就不動
  fixes.push({ id: r.id, before: r.text, after: cmd.text });
}
console.log(`${apply ? "APPLY" : "DRY-RUN"}：${fixes.length} 則要修`);
for (const f of fixes) console.log(`- ${f.id}\n  前：${f.before.slice(0, 60)}…\n  後：${f.after.slice(0, 80).replace(/\n/g, "⏎")}…`);
if (apply) {
  for (const f of fixes) {
    const { error: e } = await client.from("ideas").update({ text: f.after }).eq("id", f.id).eq("text", f.before);
    if (e) throw e;
  }
  console.log("已寫入");
}
