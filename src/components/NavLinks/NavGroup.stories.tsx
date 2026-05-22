import { Meta } from "@storybook/react-vite";
import { useState } from "react";
import { NavGroup, NavGroupLink } from "src/components/NavLinks/NavGroup";
import { Css } from "src/Css";
import { withRouter } from "src/utils/sb";

export default {
  component: NavGroup,
  decorators: [withRouter()],
  globals: {
    backgrounds: {
      value: "white",
    },
  },
} as Meta;

const defaultLinks: NavGroupLink[] = [
  { label: "Budget", href: "/budget" },
  { label: "POs", href: "/pos" },
  { label: "Change Events", href: "/change-events" },
];

export function Collapsed() {
  return <NavGroupStory />;
}

export function Expanded() {
  return <NavGroupStory initialExpanded />;
}

export function WithActiveChildLink() {
  return <NavGroupStory initialExpanded activeHref="/budget" />;
}

function NavGroupStory({ initialExpanded = false, activeHref }: { initialExpanded?: boolean; activeHref?: string }) {
  const [expanded, setExpanded] = useState(initialExpanded);
  const links = activeHref ? defaultLinks.map((link) => ({ ...link, active: link.href === activeHref })) : defaultLinks;

  return (
    <div css={Css.wPx(250).$}>
      <NavGroup label="Budgets" links={links} expanded={expanded} onClick={() => setExpanded((value) => !value)} />
    </div>
  );
}
