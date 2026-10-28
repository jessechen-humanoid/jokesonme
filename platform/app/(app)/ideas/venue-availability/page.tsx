import Link from "next/link";
import TopBar from "@/components/top-bar";
import VenueCalendar from "@/components/venue-calendar";
import { requirePage } from "@/lib/auth/current";
import { eveningPlan2027 } from "@/lib/venue-availability-2027";

const WEEKDAYS = "日一二三四五六";
const label = (date: string) => `${Number(date.slice(5, 7))}/${Number(date.slice(8, 10))}（${WEEKDAYS[new Date(`${date}T00:00:00Z`).getUTCDay()]}）`;

// 2027 卡米地大廳帶狀節目檔期：每月建議日＋仿 Google 日曆的月曆，資料在 lib/venue-availability-2027.ts。
export default async function VenueAvailabilityPage() {
  const me = await requirePage("ideas", "/ideas/venue-availability");

  return (
    <main className="page venue-page">
      <TopBar me={me} title="2027 場地檔期" back={{ href: "/ideas", label: "筆記" }} sub="卡米地大廳｜每月一場帶狀節目" />
      <div className="content">
        <section className="venue-intro">
          <p className="venue-eyebrow">3–12 月每月一場・不跟看我笑話同日</p>
          <h2>以下午為主，3 月只能週日晚上</h2>
          <p>10 個月裡 9 個月排下午，其中 6 個月是週六下午。3 月整個月只有「3/14 週日晚上」一個合格時段，所以沒辦法全年固定下午。全年都沒撞到節日。黃色色塊是建議日、虛線框是備選。行事曆抓於 2026/10/28，訂之前請再跟卡米地確認。</p>
          <div className="venue-rules">
            <span className="ok">✓ 大廳</span><span className="ok">✓ 週六或週日</span><span className="ok">✓ 不撞漫才 open mic</span><span className="ok">✓ 3–12 月每月一場</span><span className="ok">✓ 不跟看我笑話同日</span>
            <span className="ok">避開節日 10/10</span><span className="part">固定下午 9/10・週六下午 6/10</span><span className="part">間隔至少一週 8/10</span>
          </div>
        </section>

        <VenueCalendar />

        <section className="venue-evening">
          <h2>另一種排法：全部排晚上</h2>
          <p>如果「時段固定」比較重要，10 個月都排得到晚上，但幾乎都是週日晚上（優先順序最低），4、5 月只隔一天，10 月一定撞到連假。所以主推上面的下午排法。</p>
          <div className="vc-table">
            <table>
              <thead><tr><th>月</th><th>日期</th><th>時段</th><th>距看我笑話</th><th>備註</th></tr></thead>
              <tbody>
                {eveningPlan2027.map(([date, gap, note]) => (
                  <tr key={date}>
                    <td className="m">{Number(date.slice(5, 7))}月</td>
                    <td className="d">{label(date)}</td>
                    <td>晚上</td>
                    <td className={gap < 7 ? "bad" : "ok"}>{gap} 天</td>
                    <td className={note.includes("連假") ? "bad" : undefined}>{note || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="venue-notes">
          <h2>怎麼判斷的、哪裡要再確認</h2>
          <ul>
            <li>時段優先順序照你給的：週六晚上 &gt; 週六下午 &gt; 週日下午 &gt; 週日晚上。週六晚上全年只有 11/27 有合格空檔，所以實際上以週六下午為主。</li>
            <li>間隔照你給的：兩週最好，至少一週，最慘一天。只有 4 月（1 天）和 9 月（6 天）不到一週。</li>
            <li>看我笑話有演出的日子整天都不排，包括 9/4、9/5 兩場下午演出。</li>
            <li>早上場（09:00–13:00）不列入，觀眾很難來。</li>
            <li>漫才 open mic 依 2026/11/15 起每兩週的週日晚上推算，不在大廳行事曆上，月曆上的綠色是推算加上去的。大廳行事曆另有每月一次、週四晚上的「漫才Open Mic」，跟週末不衝突。</li>
            <li>「暴羅walk」在 3/12、3/13、7/30、7/31 只標 22:00 一個時間點，看不出實際佔用多久，當作整天不能用。如果 3/13 其實有空，3 月就有週六可以排，值得先問卡米地。</li>
            <li>場次名稱前的 r、R、pr、PR、預 看起來是預約狀態，pr／預 可能只是暫定，一律當作已訂。6/19 看我笑話本身也標 pR，請確認。</li>
            <li>月曆上的時間是各場次在行事曆上的開始時間，多半是進場時間，不一定是開演時間。</li>
          </ul>
          <p className="venue-source">
            資料來源：<a href="https://comedy.com.tw/plus_apply/" target="_blank" rel="noreferrer">卡米地場地租用頁的大廳行事曆</a>（2026/10/28 抓取）・
            <a href="https://www.ettoday.net/news/20260521/3169805.htm" target="_blank" rel="noreferrer">ETtoday：2027 年行事曆</a>
          </p>
        </section>
      </div>
      <Link className="venue-back-link" href="/ideas">回到筆記</Link>
    </main>
  );
}
