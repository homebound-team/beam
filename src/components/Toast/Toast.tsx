import { Banner } from "src/components/Banner";
import { useTestIds } from "src/utils/useTestIds";
import { useToastContext } from "./ToastContext";

export function Toast() {
  const { setNotice, notice } = useToastContext();
  const tid = useTestIds({}, "toast");
  return <>{notice && <Banner {...notice} {...tid} onClose={() => setNotice(undefined)} />}</>;
}
