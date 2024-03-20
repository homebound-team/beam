import { Meta } from "@storybook/react";
import { BoundTreeSelectField } from "./BoundTreeSelectField";
import { ObjectConfig, required, useFormState } from "@homebound/form-state";
import { Observer } from "mobx-react";
import { Css } from "src/Css";
import { useEffect, useState } from "react";

export default {
  component: BoundTreeSelectField,
} as Meta;

export function Example() {
  const formState = useFormState({ config, init: { id: [] } });
  const options = [
    {
      id: "1",
      name: "Parent 1",
      children: [
        { id: "1.1", name: "Child 1.1" },
        { id: "1.2", name: "Child 1.2" },
      ],
    },
    {
      id: "2",
      name: "Parent 2",
      children: [
        { id: "2.1", name: "Child 2.1" },
        { id: "2.2", name: "Child 2.2" },
      ],
    },
  ];

  return (
    <>
      <BoundTreeSelectField field={formState.id} options={options} />
      <Observer>
        {() => (
          <div css={Css.df.fdc.gap1.mt2.$}>
            <div>
              <strong>Valid:</strong> {JSON.stringify(formState.valid)}
            </div>
            <div>
              <strong>Form values:</strong>
              <pre>{JSON.stringify(formState.value, null, 2)}</pre>
            </div>
          </div>
        )}
      </Observer>
    </>
  );
}
export function OptionsChangeAfterFirstRenderExample() {
  const formState = useFormState({ config, init: { id: [] } });
  const [options, setOptions] = useState<any[]>([]);
  useEffect(() => {
    setOptions([
      {
        id: "1",
        name: "Parent 1",
        children: [
          { id: "1.1", name: "Child 1.1" },
          { id: "1.2", name: "Child 1.2" },
        ],
      },
      {
        id: "2",
        name: "Parent 2",
        children: [
          { id: "2.1", name: "Child 2.1" },
          { id: "2.2", name: "Child 2.2" },
        ],
      },
    ]);
  }, []);

  return (
    <>
      <BoundTreeSelectField field={formState.id} options={options} />
      <Observer>
        {() => (
          <div css={Css.df.fdc.gap1.mt2.$}>
            <div>
              <strong>Valid:</strong> {JSON.stringify(formState.valid)}
            </div>
            <div>
              <strong>Form values:</strong>
              <pre>{JSON.stringify(formState.value, null, 2)}</pre>
            </div>
          </div>
        )}
      </Observer>
    </>
  );
}

type HasId = {
  id: string[] | null | undefined;
};

const config: ObjectConfig<HasId> = {
  id: { type: "value", rules: [required] },
};
