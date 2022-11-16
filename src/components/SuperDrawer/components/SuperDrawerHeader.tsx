import { PropsWithChildren } from "react";
import { createPortal } from "react-dom";
import { useBeamContext } from "src/components/BeamContext";
import { ButtonGroup } from "src/components/ButtonGroup";
import { OpenInDrawerOpts } from "src/components/SuperDrawer/useSuperDrawer";
import { Css } from "src/Css";
import { useTestIds } from "src/utils";

interface SuperDrawerHeaderProps {
  hideControls?: boolean;
}

export function SuperDrawerHeader(props: PropsWithChildren<SuperDrawerHeaderProps>): JSX.Element {
  const { children, hideControls } = props;
  const { sdHeaderDiv, drawerContentStack: contentStack } = useBeamContext();
  const firstContent = contentStack.current[0]?.opts as OpenInDrawerOpts;
  const { onPrevClick, onNextClick } = firstContent ?? {};
  const currentContent = contentStack.current[contentStack.current.length - 1]?.opts;
  const isDetail = currentContent !== firstContent;
  const tid = useTestIds({}, "superDrawerHeader");

  return createPortal(
    <div css={Css.df.aic.jcsb.gap3.$} {...tid}>
      <div css={Css.fg1.$}>{children}</div>
      {!hideControls && (
        <div css={Css.fs0.if(isDetail).invisible.$}>
          <ButtonGroup
            buttons={[
              { icon: "chevronLeft", onClick: () => onPrevClick && onPrevClick(), disabled: !onPrevClick },
              { icon: "chevronRight", onClick: () => onNextClick && onNextClick(), disabled: !onNextClick },
            ]}
            {...tid.actions}
          />
        </div>
      )}
    </div>,
    sdHeaderDiv,
  );
}
