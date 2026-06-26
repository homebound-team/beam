import { Meta } from "@storybook/react-vite";
import { EnvironmentBanner, ImpersonatedUser } from "src/components/EnvironmentBanner/EnvironmentBanner";
import { newStory, type StoryOptions, viewportModes } from "src/utils/sb";

export default {
  component: EnvironmentBanner,
} as Meta;

const environmentBannerStoryOpts: StoryOptions = {
  parameters: {
    layout: "fullscreen",
    chromatic: {
      modes: viewportModes("desktop", "mobile1"),
    },
  },
};

export const WithoutImpersonating = newStory(() => <EnvironmentBanner env="qa" />, environmentBannerStoryOpts);

export const LocalProd = newStory(
  () => <EnvironmentBanner env="local-prod" impersonating={createImpersonatedUser()} />,
  environmentBannerStoryOpts,
);

export const Dev = newStory(
  () => <EnvironmentBanner env="dev" impersonating={createImpersonatedUser()} />,
  environmentBannerStoryOpts,
);

export const Qa = newStory(
  () => <EnvironmentBanner env="qa" impersonating={createImpersonatedUser()} />,
  environmentBannerStoryOpts,
);

export const Prod = newStory(
  () => <EnvironmentBanner env="prod" impersonating={createImpersonatedUser()} />,
  environmentBannerStoryOpts,
);

export const ProdWarning = newStory(() => <EnvironmentBanner env="prod" showProdWarning />, environmentBannerStoryOpts);

function createImpersonatedUser(): ImpersonatedUser {
  return { name: "Andrea Eppy" };
}
