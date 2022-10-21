import { useTestIds } from "../../utils";
import { AlertBannerNotice, AlertBannerNoticeProps } from "./AlertBannerNotice";

export interface AlertBannerProps {
  notices: AlertBannerNoticeProps[];
}

export function AlertBanner({ notices }: AlertBannerProps) {
  const tid = useTestIds({});

  return (
    <div {...tid}>
      {notices.map((data) => (
        <AlertBannerNotice {...data} />
      ))}
    </div>
  );
}
