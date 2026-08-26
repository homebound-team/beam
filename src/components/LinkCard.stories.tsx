import { Meta } from "@storybook/react-vite";
import { ReactNode } from "react";
import { LinkCard } from "src/components/LinkCard";
import { Css } from "src/Css";
import { withRouter } from "src/utils/sb";

export default {
  component: LinkCard,
  decorators: [withRouter()],
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/design/62R8KiDklvgBBSH0mQGWHo/BEAM_27_LIBRARY?node-id=1634-2123&m=dev",
    },
  },
} as Meta;

export function Default() {
  const { title, message, longTitle, longMessage } = getCopy();
  return (
    <div css={Css.df.fdc.gap5.$}>
      <Sample title="Title and message">
        <LinkCard title={title} message={message} action={{ onClick: "/plans/1/locations" }} />
      </Sample>

      <Sample title="Without a message">
        <LinkCard title={title} action={{ onClick: "/plans/1/locations" }} />
      </Sample>

      <Sample title="Long copy that wraps at full width">
        <LinkCard title={longTitle} message={longMessage} action={{ onClick: "/plans/1/locations" }} />
      </Sample>

      <Sample title="Long copy that wraps in a narrow container">
        <div css={Css.wPx(480).$}>
          <LinkCard title={title} message={message} action={{ onClick: "/plans/1/locations" }} />
        </div>
      </Sample>

      <Sample title="An unbroken word that can't wrap">
        <div css={Css.wPx(320).$}>
          <LinkCard
            title="Review Plan-2026-Elevation-Revision-Package-Final-v12.pdf"
            message="https://example.com/documents/plan-2026-elevation-revision-package-final-v12.pdf"
            action={{ onClick: "/documents/1" }}
          />
        </div>
      </Sample>
    </div>
  );
}

function getCopy() {
  return {
    title: "Review location changes: 1 added, 1 renumbered, 1 removed.",
    message: (
      <>
        According to the latest document upload <a href="/documents/1">Document Name Here</a> uploaded by Drew Whiting
        on July 15th 2026, here is a summary of changes to option configuration.
      </>
    ),
    longTitle:
      "Review location changes across all 14 plans in this community: 6 added, 3 renumbered, 2 removed, and 3 reassigned to a different elevation than the one they were originally drawn against.",
    longMessage: (
      <>
        According to the latest document upload <a href="/documents/1">Document Name Here</a> uploaded by Drew Whiting
        on July 15th 2026, here is a summary of changes to option configuration. Locations that moved between elevations
        keep their original numbering, so the take-off quantities you already approved are unaffected, but any option
        attached to a removed location needs to be reassigned before this plan can be released to the field. Three of
        the renumbered locations also appear in the structural package, which has not yet been re-uploaded, so those may
        change again.
      </>
    ),
  };
}

function Sample({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <h2 css={Css.lg.mb1.$}>{title}</h2>
      {children}
    </div>
  );
}
