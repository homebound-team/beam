import { Fragment } from "react";
import { Css, Margin, Palette, Xss } from "./Css";

export type IconXss = Xss<Margin | "cursor" | "height" | "width">;
export type IconKey = keyof typeof Icons;
export interface IconProps {
  color?: string;
  icon: IconKey;
  secondaryColor?: string;
  tabIndex?: number;
  testId?: string;
  xss?: IconXss;
}

export const defaultIconProps = {
  color: Palette.Black,
  secondaryColor: Palette.White,
};

export function Icon({
  color = defaultIconProps.color,
  icon,
  secondaryColor = defaultIconProps.secondaryColor,
  tabIndex,
  xss,
  testId,
}: IconProps) {
  return (
    <svg
      tabIndex={tabIndex}
      data-testid={testId || icon}
      css={{
        "#stroke": { stroke: color },
        "#primary": { fill: color },
        "#secondary": { fill: secondaryColor },
        "&:focus": Css.outline0.bw1.bsDashed.bCoolGray900.$,
        ...xss,
      }}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      {Icons[icon]}
    </svg>
  );
}

// Add icon name as key in Icons (alphabetically) and paste the icon svg path
// Replace fill with id="primary" and id="secondary"
// Replace stroke with id="stroke"
export const Icons = {
  account: (
    <path
      id="primary"
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 5C13.66 5 15 6.33999 15 7.99999C15 9.65999 13.66 11 12 11C10.34 11 8.99996 9.65999 8.99996 7.99999C8.99996 6.33999 10.34 5 12 5ZM5.99999 15.98C7.28999 17.92 9.5 19.2 12 19.2C14.5 19.2 16.71 17.92 18 15.98C17.97 13.99 13.99 12.9 12 12.9C10 12.9 6.02999 13.99 5.99999 15.98Z"
    />
  ),
  arrowLeft: <path id="primary" d="M12 20L13.41 18.59L7.83 13H20V11H7.83L13.42 5.42L12 4L4 12L12 20Z" />,
  bell: (
    <path
      id="primary"
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12.2147 22C13.3442 22 14.2683 21.0769 14.2683 19.9487H10.161C10.161 21.0769 11.0749 22 12.2147 22ZM18.3757 15.8462V10.718C18.3757 7.56925 16.6917 4.93335 13.7549 4.23591V3.53847C13.7549 2.68718 13.0669 2 12.2147 2C11.3624 2 10.6744 2.68718 10.6744 3.53847V4.23591C7.7274 4.93335 6.05367 7.559 6.05367 10.718V15.8462L4 17.8975V18.9232H20.4293V17.8975L18.3757 15.8462Z"
    />
  ),
  checkboxOutline: (
    <path
      id="primary"
      clipRule="evenodd"
      fillRule="evenodd"
      d="m22.1662 1.79751v20.32109h-20.30614v-20.32109zm-19.1604-1.79629216c-1.65912-.00067221-3.00374461 1.34546216-3.00121236 3.00458216l.02737236 17.9342c.0025206 1.6515 1.3393 2.9904 2.99075 2.9954l17.94829.0553c1.6594.0051 3.0077-1.3378 3.0093-2.9971l.0169-17.98227c.0015-1.65748-1.3413-3.00215067-2.9988-3.00282222z"
    />
  ),
  checkboxOutlineFill: (
    <Fragment>
      <path
        id="primary"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M3.00449 0.000581986C1.34588 0.000260705 0.00175163 1.34588 0.00391026 3.00449L0.0273427 21.009C0.0295002 22.6668 1.37572 24.0085 3.03343 24.0051L20.9811 23.9687C22.6371 23.9654 23.9772 22.6208 23.975 20.9647L23.951 3.00006C23.9488 1.34499 22.6067 0.00437904 20.9516 0.00405844L3.00449 0.000581986Z"
      />
      <path
        id="secondary"
        d="M9.08471 15.6236L5.29164 11.8306L4 13.1131L9.08471 18.1978L20 7.28255L18.7175 6L9.08471 15.6236Z"
      />
    </Fragment>
  ),
  chevronDown: <path d="M16.59 8L12 12.58L7.41 8L6 9.41L12 15.41L18 9.41L16.59 8Z" id="primary" />,
  chevronLeft: <path d="M15 7.41L10.42 12L15 16.59L13.59 18L7.59 12L13.59 6L15 7.41Z" id="primary" />,
  chevronRight: <path d="M8 7.41L12.58 12L8 16.59L9.41 18L15.41 12L9.41 6L8 7.41Z" id="primary" />,
  chevronUp: <path d="M16.59 15L12 10.42L7.41 15L6 13.59L12 7.59L18 13.59L16.59 15Z" id="primary" />,
  circleQuestionMark: (
    <Fragment>
      <path
        d="M15.5 8C15.5 12.1421 12.1421 15.5 8 15.5C3.85786 15.5 0.5 12.1421 0.5 8C0.5 3.85786 3.85786 0.5 8 0.5C12.1421 0.5 15.5 3.85786 15.5 8Z"
        id="stroke"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M8.64743 9.30816H7.66472C7.65433 8.35688 8.30867 7.96439 8.90694 7.60554C9.40743 7.30533 9.86868 7.02866 9.86868 6.46806C9.86868 5.76234 9.30574 5.33203 8.33258 5.33203C7.22584 5.33203 6.64385 5.9689 6.82513 7.03608H5.77564C5.62299 5.42669 6.59615 4.48 8.3612 4.48C9.94501 4.48 10.88 5.14269 10.88 6.40782C10.88 7.2593 10.2471 7.66992 9.65515 8.05392C9.12829 8.39572 8.63395 8.71643 8.64743 9.30816ZM8.82886 10.8917C8.82886 11.2446 8.51401 11.52 8.14192 11.52C7.75074 11.52 7.44544 11.2446 7.44544 10.8917C7.44544 10.5475 7.75074 10.2807 8.14192 10.2807C8.52355 10.2807 8.82886 10.5475 8.82886 10.8917Z"
        id="primary"
      />
    </Fragment>
  ),
  close: (
    <path
      id="primary"
      d="M18 7.20857L16.7914 6L12 10.7914L7.20857 6L6 7.20857L10.7914 12L6 16.7914L7.20857 18L12 13.2086L16.7914 18L18 16.7914L13.2086 12L18 7.20857Z"
    />
  ),
  filter: (
    <g id="primary">
      <path d="m10 18h4v-2h-4z" />
      <path d="m3 6v2h18v-2z" />
      <path d="m6 13h12v-2h-12z" />
    </g>
  ),
  home: (
    <path d="M12 5.69L17 10.19V18H15V12H9V18H7V10.19L12 5.69ZM12 3L2 12H5V20H11V14H13V20H19V12H22L12 3Z" id="primary" />
  ),
  luggage: (
    <path
      d="M9.5 18H8V9H9.5V18ZM12.75 18H11.25V9H12.75V18ZM16 18H14.5V9H16V18ZM17 6H15V3C15 2.45 14.55 2 14 2H10C9.45 2 9 2.45 9 3V6H7C5.9 6 5 6.9 5 8V19C5 20.1 5.9 21 7 21C7 21.55 7.45 22 8 22C8.55 22 9 21.55 9 21H15C15 21.55 15.45 22 16 22C16.55 22 17 21.55 17 21C18.1 21 19 20.1 19 19V8C19 6.9 18.1 6 17 6ZM10.5 3.5H13.5V6H10.5V3.5ZM17 19H7V8H17V19Z"
      id="primary"
    />
  ),
  reset: (
    <path
      id="primary"
      d="M17.64 6.35C16.19 4.9 14.2 4 11.99 4C7.57 4 4 7.58 4 12C4 16.42 7.57 20 11.99 20C15.72 20 18.83 17.45 19.72 14H17.64C16.82 16.33 14.6 18 11.99 18C8.68 18 5.99 15.31 5.99 12C5.99 8.69 8.68 6 11.99 6C13.65 6 15.13 6.69 16.21 7.78L12.99 11H19.99V4L17.64 6.35Z"
    />
  ),
  style: (
    <Fragment>
      <path
        d="M2.53001 19.65L3.87001 20.21V11.18L1.44001 17.04C1.03001 18.06 1.52001 19.23 2.53001 19.65ZM22.03 15.95L17.07 3.98C16.76 3.23 16.03 2.77 15.26 2.75C15 2.75 14.73 2.79 14.47 2.9L7.10001 5.95C6.35001 6.26 5.89001 6.98 5.87001 7.75C5.86001 8.02 5.91001 8.29 6.02001 8.55L10.98 20.52C11.29 21.28 12.03 21.74 12.81 21.75C13.07 21.75 13.33 21.7 13.58 21.6L20.94 18.55C21.96 18.13 22.45 16.96 22.03 15.95ZM12.83 19.75L7.87001 7.79L15.22 4.75H15.23L20.18 16.7L12.83 19.75Z"
        id="primary"
      />
      <path
        d="M11 10C11.5523 10 12 9.55228 12 9C12 8.44772 11.5523 8 11 8C10.4477 8 10 8.44772 10 9C10 9.55228 10.4477 10 11 10Z"
        id="primary"
      />
      <path d="M5.88 19.75C5.88 20.85 6.78 21.75 7.88 21.75H9.33L5.88 13.41V19.75Z" id="primary" />
    </Fragment>
  ),
  openInNew: (
    <path
      d="M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z"
      fill="#888"
    />
  ),
};
