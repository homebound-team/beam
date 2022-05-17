import { PressEvent } from "@react-types/shared";
import { HTMLAttributes, ReactNode } from "react";
import { Link } from "react-router-dom";
import { isAbsoluteUrl } from "src/utils/index";

export function getButtonOrLink(
  content: ReactNode,
  onClick: ((e: PressEvent) => void) | string,
  attrs: HTMLAttributes<HTMLButtonElement | HTMLAnchorElement>,
  openInNew: boolean = false,
  downloadLink: boolean = false,
): JSX.Element {
  return typeof onClick === "string" ? (
    isAbsoluteUrl(onClick) || openInNew || downloadLink ? (
      <a
        {...attrs}
        href={onClick}
        {...(downloadLink ? { download: "" } : { target: "_blank", rel: "noreferrer noopener" })}
      >
        {content}
      </a>
    ) : (
      <Link {...attrs} to={onClick}>
        {content}
      </Link>
    )
  ) : (
    <button {...attrs}>{content}</button>
  );
}
