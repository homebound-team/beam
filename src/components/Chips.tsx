import { Chip } from "src/components/Chip";
import { usePresentationContext } from "src/components/PresentationContext";
import { Css, Margin, Only, Xss } from "src/Css";

type ChipsXss = Xss<Margin>;

export interface ChipValue {
  text: string;
  title: string;
}

export interface ChipsProps<X> {
  values: string[] | ChipValue[];
  xss?: X;
}

/** Renders a list of `Chip`s, with wrapping & appropriate margin between each `Chip`. */
export function Chips<X extends Only<ChipsXss, X>>(props: ChipsProps<X>) {
  const { wrap } = usePresentationContext();
  const { values, xss = {} } = props;
  return (
    <div
      css={{
        ...Css.df.aifs.gap1.whiteSpace("normal").$,
        ...(wrap !== false ? Css.add({ flexWrap: "wrap" }).$ : {}),
        ...xss,
      }}
    >
      {values.map((value, i) => {
        const { text, title } = (value.hasOwnProperty("text") ? value : { text: value }) as ChipValue;
        return <Chip key={i} text={text} title={title} />;
      })}
    </div>
  );
}
