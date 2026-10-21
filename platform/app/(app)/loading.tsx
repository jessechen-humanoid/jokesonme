// 換頁時立即顯示的骨架（spec mobile-first-ui「Instant loading skeleton」）。
// 導覽列在 layout 裡不受影響；伺服器回應到了就換成真正的頁面。外型對齊精簡頂列。
export default function Loading() {
  return (
    <main className="page" aria-busy="true" aria-label="載入中">
      <header className="topbar">
        <div className="sk" style={{ width: 120, height: 28 }} />
        <div className="sk" style={{ width: 36, height: 36, borderRadius: "50%" }} />
      </header>
      <div className="sk" style={{ width: "100%", height: 46, borderRadius: 12, marginBottom: 14 }} />
      <div className="content">
        {[0, 1, 2].map((i) => (
          <section key={i}>
            <div className="sk" style={{ width: "40%", height: 18 }} />
            <div className="sk" style={{ width: "100%", height: 44, marginTop: 12, borderRadius: 12 }} />
            <div className="sk" style={{ width: "100%", height: 44, marginTop: 8, borderRadius: 12 }} />
          </section>
        ))}
      </div>
    </main>
  );
}
