import { Button, ButtonProps } from "src/components/Button";
import { BaseHeader, BaseHeaderProps } from "src/components/Headers/BaseHeader";
import { StepperTabs, StepperTabsProps } from "src/components/StepperTabs";
import { Css } from "src/Css";
import { useTestIds } from "src/utils";

export type WorkflowHeaderProps = Omit<BaseHeaderProps, "rightSlot" | "bottomSlot"> & {
  rightSlot?: ButtonProps[];
  stepperTabs: StepperTabsProps;
};

export function WorkflowHeader(props: WorkflowHeaderProps) {
  const { rightSlot, stepperTabs, ...otherProps } = props;
  const tid = useTestIds(otherProps, "header");
  return (
    <BaseHeader
      {...otherProps}
      rightSlot={
        rightSlot && (
          <div css={Css.df.aic.gap1.$}>
            {rightSlot.map((buttonProps, i) => (
              <Button key={typeof buttonProps.label === "string" ? buttonProps.label : i} {...buttonProps} />
            ))}
          </div>
        )
      }
      bottomSlot={<StepperTabs {...stepperTabs} {...tid.stepperTabs} />}
    />
  );
}
