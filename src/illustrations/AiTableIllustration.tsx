import { Css } from "src/Css";

type AiTableIllustrationProps = {
  /** Width in px. Defaults to the artwork's natural 349px; height follows the `viewBox`. */
  width?: number;
};

/** Empty-state artwork of a table with AI sparkles, e.g. for an empty AI-generated table. */
export function AiTableIllustration(props: AiTableIllustrationProps) {
  const { width = 349 } = props;
  return (
    <svg
      viewBox="0 0 349 197"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      aria-hidden
      role="presentation"
      css={Css.wPx(width).maxw100.h("auto").$}
    >
      {/* A dashed card behind the table, which hides its lower-left */}
      <rect
        x="136.78"
        y="22.45"
        width="128.37"
        height="126.07"
        rx="7.38"
        stroke="#C1B2F9"
        strokeWidth="2.54"
        strokeLinecap="round"
        strokeDasharray="3.8 7.72"
        strokeDashoffset="3.8"
      />
      <rect x="96.22" y="41.46" width="144.5" height="129.41" rx="7.95" fill="white" />
      <path
        d="M96.22 64.17V49.42A7.95 7.95 0 0 1 104.17 41.46H232.77A7.95 7.95 0 0 1 240.72 49.42V64.17Z"
        fill="#E2DFF5"
      />
      <circle cx="115.97" cy="78.34" r="4.91" fill="#B6B2E1" />
      <circle cx="115.97" cy="104.77" r="4.91" fill="#B6B2E1" />
      <circle cx="115.97" cy="131.19" r="4.91" fill="#B6B2E1" />
      <path
        d="M96.22 64.17H240.72M135.63 64.17V170.87M195.78 41.46V170.87M96.22 91.48H240.72M96.22 117.87H240.72M96.22 144.37H240.72"
        stroke="#7A7FA8"
        strokeWidth="2.54"
      />
      <rect x="96.22" y="41.46" width="144.5" height="129.41" rx="7.95" stroke="#7A7FA8" strokeWidth="2.54" />
      <path
        d="M66.17 20.23L68.14 11.26A1.4 1.4 0 0 1 70.87 11.26L72.85 20.23L81.32 22.16A1.41 1.41 0 0 1 81.32 24.91L72.85 26.84L70.87 35.81A1.4 1.4 0 0 1 68.14 35.81L66.17 26.84L57.69 24.91A1.41 1.41 0 0 1 57.69 22.16Z"
        fill="#9357FD"
      />
      <path
        d="M70.85 70.65L72.08 65.07A0.86 0.86 0 0 1 73.76 65.07L74.99 70.65L80.19 71.84A0.87 0.87 0 0 1 80.19 73.54L74.99 74.74L73.76 80.31A0.86 0.86 0 0 1 72.08 80.31L70.85 74.74L65.64 73.54A0.87 0.87 0 0 1 65.64 71.84Z"
        fill="#A475FD"
      />
      <path
        d="M287.22 122.98L288.89 115.34A1.16 1.16 0 0 1 291.15 115.34L292.82 122.98L299.71 124.58A1.18 1.18 0 0 1 299.71 126.87L292.82 128.47L291.15 136.1A1.16 1.16 0 0 1 288.89 136.1L287.22 128.47L280.33 126.87A1.18 1.18 0 0 1 280.33 124.58Z"
        fill="#955BFD"
      />
    </svg>
  );
}
