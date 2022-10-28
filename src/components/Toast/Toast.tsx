import { useTestIds } from "src/utils";
import { ToastNotice, ToastNoticeProps } from "./ToastNotice";

export interface ToastProps {
  notice: ToastNoticeProps;
}

export function Toast({ notice }: ToastProps) {
  const tid = useTestIds({});

  return (
    <div {...tid.toastWrapper}>
      <ToastNotice {...notice} />
    </div>
  );
}
