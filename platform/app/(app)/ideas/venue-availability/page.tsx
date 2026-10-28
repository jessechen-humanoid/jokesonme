import Link from "next/link";
import TopBar from "@/components/top-bar";
import VenueCalendar from "@/components/venue-calendar";
import { requirePage } from "@/lib/auth/current";
import { bookings2027 } from "@/lib/venue-availability-2027";

// 2027 卡米地大廳帶狀節目訂場清單＋仿 Google 日曆的月曆，資料在 lib/venue-availability-2027.ts。
export default async function VenueAvailabilityPage() {
  const me = await requirePage("ideas", "/ideas/venue-availability");
  const confirmed = bookings2027.filter((b) => b.status === "已確認").length;

  return (
    <main className="page venue-page">
      <TopBar me={me} title="2027 場地檔期" back={{ href: "/ideas", label: "筆記" }} sub="卡米地大廳｜每月一場帶狀節目" />
      <div className="content">
        <section className="venue-intro">
          <p className="venue-eyebrow">2027 帶狀節目・卡米地大廳</p>
          <h2>10 場，已確認 {confirmed}／10</h2>
          <p>3 到 12 月每月一場，9 場排下午 13:30–17:30，3 月是週日晚上 18:00–22:00。都避開了看我笑話演出日、漫才 open mic 和節日。正在跟卡米地洽詢，確認一場就把那場改成「已確認」。</p>
        </section>

        <VenueCalendar />

        <section className="venue-notes">
          <h2>訂場須知</h2>
          <ul>
            <li>場租：週末公開活動每個時段 21,000 元，10 場合計 210,000 元。含燈光、音響、投影和一名協助人員；超時、超過 150 人、加派技術人員另外計費。</li>
            <li>付清場租才會保留場地。要一次付清還是分月付，要跟卡米地確認。</li>
            <li>取消退費：30 天前全額退，21–29 天前退 7 成，15–20 天前退 5 成，8–14 天前退 3 成，7 天內不退。</li>
            <li>待卡米地回覆：3/13（六）行事曆上只寫「暴羅walk 22:00」，如果那天有空，3 月改到 3/13，距 3/27 看我笑話剛好兩週。</li>
            <li>6/19 看我笑話那場在行事曆上標的是 pR，順便確認是否已確定。</li>
            <li>聯絡：service@comedy.com.tw・02-2500-0900。</li>
          </ul>
          <p className="venue-source">
            資料來源：<a href="https://comedy.com.tw/plus_apply/" target="_blank" rel="noreferrer">卡米地場地租用頁與大廳行事曆</a>（2026/10/28 抓取）・
            <a href="https://www.ettoday.net/news/20260521/3169805.htm" target="_blank" rel="noreferrer">ETtoday：2027 年行事曆</a>
          </p>
        </section>
      </div>
      <Link className="venue-back-link" href="/ideas">回到筆記</Link>
    </main>
  );
}
