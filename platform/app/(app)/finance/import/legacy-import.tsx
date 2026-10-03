"use client";
// 依序載入 SheetJS → 轉接層 → 原 import.js。只在整頁載入時跑一次（舊程式用全域變數，不能重複執行）。
import { useEffect } from "react";

const SCRIPTS = [
  { src: "https://cdn.sheetjs.com/xlsx-0.20.3/package/dist/xlsx.full.min.js", integrity: "sha384-EnyY0/GSHQGSxSgMwaIPzSESbqoOLSexfnSMN2AP+39Ckmn92stwABZynq1JyzdT" },
  { src: "/legacy/import-shim.js" },
  { src: "/legacy/import.js" },
];

export default function LegacyImport() {
  useEffect(() => {
    const w = window as unknown as { __legacyImportLoaded?: boolean };
    const zone = document.getElementById("cashflow-zone");
    if (zone?.dataset.legacyInit) return; // 同一次掛載被執行兩次（開發模式的 React 會這樣），已處理過
    if (zone) zone.dataset.legacyInit = "1";
    if (w.__legacyImportLoaded) {
      window.location.reload(); // 從別頁用前端導覽回來：舊程式的全域狀態已存在，整頁重新載入最安全
      return;
    }
    w.__legacyImportLoaded = true;
    (async () => {
      for (const s of SCRIPTS) {
        await new Promise<void>((resolve, reject) => {
          const el = document.createElement("script");
          el.src = s.src;
          if (s.integrity) {
            el.integrity = s.integrity;
            el.crossOrigin = "anonymous";
          }
          el.onload = () => resolve();
          el.onerror = () => reject(new Error(`load failed: ${s.src}`));
          document.body.appendChild(el);
        });
      }
    })().catch((e) => console.error("[legacy-import]", e));
  }, []);
  return null;
}
