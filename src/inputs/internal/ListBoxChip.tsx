import { chipBaseStyles } from "src/components";
import { usePresentationContext } from "src/components/PresentationContext";
import { Css } from "src/Css";

interface ListBoxChipProps {
  label: string;
}

export function ListBoxChip({ label }: ListBoxChipProps) {
  const { fieldProps } = usePresentationContext();

  return (
    <span css={{ ...chipBaseStyles(fieldProps?.compact), ...Css.truncate.dib.$ }} title={label}>
      {label}
    </span>
  );
}
