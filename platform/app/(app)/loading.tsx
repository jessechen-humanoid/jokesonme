// 換頁時立即顯示的骨架（spec mobile-first-ui「Instant loading skeleton」）。
// 導覽列在 layout 裡不受影響；伺服器回應到了就換成真正的頁面。
export default function Loading() {
  return (
    <main className="page" aria-busy="true" aria-label="載入中">
      <header className="head skeleton-head">
        <div className="sk sk-light" style={{ width: 64, height: 12 }} />
        <div className="sk sk-light" style={{ width: 120, height: 22, marginTop: 18 }} />
      </header>
      <div className="content">
        {[0, 1, 2].map((i) => (
          <section key={i}>
            <div className="sk" style={{ width: "40%", height: 16 }} />
            <div className="sk" style={{ width: "100%", height: 44, marginTop: 12, borderRadius: 12 }} />
            <div className="sk" style={{ width: "100%", height: 44, marginTop: 8, borderRadius: 12 }} />
          </section>
        ))}
      </div>
    </main>
  );
}
