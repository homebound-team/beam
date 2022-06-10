import { addDays, format, startOfWeek } from "date-fns";
import { Css } from "src/Css";

export function WeekHeader() {
  const start = startOfWeek(new Date());
  const days = [];
  for (let i = 0; i < 7; i++) {
    days.push(addDays(start, i));
  }

  // Copies the existing structure and classes defined by React-Day-Picker. Adds in Beam styling and formatting.
  return (
    <thead className="rdp-head">
      <tr className="rdp-head_row">
        {days.map((day) => (
          <th scope="col" css={Css.p1.pbPx(12).xs.gray400.$} key={format(day, "EEEE")}>
            <span aria-hidden="true">{format(day, "EEEEE")}</span>
            <span className="rdp-vhidden">{format(day, "EEEE")}</span>
          </th>
        ))}
      </tr>
    </thead>
  );
}
