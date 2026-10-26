import Link from "next/link";
import TopBar from "@/components/top-bar";
import VenueCalendar from "@/components/venue-calendar";
import { requirePage } from "@/lib/auth/current";

// 2027 卡米地大廳帶狀節目檔期：每月建議日＋仿 Google 日曆的月曆，資料在 lib/venue-availability-2027.ts。
export default async function VenueAvailabilityPage() {
  const me = await requirePage("ideas", "/ideas/venue-availability");

  return (
    <main className="page venue-page">
      <TopBar me={me} title="2027 場地檔期" back={{ href: "/ideas", label: "筆記" }} sub="卡米地大廳｜每月一場帶狀節目" />
      <div className="content">
        <section className="venue-intro">
          <p className="venue-eyebrow">3–12 月每月一場</p>
          <h2>全部排下午場（13:30–17:30）</h2>
          <p>10 個月裡有 8 個月是週六下午；6 月和 9 月週六下午全被訂走，改週日下午。黃色色塊是建議日、虛線框是備選。行事曆抓於 2026/10/27，訂之前請再跟卡米地確認。</p>
          <div className="venue-rules">
            <span className="ok">✓ 大廳</span><span className="ok">✓ 週六或週日</span><span className="ok">✓ 不撞漫才 open mic</span><span className="ok">✓ 3–12 月每月一場</span>
            <span className="part">避開節日 9/10</span><span className="part">固定週六下午 8/10</span><span className="part">間隔兩週或同日 8/10</span>
          </div>
        </section>

        <VenueCalendar />

        <section className="venue-notes">
          <h2>怎麼判斷的、哪裡要再確認</h2>
          <ul>
            <li>早上場（09:00–13:00）不列入推薦，觀眾很難來。</li>
            <li><b>3/27、4/24 這兩個同日建議不能直接再訂下午場。</b>看我笑話那天是 17:00 進場，跟下午場 13:30–17:30 重疊半小時，要請卡米地把下午場跟原本的晚場接起來租。</li>
            <li>漫才 open mic 依 2026/11/15 起每兩週的週日晚上推算，不在大廳行事曆上（2026/11/15 晚上大廳是別人的演出），月曆上的綠色是推算加上去的。推薦日都是下午，不會撞到。</li>
            <li>大廳行事曆另外有每月一次、週四晚上的「漫才Open Mic」，推薦日都在週末，不衝突。</li>
            <li>「暴羅walk」在 3/12、3/13、7/30、7/31 只標 22:00 一個時間點，看不出實際佔用多久，當作整天不能用。</li>
            <li>場次名稱前的 r、R、pr、PR、預 看起來是預約狀態，pr／預 可能只是暫定，一律當作已訂。6/19 看我笑話本身也標 pR，請確認。</li>
            <li>月曆上的時間是各場次在行事曆上的開始時間，多半是進場時間，不一定是開演時間。</li>
          </ul>
          <p className="venue-source">
            資料來源：<a href="https://comedy.com.tw/plus_apply/" target="_blank" rel="noreferrer">卡米地場地租用頁的大廳行事曆</a>（2026/10/27 抓取）・
            <a href="https://www.ettoday.net/news/20260521/3169805.htm" target="_blank" rel="noreferrer">ETtoday：2027 年行事曆</a>
          </p>
        </section>
      </div>
      <Link className="venue-back-link" href="/ideas">回到筆記</Link>
    </main>
  );
}
