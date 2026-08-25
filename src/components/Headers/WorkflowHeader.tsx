import { BaseHeader, BaseHeaderProps } from "src/components/Headers/BaseHeader";
import { StepperTabs, StepperTabsProps } from "src/components/StepperTabs";
import { useTestIds } from "src/utils";

export type WorkflowHeaderProps = Omit<BaseHeaderProps, "bottomSlot"> & {
  /** Omit on focused-form pages — the header then has no step strip. */
  stepperTabs?: StepperTabsProps;
};

export function WorkflowHeader(props: WorkflowHeaderProps) {
  const { stepperTabs, ...otherProps } = props;
  const tid = useTestIds(otherProps, "header");
  return (
    <BaseHeader
      {...otherProps}
      bottomSlot={stepperTabs ? <StepperTabs {...stepperTabs} {...tid.stepperTabs} /> : undefined}
    />
  );
}
