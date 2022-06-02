import React, { HTMLAttributes, ReactNode } from "react";
import { Link } from "react-router-dom";
import { isAbsoluteUrl } from "src/utils/index";

export function getButtonOrLink(
  content: ReactNode,
  onClick: (() => void) | string | undefined,
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
    // Button.tsx will pass an `onClick` attribute as part of `attrs` prop.
    <button onClick={onClick} {...attrs}>
      {content}
    </button>
  );
}
