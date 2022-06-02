import { PressEvent } from "@react-types/shared";
import React, { HTMLAttributes, ReactNode } from "react";
import { Link } from "react-router-dom";
import { isAbsoluteUrl } from "src/utils/index";

export function getButtonOrLink(
  content: ReactNode,
  // PressEvent set by React-Aria's `useButton`.
  onClick: ((e: PressEvent) => void) | VoidFunction | string | undefined,
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
    // Cast `onClick` as VoidFunction this is the type if will be if not overwritten by `attrs` (which happens via Button.tsx)
    // Type `(e: PressEvent) => {}` is only used but Button.tsx, which passes the `onClick` prop as part of the `attrs`.
    <button onClick={onClick as VoidFunction} {...attrs}>
      {content}
    </button>
  );
}
