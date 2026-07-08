import { Meta } from "@storybook/react-vite";
import { Css } from "src/Css";
import { ListSelectCard } from "src/inputs/SelectCard/ListSelectCard";
import { SelectCardItemProps } from "./types";

export default {
  component: ListSelectCard,
} as Meta<SelectCardItemProps>;

export function CheckboxStates() {
  const description = "Lorem ipsum dolor sit amet, consectetur adipiscing elit";

  return (
    <div css={Css.df.fdc.gap2.wPx(640).$}>
      <ListSelectCardWrapper label="Default" description={description} />
      <ListSelectCardWrapper label="Selected" description={description} selected />
      <ListSelectCardWrapper label="Disabled" description={description} disabled />
      <ListSelectCardWrapper label="Disabled selected" description={description} selected disabled />
      <ListSelectCardWrapper label="Hover" description={description} __storyState={{ hovered: true }} />
      <ListSelectCardWrapper
        label="Hover selected"
        description={description}
        selected
        __storyState={{ hovered: true }}
      />
      <ListSelectCardWrapper label="Focus" description={description} __storyState={{ focusVisible: true }} />
      <ListSelectCardWrapper
        label="Focus selected"
        description={description}
        selected
        __storyState={{ focusVisible: true }}
      />
      <ListSelectCardWrapper label="Pressed" description={description} __storyState={{ pressed: true }} />
      <ListSelectCardWrapper
        label="Pressed selected"
        description={description}
        selected
        __storyState={{ pressed: true }}
      />
    </div>
  );
}

export function RadioStates() {
  const description = "Lorem ipsum dolor sit amet, consectetur adipiscing elit";

  return (
    <div css={Css.df.fdc.gap2.wPx(640).$}>
      <ListSelectCardWrapper type="radio" label="Default" description={description} />
      <ListSelectCardWrapper type="radio" label="Selected" description={description} selected />
      <ListSelectCardWrapper type="radio" label="Disabled" description={description} disabled />
      <ListSelectCardWrapper type="radio" label="Disabled selected" description={description} selected disabled />
      <ListSelectCardWrapper type="radio" label="Hover" description={description} __storyState={{ hovered: true }} />
      <ListSelectCardWrapper
        type="radio"
        label="Hover selected"
        description={description}
        selected
        __storyState={{ hovered: true }}
      />
      <ListSelectCardWrapper
        type="radio"
        label="Focus"
        description={description}
        __storyState={{ focusVisible: true }}
      />
      <ListSelectCardWrapper
        type="radio"
        label="Focus selected"
        description={description}
        selected
        __storyState={{ focusVisible: true }}
      />
      <ListSelectCardWrapper type="radio" label="Pressed" description={description} __storyState={{ pressed: true }} />
      <ListSelectCardWrapper
        type="radio"
        label="Pressed selected"
        description={description}
        selected
        __storyState={{ pressed: true }}
      />
    </div>
  );
}

type ListSelectCardWrapperProps = Omit<SelectCardItemProps, "inputProps"> & {
  type?: "checkbox" | "radio";
};

function ListSelectCardWrapper(props: ListSelectCardWrapperProps) {
  const { type = "checkbox", ...rest } = props;
  return <ListSelectCard {...rest} inputProps={{ readOnly: true, "aria-hidden": true, type }} />;
}
