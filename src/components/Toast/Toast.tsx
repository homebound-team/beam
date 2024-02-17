import { Banner } from "src/components";
import { useTestIds } from "src/utils";
import { useToastContext } from "./ToastContext";

export function Toast() {
  const { setNotice, notice } = useToastContext();
  const tid = useTestIds({}, "toast");
  return <>{notice && <Banner {...notice} {...tid} onClose={() => setNotice(undefined)} />}</>;
}
