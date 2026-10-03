import { requirePage } from "@/lib/auth/current";
import Avatar from "@/components/avatar";

// 靈感庫頁面在 task 8.1 完成；群組裡的 # 指令已經在存了。
export default async function IdeasPage() {
  const me = await requirePage("ideas", "/ideas");
  return (
    <main className="page">
      <header className="head">
        <div className="head-top"><div className="brand">看我笑話</div><Avatar user={me} /></div>
        <h1 className="page-title">靈感庫</h1>
        <p className="page-sub">頁面製作中。群組裡用「#內容」存的靈感都已經記下來了。</p>
      </header>
    </main>
  );
}
