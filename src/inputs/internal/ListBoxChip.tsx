import { usePresentationContext } from "src/components/PresentationContext";
import { Css } from "src/Css";

interface ListBoxChipProps {
  label: string;
}

export function ListBoxChip({ label }: ListBoxChipProps) {
  const { fieldProps } = usePresentationContext();

  return (
    <span
      css={Css[fieldProps?.typeScale ?? "sm"].tal.bgGray300.gray900.br16.pxPx(10).pyPx(2).lineClamp1.wbba.$}
      title={label}
    >
      {label}
    </span>
  );
}
