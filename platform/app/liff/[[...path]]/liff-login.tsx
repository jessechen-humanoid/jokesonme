"use client";

import { useEffect, useState } from "react";

type Liff = {
  init(o: { liffId: string }): Promise<void>;
  isLoggedIn(): boolean;
  login(o?: { redirectUri?: string }): void;
  getIDToken(): string | null;
};

function loadSdk(): Promise<Liff> {
  const w = window as unknown as { liff?: Liff };
  if (w.liff) return Promise.resolve(w.liff);
  return new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = "https://static.line-scdn.net/liff/edge/2/sdk.js";
    s.onload = () => (w.liff ? resolve(w.liff) : reject(new Error("LIFF SDK missing")));
    s.onerror = () => reject(new Error("LIFF SDK failed to load"));
    document.head.appendChild(s);
  });
}

export default function LiffLogin({ liffId, next }: { liffId: string; next: string }) {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const liff = await loadSdk();
        await liff.init({ liffId });
        if (!liff.isLoggedIn()) {
          liff.login({ redirectUri: window.location.href });
          return;
        }
        const idToken = liff.getIDToken();
        if (!idToken) throw new Error("沒有取得 LINE 身分");
        const res = await fetch("/api/auth/liff", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ idToken, next }),
        });
        if (!res.ok) throw new Error(`登入失敗（${res.status}）`);
        const data = (await res.json()) as { next: string };
        if (!cancelled) window.location.replace(data.next);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [liffId, next]);

  return (
    <main className="center">
      <div className="brand" style={{ marginBottom: 12 }}>看我笑話</div>
      {error ? (
        <>
          <div className="notice">{error}</div>
          <a className="btn btn-line btn-block" href={`/login?next=${encodeURIComponent(next)}`}>改用 LINE 登入</a>
        </>
      ) : (
        <p className="page-sub">登入中…</p>
      )}
    </main>
  );
}
