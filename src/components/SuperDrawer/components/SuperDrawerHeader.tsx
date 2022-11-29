import { ReactNode } from "react";
import { createPortal } from "react-dom";
import { useBeamContext } from "src/components/BeamContext";
import { ButtonGroup } from "src/components/ButtonGroup";
import { OpenInDrawerOpts } from "src/components/SuperDrawer/useSuperDrawer";
import { Css } from "src/Css";
import { useTestIds } from "src/utils";

interface SuperDrawerHeaderProps {
  children: ReactNode;
  hideControls?: boolean;
}

interface SuperDrawerHeaderStructuredProps {
  title: string;
  left?: ReactNode;
  right?: ReactNode;
  hideControls?: boolean;
}

export function SuperDrawerHeader(props: SuperDrawerHeaderProps | SuperDrawerHeaderStructuredProps): JSX.Element {
  const { hideControls } = props;
  const { sdHeaderDiv, drawerContentStack: contentStack } = useBeamContext();
  const firstContent = contentStack.current[0]?.opts as OpenInDrawerOpts;
  const { onPrevClick, onNextClick } = firstContent ?? {};
  const currentContent = contentStack.current[contentStack.current.length - 1]?.opts;
  const isDetail = currentContent !== firstContent;
  const tid = useTestIds({}, "superDrawerHeader");

  return createPortal(
    <div css={Css.df.aic.jcsb.gap3.$} {...tid}>
      {isStructuredProps(props) ? (
        <div css={Css.df.jcsb.aic.gap2.fg1.$}>
          <div css={Css.fg1.df.aic.gap2.$}>
            <h1>{props.title}</h1>
            {props.left}
          </div>
          {props.right && <div css={Css.fs0.$}>{props.right}</div>}
        </div>
      ) : (
        <div css={Css.fg1.$}>{props.children}</div>
      )}
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

function isStructuredProps(
  props: SuperDrawerHeaderProps | SuperDrawerHeaderStructuredProps,
): props is SuperDrawerHeaderStructuredProps {
  return typeof props === "object" && "title" in props;
}
