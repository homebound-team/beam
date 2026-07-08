import { Meta } from "@storybook/react-vite";
import { Breadcrumb, Breadcrumbs } from "src/components/Breadcrumbs";
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

export function CollapsesAtThreeBreadcrumbs() {
  const breadcrumbs: Breadcrumb[] = [
    { label: "Home", href: "" },
    { label: "Projects", href: "" },
    { label: "Project 123", href: "" },
  ];

  return <Breadcrumbs breadcrumbs={breadcrumbs} />;
}

export function CollapsesWithManyLongBreadcrumbs() {
  const breadcrumbs: Breadcrumb[] = [
    { label: "Home", href: "" },
    { label: "A Really Long Project Name - Eastern Subdivision or something", href: "" },
    { label: "An especially long sub section title", href: "" },
    { label: "Oh now we're also deep too", href: "" },
  ];

  return <Breadcrumbs breadcrumbs={breadcrumbs} />;
}
