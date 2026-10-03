"use server";
// 財務寫入（spec: supabase-data-store；規則對照 gas/Code.gs addTransaction / updateTransaction / deleteTransaction / addSettlement / addAdvanceReimbursement）。
import { revalidatePath } from "next/cache";
import { requireAction } from "@/lib/auth/current";
import { db } from "@/lib/supabase";
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, MEMBERS } from "@/lib/finance/calc";
import { syncTaxReserve } from "@/lib/finance/data";

function s(fd: FormData, k: string): string {
  const v = fd.get(k);
  return typeof v === "string" ? v.trim() : "";
}
const isDate = (v: string) => /^\d{4}-\d{2}-\d{2}$/.test(v);

export type ActionResult = { ok: true } | { ok: false; error: string };

/** 正式環境會隱藏 server action 丟出的錯誤訊息，所以改成回傳原因讓畫面顯示。 */
async function guarded(fn: () => Promise<void>): Promise<ActionResult> {
  try {
    await fn();
    return { ok: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[finance action]", msg);
    return { ok: false, error: msg.startsWith("forbidden") ? "沒有權限" : msg };
  }
}

function revalidateFinance() {
  revalidatePath("/finance/transactions");
  revalidatePath("/finance/analytics");
}

export async function saveTransaction(fd: FormData): Promise<ActionResult> {
  return guarded(async () => {
    const me = await requireAction("finance");
    const actor = `user:${me.id}` as const;
    const client = db(actor);
    const id = s(fd, "id");
    const kind = s(fd, "kind") === "income" ? "income" : "expense";
    const category = s(fd, "category");
    const allowed: readonly string[] = kind === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
    if (!allowed.includes(category)) throw new Error("分類不正確");
    const raw = Number(s(fd, "amount"));
    if (!Number.isFinite(raw) || raw <= 0) throw new Error("金額要大於 0");
    const amount = kind === "income" ? raw : -raw;
    const date = s(fd, "date");
    if (!isDate(date)) throw new Error("日期不正確");
    // 規則：收入不能由共同基金支付；共同基金支付的支出沒有墊款人、也不排除任何人
    const paidByFund = kind === "expense" && s(fd, "paid_by_fund") === "1";
    let advancedBy = s(fd, "advanced_by");
    if (advancedBy === "__other") advancedBy = s(fd, "advanced_by_other");
    const included = new Set(fd.getAll("included").filter((v): v is string => typeof v === "string"));
    const excluded = paidByFund ? [] : MEMBERS.filter((m) => !included.has(m));
    if (!paidByFund && excluded.length === MEMBERS.length) throw new Error("至少要有一位成員分配這筆");
    const row = {
      category, notes: s(fd, "notes"), amount, date,
      advanced_by: paidByFund ? null : advancedBy || null,
      excluded_members: excluded,
      paid_by_fund: paidByFund,
      recorded_by: s(fd, "recorded_by") || me.member_name || me.display_name,
    };

    let showId = s(fd, "show_id");
    if (id) {
      const { data: cur, error: e0 } = await client.from("transactions").select("show_id, auto_generated").eq("id", id).is("deleted_at", null).single();
      if (e0 || !cur) throw new Error("找不到這筆收支（可能已被刪除）");
      if (cur.auto_generated) throw new Error("系統自動產生的稅務預留不可編輯");
      showId = cur.show_id;
      const { error } = await client.from("transactions").update(row).eq("id", id);
      if (error) throw new Error(error.message);
    } else {
      if (!showId) throw new Error("請選擇專案");
      const { error } = await client.from("transactions").insert({ ...row, show_id: showId, auto_generated: false });
      if (error) throw new Error(error.message);
    }
    await syncTaxReserve(actor, showId);
    revalidateFinance();
  });
}

export async function deleteTransaction(fd: FormData): Promise<ActionResult> {
  return guarded(async () => {
    const me = await requireAction("finance");
    const actor = `user:${me.id}` as const;
    const client = db(actor);
    const id = s(fd, "id");
    const { data: cur, error: e0 } = await client.from("transactions").select("show_id, auto_generated").eq("id", id).is("deleted_at", null).single();
    if (e0 || !cur) throw new Error("找不到這筆收支（可能已被刪除）");
    if (cur.auto_generated) throw new Error("系統自動產生的稅務預留不可刪除");
    const { error } = await client.from("transactions").update({ deleted_at: new Date().toISOString(), deleted_by: me.id }).eq("id", id);
    if (error) throw new Error(error.message);
    await syncTaxReserve(actor, cur.show_id);
    revalidateFinance();
  });
}

async function addLedger(table: "settlements" | "advance_repayments", fd: FormData) {
  const me = await requireAction("finance");
  const member = s(fd, "member");
  if (!(MEMBERS as readonly string[]).includes(member)) throw new Error("請選擇成員");
  const amount = Number(s(fd, "amount"));
  if (!Number.isFinite(amount) || amount <= 0) throw new Error("金額要大於 0");
  const date = s(fd, "date");
  if (!isDate(date)) throw new Error("日期不正確");
  const { error } = await db(`user:${me.id}`).from(table).insert({ member, amount, date, notes: s(fd, "notes") });
  if (error) throw new Error(error.message);
  revalidateFinance();
}

/** 成員結算：只記利潤分配，不夾帶代墊還款。 */
export async function addSettlement(fd: FormData): Promise<ActionResult> {
  return guarded(() => addLedger("settlements", fd));
}

/** 代墊還款：代墊結清狀態由這本帳 FIFO 推導。 */
export async function addRepayment(fd: FormData): Promise<ActionResult> {
  return guarded(() => addLedger("advance_repayments", fd));
}
