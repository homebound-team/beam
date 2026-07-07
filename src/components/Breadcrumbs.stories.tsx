import { Meta } from "@storybook/react-vite";
import { Breadcrumb, Breadcrumbs } from "src/components/Breadcrumbs";
import { Css } from "src/Css";
import { withRouter } from "src/utils/sb";

export default {
  component: Breadcrumbs,
  decorators: [withRouter()],
} as Meta;

export function Default() {
  const breadcrumbs: Breadcrumb[] = [
    { label: "Home", href: "" },
    { label: "Projects", href: "" },
    { label: "Project 123", href: "" },
  ];

  return <Breadcrumbs breadcrumbs={breadcrumbs} />;
}

export function SingleBreadcrumb() {
  return <Breadcrumbs breadcrumbs={{ label: "Home", href: "" }} />;
}

export function TruncatesWhenNarrow() {
  const breadcrumbs: Breadcrumb[] = [
    { label: "Home", href: "" },
    { label: "A Really Long Project Name That Should Truncate", href: "" },
    { label: "Sub Section", href: "" },
  ];

  return (
    <div css={Css.wPx(320).$}>
      <Breadcrumbs breadcrumbs={breadcrumbs} />
    </div>
  );
}
