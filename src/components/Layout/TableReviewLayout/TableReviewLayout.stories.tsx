import { Meta } from "@storybook/react-vite";
import { withBeamDecorator, withDimensions, withRouter } from "src/utils/sb";
import { TableReviewLayout as TableReviewLayoutComponent } from "./TableReviewLayout";

export default {
  component: TableReviewLayoutComponent,
  decorators: [withBeamDecorator, withDimensions(), withRouter()],
  parameters: { layout: "fullscreen" },
} satisfies Meta;

export function TableReviewLayout() {
  return (
    <TableReviewLayoutComponent
      pageTitle="Review slot requests"
      breadcrumb={{ href: "/", label: "The Emerson plan" }}
      description={
        <>
          Review and manage slot change requests from design packages.
          <br />
          Accepting a request will add it to Takeoff.
          <br />
          If you reject a request, please notify the interior designer and include a reason.
        </>
      }
      closeAction={() => {}}
    />
  );
}
