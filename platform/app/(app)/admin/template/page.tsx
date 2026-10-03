import { requirePage } from "@/lib/auth/current";
import { listTemplateItems } from "@/lib/templates";
import { MEMBER_NAMES } from "@/lib/members";
import Avatar from "@/components/avatar";
import { deleteTemplateItem, saveTemplateItem } from "./actions";

const when = (d: number) => (d < 0 ? `演出前 ${-d} 天` : d > 0 ? `演出後 ${d} 天` : "演出當天");

export default async function TemplatePage() {
  const me = await requirePage("admin", "/admin/template");
  const items = await listTemplateItems(`user:${me.id}`, "monthly");
  return (
    <main className="page">
      <header className="head">
        <div className="head-top"><div className="brand">看我笑話</div><Avatar user={me} /></div>
        <h1 className="page-title">月號模板</h1>
        <p className="page-sub">建立月號（有演出日）時會照這份清單產生待辦，截止日 = 演出日 ± 天數。改模板不影響已經建立的待辦。</p>
      </header>
      <div className="content">
        {items.map((i) => (
          <details key={i.id} className="card">
            <summary style={{ cursor: "pointer", listStyle: "none" }}>
              <div className="title">{i.title}</div>
              <div className="meta"><span className="due">{when(i.offsetDays)}</span>{i.defaultAssignee ? <span className="tag">{i.defaultAssignee}</span> : <span className="tag free">未指定</span>}</div>
            </summary>
            <ItemForm item={i} />
            <form action={deleteTemplateItem} style={{ marginTop: 8 }}>
              <input type="hidden" name="id" value={i.id} />
              <button className="btn btn-danger" type="submit">刪除這項</button>
            </form>
          </details>
        ))}
        <div className="section"><b>新增項目</b></div>
        <div className="card"><ItemForm /></div>
      </div>
    </main>
  );
}

function ItemForm({ item }: { item?: { id: string; title: string; offsetDays: number; defaultAssignee: string | null } }) {
  return (
    <form action={saveTemplateItem} style={{ marginTop: 12 }}>
      {item ? <input type="hidden" name="id" value={item.id} /> : null}
      <label className="field"><span>項目名稱</span><input className="input" name="title" required maxLength={100} defaultValue={item?.title ?? ""} /></label>
      <label className="field"><span>天數（演出前填負數，例如 -7；演出後填正數）</span><input className="input" name="offset_days" type="number" inputMode="numeric" required min={-120} max={60} defaultValue={item?.offsetDays ?? -7} /></label>
      <label className="field">
        <span>預設負責人</span>
        <select className="select" name="default_assignee" defaultValue={item?.defaultAssignee ?? ""}>
          <option value="">不指定（未認領）</option>
          {MEMBER_NAMES.map((n) => <option key={n} value={n}>{n}</option>)}
        </select>
      </label>
      <button className="btn btn-primary" type="submit">{item ? "儲存" : "新增"}</button>
    </form>
  );
}
