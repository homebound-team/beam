import { Css } from "src/Css";
import { formatPlainDate, todayPlainDate } from "src/utils/plainDate";

export function WeekHeader() {
  const today = todayPlainDate();
  const start = today.subtract({ days: today.dayOfWeek % 7 });
  const days = [];
  for (let i = 0; i < 7; i++) {
    days.push(start.add({ days: i }));
  }

  // Copies the existing structure and classes defined by React-Day-Picker. Adds in Beam styling and formatting.
  return (
    <thead className="rdp-head">
      <tr className="rdp-head_row">
        {days.map((day) => (
          <th scope="col" css={Css.p1.pbPx(12).xs.gray400.$} key={formatPlainDate(day, "EEEE")}>
            <span aria-hidden="true">{formatPlainDate(day, "EEEEE")}</span>
            <span className="rdp-vhidden">{formatPlainDate(day, "EEEE")}</span>
          </th>
        ))}
      </tr>
    </thead>
  );
}
