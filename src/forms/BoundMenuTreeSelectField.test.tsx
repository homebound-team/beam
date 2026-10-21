import { createObjectState, type ObjectConfig } from "@homebound/form-state";
import { BoundMenuTreeSelectField } from "src/forms/BoundMenuTreeSelectField";
import type { NestedOption } from "src/inputs/TreeSelectField/utils";
import { render, select } from "src/utils/rtl";
import { vi } from "vitest";

describe("BoundMenuTreeSelectField", () => {
  it("binds every selected value to the field", async () => {
    // Given a form with a multi-value field
    const formState = createObjectState(formConfig(), {});
    const r = await render(<BoundMenuTreeSelectField field={formState.sportIds} options={sports()} />);
    // When selecting a parent
    select(r.sportIds, "Basketball");
    // Then the field holds the parent and its children
    expect(formState.sportIds.value).toEqual(["basketball", "nba", "wnba"]);
  });

  it("passes the full response to a custom onSelect", async () => {
    // Given a custom onSelect that stores only the leaves
    const formState = createObjectState(formConfig(), {});
    const onSelect = vi.fn((response) => formState.sportIds.set(response.leaf.values));
    const r = await render(
      <BoundMenuTreeSelectField field={formState.sportIds} options={sports()} onSelect={onSelect} />,
    );
    // When selecting a parent
    select(r.sportIds, "Basketball");
    // Then the field holds the leaves
    expect(formState.sportIds.value).toEqual(["nba", "wnba"]);
    expect(onSelect.mock.lastCall?.[0].root.values).toEqual(["basketball"]);
  });
});

type FormValue = { sportIds?: string[] | null };

function formConfig(): ObjectConfig<FormValue> {
  return { sportIds: { type: "value" } };
}

function sports(): NestedOption<{ id: string; name: string }>[] {
  return [
    {
      id: "basketball",
      name: "Basketball",
      children: [
        { id: "nba", name: "NBA" },
        { id: "wnba", name: "WNBA" },
      ],
    },
    { id: "golf", name: "Golf" },
  ];
}
