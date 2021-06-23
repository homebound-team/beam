import useResizeObserver from "@react-hook/resize-observer";
import { ReactNode, useRef, useState } from "react";
import { FocusScope, OverlayContainer, useDialog, useModal, useOverlay, usePreventScroll } from "react-aria";
import { Button } from "src/components/Button";
import { IconButton } from "src/components/IconButton";
import { useModalContext } from "src/components/Modal/ModalContext";
import { Css } from "src/Css";
import { Noop } from "src/types";
import { useTestIds } from "src/utils";

export interface ModalProps {
  title: string;
  size?: "sm" | "md" | "lg";
  content: ReactNode;
  onClose?: Noop;
}

export function Modal(props: ModalProps) {
  const { title, size = "md", content } = props;
  const width = size === "sm" ? 320 : size === "md" ? 480 : 640;
  const ref = useRef(null);
  const { onClose } = useModalContext();
  const { overlayProps, underlayProps } = useOverlay({ ...props, isOpen: true, onClose, isDismissable: true }, ref);
  const { modalProps } = useModal();
  const { dialogProps, titleProps } = useDialog({ role: "dialog" }, ref);
  const testId = useTestIds({}, testIdPrefix);
  usePreventScroll();

  return (
    <OverlayContainer>
      <div css={Css.underlay.$} {...underlayProps} {...testId.underlay}>
        <FocusScope contain restoreFocus autoFocus>
          <div
            css={Css.br24.bgWhite.bshModal.maxh("90vh").df.flexColumn.wPx(width).$}
            ref={ref}
            {...overlayProps}
            {...dialogProps}
            {...modalProps}
            {...testId}
          >
            <div css={Css.df.p3.$}>
              <h1 css={Css.fg1.xl2Em.gray900.$} {...titleProps} {...testId.title}>
                {title}
              </h1>
              <span css={Css.fs0.pl1.$}>
                <IconButton icon="x" onClick={onClose} {...testId.titleClose} />
              </span>
            </div>
            {content}
          </div>
        </FocusScope>
      </div>
    </OverlayContainer>
  );
}

export type ModalAction = {
  onClick: () => void;
  label: string;
  disabled?: boolean;
};

export interface ModalContentProps {
  children: ReactNode;
  primaryAction: ModalAction;
  leftAction?: ModalAction;
  secondaryAction?: Omit<ModalAction, "disabled">;
  primaryOnly?: boolean;
}

export function ModalContent(props: ModalContentProps) {
  const { onClose } = useModalContext();
  const {
    children,
    primaryAction,
    leftAction,
    primaryOnly,
    secondaryAction = { label: "Cancel", onClick: onClose },
  } = props;
  const contentRef = useRef<HTMLDivElement>(null);
  const [hasScroll, setHasScroll] = useState(false);
  const testId = useTestIds({}, testIdPrefix);

  // This would be great to have work, but seems like the contentRef cannot be added/removed from the DOM or it breaks.
  // Still trying to work on it, though... must be another way around it.
  useResizeObserver(contentRef, ({ target }) => {
    setHasScroll(target.scrollHeight > target.clientHeight);
  });

  return (
    <>
      <div css={Css.px3.overflowYAuto.if(hasScroll).bb.bGray200.$} ref={contentRef} {...testId.content}>
        {children}
      </div>
      <div css={Css.p3.df.itemsCenter.justifyBetween.$}>
        {leftAction && (
          <div>
            <Button
              label={leftAction.label}
              onClick={leftAction.onClick}
              variant="tertiary"
              disabled={leftAction.disabled}
              {...testId.leftAction}
            />
          </div>
        )}
        <div css={Css.ml("auto").df.childGap1.$}>
          {!primaryOnly && (
            <Button
              label={secondaryAction.label}
              onClick={secondaryAction.onClick}
              variant="tertiary"
              {...testId.secondaryAction}
            />
          )}
          <Button
            label={primaryAction.label}
            onClick={primaryAction.onClick}
            disabled={primaryAction.disabled}
            {...testId.primaryAction}
          />
        </div>
      </div>
    </>
  );
}

const testIdPrefix = "modal";
