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
    { label: "Projects", href: "" },
    { label: "Project 123", href: "" },
  ];

  return <Breadcrumbs breadcrumbs={breadcrumbs} />;
}

export function SingleBreadcrumb() {
  return <Breadcrumbs breadcrumbs={{ label: "Home", href: "" }} />;
}

// On desktop this doesn't collapse (threshold is 4), so all 3 render. Resize the
// preview below 600px to see it collapse to `Home / ... / Project 123`, since
// mobile's threshold is still 3.
export function ThreeBreadcrumbs() {
  const breadcrumbs: Breadcrumb[] = [
    { label: "Home", href: "" },
    { label: "Projects", href: "" },
    { label: "Project 123", href: "" },
  ];

  return <Breadcrumbs breadcrumbs={breadcrumbs} />;
}

// On desktop, collapses to the first two crumbs + "..." + last. Resize the
// preview below 600px to see it drop to just the first crumb + "..." + last.
export function CollapsesWithManyLongBreadcrumbs() {
  const breadcrumbs: Breadcrumb[] = [
    { label: "Home", href: "" },
    { label: "A Really Long Project Name - Eastern Subdivision or something", href: "" },
    { label: "An especially long sub section title", href: "" },
    { label: "Oh now we're also deep too", href: "" },
  ];

  return <Breadcrumbs breadcrumbs={breadcrumbs} />;
}

// Only the last breadcrumb truncates when the row runs out of room; earlier
// crumbs keep their natural size (and would wrap, not truncate, if too long).
export function TruncatesOnlyTheLastBreadcrumb() {
  const breadcrumbs: Breadcrumb[] = [
    { label: "Home", href: "" },
    { label: "Projects", href: "" },
    { label: "A Really Long Project Name That Should Ellipsize Instead Of Wrapping Onto Another Line", href: "" },
  ];

  return (
    <div css={Css.wPx(320).$}>
      <Breadcrumbs breadcrumbs={breadcrumbs} />
    </div>
  );
}
