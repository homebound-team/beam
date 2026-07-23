import { BaseHeader, BaseHeaderProps } from "src/components/Headers/BaseHeader";
import { StepperTabs, StepperTabsProps } from "src/components/StepperTabs";
import { useTestIds } from "src/utils";

export type WorkflowHeaderProps = Omit<BaseHeaderProps, "bottomSlot"> & {
  stepperTabs: StepperTabsProps;
};

export function WorkflowHeader(props: WorkflowHeaderProps) {
  const { stepperTabs, ...otherProps } = props;
  const tid = useTestIds(otherProps, "header");
  return <BaseHeader {...otherProps} bottomSlot={<StepperTabs {...stepperTabs} {...tid.stepperTabs} />} />;
}
