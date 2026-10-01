import { mergeProps, type TrussStyleHash } from "@homebound/truss/runtime";
import { cloneElement, type ReactElement } from "react";
import { useModalContext } from "src/components/Modal/ModalContext";
import { modalBodyFullBleed, modalBodyPaddingX } from "src/components/Modal/modalStyles";
import { Css } from "src/Css";

type ModalFullBleedProps = {
  children: ReactElement;
  /** Skip re-applying `ModalBody` padding on the child. */
  omitPadding?: boolean;
};

/** Cancels `ModalBody` padding so the child spans the modal. An inline-size container, so `100cqw` is the visible width. */
export function ModalFullBleed({ children, omitPadding = false }: ModalFullBleedProps) {
  const { inModal } = useModalContext();
  if (!inModal) return children;

  const { className, style, ...others } = children.props as {
    className?: string;
    style?: Record<string, unknown>;
    [key: string]: unknown;
  };
  return cloneElement(children, {
    ...mergeProps(className, style, {
      ...Css.ctis.$,
      ...modalBodyFullBleed,
      ...(omitPadding ? {} : modalBodyPaddingX),
    } as TrussStyleHash),
    ...others,
  });
}
