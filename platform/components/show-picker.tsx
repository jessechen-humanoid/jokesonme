"use client";
// 共用的「選演出」面板（spec show-picker「Web show picker control」）：
// 下一場第一並標「下一場」→ 其餘接下來的演出（最多 5 顆）→「更多…」展開已演出／沒日期／已歸檔 → 可選「不掛演出」。
// 候選清單由伺服器用 pickableShows 算好傳進來；這裡只負責呈現與選取。
import { useState } from "react";
import { formatMonthDay } from "@/lib/dates";

import type { PickerData, PickerShow } from "@/lib/shows";
export type { PickerData } from "@/lib/shows";

const MAX_UPCOMING = 5;

export default function ShowPicker({
  data, value, onChange, allowNone = true, name,
}: {
  data: PickerData; value: string | null; onChange: (id: string | null) => void; allowNone?: boolean; name?: string;
}) {
  const rest = data.upcoming.filter((s) => s.id !== data.next?.id).slice(0, MAX_UPCOMING);
  const inShort = new Set([data.next?.id, ...rest.map((s) => s.id)]);
  const selectedInMore = value !== null && !inShort.has(value);
  const [showMore, setShowMore] = useState(selectedInMore);
  const chip = (s: PickerShow, label?: string) => (
    <button
      key={s.id}
      type="button"
      className={`pick-chip ${value === s.id ? "on" : ""}`}
      aria-pressed={value === s.id}
      onClick={() => onChange(s.id)}
    >
      {label ? <small>{label}</small> : null}
      <span>{s.name}</span>
      {s.performanceDate ? <em>{formatMonthDay(s.performanceDate)}</em> : null}
    </button>
  );

  return (
    <div className="show-picker">
      {name ? <input type="hidden" name={name} value={value ?? ""} /> : null}
      <div className="pick-chips">
        {data.next ? chip(data.next, "下一場") : null}
        {rest.map((s) => chip(s))}
        {allowNone ? (
          <button type="button" className={`pick-chip ${value === null ? "on" : ""}`} aria-pressed={value === null} onClick={() => onChange(null)}>
            <span>不掛演出</span>
          </button>
        ) : null}
        {data.more.length ? (
          <button type="button" className="pick-chip ghost" aria-expanded={showMore} onClick={() => setShowMore((v) => !v)}>
            <span>{showMore ? "收起" : `更多…（${data.more.length}）`}</span>
          </button>
        ) : null}
      </div>
      {!data.next && !data.upcoming.length ? <p className="pick-hint">還沒有排日期的下一場演出，可以到「演出」補上日期。</p> : null}
      {showMore ? (
        <div className="pick-more" role="listbox" aria-label="其他演出">
          {data.more.map((s) => (
            <button key={s.id} type="button" role="option" aria-selected={value === s.id} className={`pick-row ${value === s.id ? "on" : ""}`} onClick={() => onChange(s.id)}>
              <span>{s.name}</span>
              <em>{s.performanceDate ? formatMonthDay(s.performanceDate) : "沒有日期"}</em>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
