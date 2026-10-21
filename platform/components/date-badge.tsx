// 日期徽章：上面「11 月」、下面大字「7」；沒有日期顯示「未定」。
export default function DateBadge({ date }: { date: string | null }) {
  if (!date) return <span className="date-badge none"><b>未定</b></span>;
  return (
    <span className="date-badge" aria-hidden="true">
      <small>{Number(date.slice(5, 7))} 月</small>
      <b>{Number(date.slice(8, 10))}</b>
    </span>
  );
}
