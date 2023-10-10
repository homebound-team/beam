import { clickAndWait } from "@homebound/rtl-utils";
import { fireEvent } from "@testing-library/react";
import { useState } from "react";
import { SelectField, SelectFieldProps, Value } from "src/inputs";
import { HasIdAndName, Optional } from "src/types";
import { blur, click, focus, getOptions, render, select, wait } from "src/utils/rtl";

describe("SelectFieldTest", () => {
  it("can set a value", async () => {
    // Given a MultiSelectField
    const onSelect = jest.fn();
    const onBlur = jest.fn();
    const r = await render(
      <TestSelectField
        label="Age"
        value={"1"}
        options={options}
        getOptionLabel={(o) => o.name}
        getOptionValue={(o) => o.id}
        data-testid="age"
        onBlur={onBlur}
        onSelect={onSelect}
      />,
    );
    // That initially has "One" selected
    expect(r.age).toHaveValue("One");

    // When selecting the 3rd option
    select(r.age, "3");

    // Then onSelect was called
    expect(onSelect).toHaveBeenCalledWith("3", options[2]);
    // And the field has not been blurred (regression test to prevent SelectField's list box from opening back up after selecting an option)
    expect(onBlur).not.toHaveBeenCalled();
    // And the field has the correct value (regression test to ensure input field's value correctly updates when selecting an option, before `onBlur` is called)
    expect(r.age).toHaveValue("Three");
  });

  it("does not fire focus/blur when readOnly", async () => {
    const onFocus = jest.fn();
    const onBlur = jest.fn();
    const r = await render(
      <TestSelectField
        label="Age"
        value={"1"}
        readOnly={true}
        options={options}
        getOptionLabel={(o) => o.name}
        getOptionValue={(o) => o.id}
        onFocus={onFocus}
        onBlur={onBlur}
        data-testid="age"
      />,
    );
    focus(r.age);
    blur(r.age);
    expect(onBlur).not.toHaveBeenCalled();
    expect(onFocus).not.toHaveBeenCalled();
  });

  it("resets input value on blur if it does not match the selected option", async () => {
    // Given a Select Field without a selected option
    const r = await render(
      <TestSelectField
        label="Age"
        value={undefined}
        options={options}
        getOptionLabel={(o) => o.name}
        getOptionValue={(o) => o.id}
        data-testid="age"
      />,
    );
    // When changing the inputs value, and not selecting an option
    fireEvent.input(r.age, { target: { value: "asdf" } });
    // And `blur`ing the field
    fireEvent.blur(r.age);
    // Then expect the value to be reset to empty
    expect(r.age).toHaveValue("");

    // Given a selected option
    fireEvent.focus(r.age);
    fireEvent.input(r.age, { target: { value: "T" } });
    click(r.getByRole("option", { name: "Three" }));
    // When changing the inputs value to no longer match the selected option
    fireEvent.input(r.age, { target: { value: "asdf" } });
    // And `blur`ing the field
    fireEvent.blur(r.age);
    // Then expect the value to be reset to the selected option
    expect(r.age).toHaveValue("Three");
  });

  it("can initialize with an 'undefined' value", async () => {
    // Given a Select Field with an undefined value
    const r = await render(
      <TestSelectField
        label="Age"
        value={undefined}
        options={[{ id: undefined, name: "Unassigned" }, ...options]}
        getOptionLabel={(o) => o.name}
        getOptionValue={(o) => o.id}
        data-testid="age"
      />,
    );
    // Then expect the value to be that of the `undefined` entry
    expect(r.age).toHaveValue("Unassigned");
  });

  it("can select an 'undefined' value", async () => {
    // Given a Select Field with a value selected
    const r = await render(
      <TestSelectField
        label="Age"
        value="1"
        options={[{ id: undefined, name: "Unassigned" }, ...options]}
        getOptionLabel={(o) => o.name}
        getOptionValue={(o) => o.id}
        data-testid="age"
      />,
    );
    // When selecting the option with an `undefined` value
    select(r.age, "Unassigned");
    // Then expect the value to be that of the `undefined` entry
    expect(r.age).toHaveValue("Unassigned");
  });

  it("respects disabled options", async () => {
    const onSelect = jest.fn();
    // Given a Select Field with a disabled option
    const r = await render(
      <SelectField
        label="Age"
        value="1"
        options={options}
        getOptionLabel={(o) => o.name}
        getOptionValue={(o) => o.id}
        data-testid="age"
        disabledOptions={["2"]}
        onSelect={onSelect}
      />,
    );
    // When opening the menu
    select(r.age, "Two");
    const optionTwo = r.getByRole("option", { name: "Two" });
    // Then the disabled option to have the correct aria attributes
    expect(optionTwo).toHaveAttribute("aria-disabled", "true");
    // And when clicking on that option
    click(optionTwo);
    // Then the `onSelect` callback is not called
    expect(onSelect).not.toHaveBeenCalled();
  });

  it("can disable options with tooltips", async () => {
    const onSelect = jest.fn();
    // Given a Select Field with a disabled option
    const r = await render(
      <SelectField
        label="Age"
        value="1"
        options={options}
        getOptionLabel={(o) => o.name}
        getOptionValue={(o) => o.id}
        data-testid="age"
        disabledOptions={[{ value: "2", reason: "Example Tooltip" }]}
        onSelect={onSelect}
      />,
    );

    // When opening the menu
    click(r.age);
    const optionTwo = r.getByRole("option", { name: "Two" });

    // Then expect the disabled option to be wrapped in the tooltip text
    expect(optionTwo).toHaveAttribute("aria-disabled", "true");
    expect(optionTwo.closest("[data-testid='tooltip']")).toHaveAttribute("title", "Example Tooltip");

    // And when clicking on that option
    click(optionTwo);
    // Then the `onSelect` callback is not called
    expect(onSelect).not.toHaveBeenCalled();
  });

  it("can load options via options prop callback", async () => {
    // Given a Select Field with options that are loaded via a callback
    function Test() {
      const [loaded, setLoaded] = useState<HasIdAndName[]>([]);
      return (
        <SelectField
          label="Age"
          value="1"
          options={{
            current: options[0],
            load: async () => {
              await sleep(0);
              setLoaded(options);
            },
            options: loaded,
          }}
          onSelect={() => {}}
          getOptionLabel={(o) => o.name}
          getOptionValue={(o) => o.id}
          data-testid="age"
        />
      );
    }
    const r = await render(<Test />);
    // When opening the menu
    click(r.age);
    // Then expect to see the initial option and loading state
    expect(r.getAllByRole("option")).toHaveLength(1);
    expect(r.loadingDots).toBeTruthy();
    // And when waiting for the promise to resolve
    await wait();
    // Then expect the rest of the options to be loaded in and the loading state to be removed
    expect(r.getAllByRole("option")).toHaveLength(3);
    expect(r.queryByTestId("loadingDots")).toBeFalsy();
  });

  it("reflects new options when prop changes", async () => {
    // Given a Select Field with options that are loaded via a callback
    const r = await render(
      <TestSelectField
        label="Age"
        value="1"
        options={[options[0]]}
        getOptionLabel={(o) => o.name}
        getOptionValue={(o) => o.id}
        data-testid="age"
      />,
    );
    // When opening the menu
    click(r.age);
    // Then expect to see the initial option
    expect(r.getAllByRole("option")).toHaveLength(1);
    // And when changing the options
    click(r.updateOptions);
    // Then expect the rest of the options to be loaded in
    expect(r.getAllByRole("option")).toHaveLength(3);
  });

  it("uses initial value when other input changes the state for lazy load options", async () => {
    // Given two selectField with options that are lazy loaded
    const selectedOption = options[0];
    const r = await render(
      <TestMultipleSelectField
        label="Age"
        value={selectedOption.id}
        unsetLabel="-"
        options={options}
        getOptionLabel={(o) => o.name}
        getOptionValue={(o) => o.id}
        data-testid="age"
      />,
    );
    // Then both have the same value
    expect(r.age_0).toHaveValue("One");
    expect(r.age_1).toHaveValue("One");
    // When opening the first select menu
    await clickAndWait(r.age_0);
    // And all options is loaded
    expect(getOptions(r.age_0)).toHaveLength(4);
    // And change the value of the first select
    select(r.age_0, "Two");
    // Then expect the second select to have the same value
    expect(r.age_0).toHaveValue("Two");
    expect(r.age_1).toHaveValue("Two");
    // When we open the second select menu
    await clickAndWait(r.age_1);
    // And all options is loaded
    expect(getOptions(r.age_1)).toHaveLength(4);
    // And unset the value of the second select
    select(r.age_1, "-");
    // Then expect the first select to have the same value
    expect(r.age_0).toHaveValue("-");
    expect(r.age_1).toHaveValue("-");
  });

  it("can set value when options are loaded later", async () => {
    // Given a Select Field with options that are loaded lazily
    const r = await render(
      <TestSelectField
        label="Age"
        value="1"
        options={[] as HasIdAndName[]}
        getOptionLabel={(o) => o.name}
        getOptionValue={(o) => o.id}
        data-testid="age"
      />,
    );
    // The input value will initially be blank
    expect(r.age).toHaveValue("");
    // And when options are loaded
    click(r.updateOptions);
    // Then expect the input value to be updated based on field's value
    expect(r.age).toHaveValue("One");
  });

  it("can define and select 'unsetLabel' when options are an array", async () => {
    const onSelect = jest.fn();
    // Given a Select Field with options that already available
    const r = await render(
      <TestSelectField
        label="Age"
        value="1"
        unsetLabel="None"
        options={labelValueOptions}
        getOptionLabel={(o) => o.label}
        getOptionValue={(o) => o.value}
        onSelect={onSelect}
      />,
    );
    // When we select the 'unset' option
    select(r.age, "None");
    // Then onSelect was called
    expect(onSelect).toHaveBeenCalledWith(undefined, undefined);
  });

  it("can define and select 'unsetLabel' when options are lazily loaded", async () => {
    const onSelect = jest.fn();
    // Given a Select Field with options that are loaded lazily
    function Test() {
      const [loaded, setLoaded] = useState<HasLabelAndValue[]>([]);
      return (
        <TestSelectField
          label="Age"
          value="1"
          unsetLabel="None"
          options={{
            current: labelValueOptions[0],
            load: async () => setLoaded(labelValueOptions),
            options: loaded,
          }}
          getOptionLabel={(o) => o.label}
          getOptionValue={(o) => o.value}
          onSelect={onSelect}
        />
      );
    }
    const r = await render(<Test />);
    // When we click the field to open the menu
    await clickAndWait(r.age);
    // The 'unset' option is in the menu and we select it
    click(r.getByRole("option", { name: "None" }));
    // Then onSelect was called
    expect(onSelect).toHaveBeenCalledWith(undefined, undefined);
  });

  it("can initially be set to the 'unsetLabel' option", async () => {
    // Given a Select Field with the value set to `undefined`
    const r = await render(
      <SelectField
        label="Age"
        value={undefined as string | undefined}
        unsetLabel="None"
        options={options}
        onSelect={() => {}}
      />,
    );
    // The input value will be set to the `unsetLabel`
    expect(r.age).toHaveValue("None");
  });

  it("can initially be set to the 'unsetLabel' option when lazy loading options", async () => {
    // Given a Select Field with the value set to `undefined`
    const r = await render(
      <SelectField<HasIdAndName, string>
        label="Age"
        value={undefined}
        unsetLabel="None"
        options={{ current: undefined, load: async () => {}, options: undefined }}
        onSelect={() => {}}
      />,
    );
    // The input value will be set to the `unsetLabel`
    expect(r.age).toHaveValue("None");
  });

  it("can customize the unset value in the menu", async () => {
    // Given a Select Field providing the `getOptionMenuLabel`
    const r = await render(
      <TestSelectField
        label="Age"
        value={undefined}
        unsetLabel="None"
        options={labelValueOptions}
        getOptionLabel={(o) => o.label}
        getOptionValue={(o) => o.value}
        getOptionMenuLabel={(o, isUnsetOpt) => (isUnsetOpt ? "Unset Label" : o.label)}
      />,
    );
    // When we click the field to open the menu
    click(r.age);
    // Then the `unset` option in the menu should reflect the custom value we passed in
    expect(r.getAllByRole("option").map((o) => o.textContent)).toMatchInlineSnapshot(`
      [
        "Unset Label",
        "One",
        "Two",
        "Three",
      ]
    `);
  });

  it("supports boolean values properly", async () => {
    // Given a select field with boolean and an undefined values
    const onSelect = jest.fn();
    const r = await render(
      <SelectField
        label="label"
        value={true}
        onSelect={onSelect}
        options={[
          { id: undefined, name: "Undefined" },
          { id: false, name: "False" },
          { id: true, name: "True" },
        ]}
        getOptionLabel={(o) => o.name}
        getOptionValue={(o) => o.id}
      />,
    );

    // When selecting the `false` option
    click(r.label);
    click(r.getByRole("option", { name: "False" }));

    // Then `onSelect` is triggered with `false`
    expect(onSelect.mock.calls[0][0]).toBe(false);

    // When selecting the `true` option
    click(r.label);
    click(r.getByRole("option", { name: "True" }));

    // Then `onSelect` is triggered with `true`
    expect(onSelect.mock.calls[1][0]).toBe(true);

    // When selecting the `undefined` option
    click(r.label);
    click(r.getByRole("option", { name: "Undefined" }));

    // Then `onSelect` is triggered with `undefined`
    expect(onSelect.mock.calls[2][0]).toBe(undefined);
  });

  // Used to validate the `unset` option can be applied to non-`HasIdAndName` options
  type HasLabelAndValue = {
    label: string;
    value: string;
  };
  const labelValueOptions: HasLabelAndValue[] = [
    { value: "1", label: "One" },
    { value: "2", label: "Two" },
    { value: "3", label: "Three" },
  ];

  const options: HasIdAndName[] = [
    { id: "1", name: "One" },
    { id: "2", name: "Two" },
    { id: "3", name: "Three" },
  ];

  function TestSelectField<O, V extends Value>(props: Optional<SelectFieldProps<O, V>, "onSelect">): JSX.Element {
    const [selected, setSelected] = useState<V | undefined>(props.value);
    const [initOptions, setOptions] = useState(props.options);
    return (
      <>
        <SelectField<O, V>
          {...props}
          options={initOptions}
          value={selected}
          onSelect={(value, option) => {
            props.onSelect && props.onSelect(value, option);
            setSelected(value);
          }}
        />
        <button data-testid="updateOptions" onClick={() => setOptions(options as any)} />
      </>
    );
  }

  function TestMultipleSelectField<O extends HasIdAndName, V extends Value>(
    props: Optional<SelectFieldProps<O, V>, "onSelect">,
  ): JSX.Element {
    const [selected, setSelected] = useState<V | undefined>(props.value);
    const init = options.find((o) => o.id === selected) as O;
    const [loaded, setLoaded] = useState<O[]>([]);
    return (
      <>
        <SelectField<O, V>
          {...props}
          value={selected}
          onSelect={setSelected}
          unsetLabel={"-"}
          options={{
            current: init,
            load: async () => {
              await sleep(1500);
              setLoaded(props.options as O[]);
            },
            options: loaded,
          }}
        />
        <SelectField<O, V>
          {...props}
          value={selected}
          onSelect={setSelected}
          unsetLabel={"-"}
          options={{
            current: init,
            load: async () => {
              await sleep(1500);
              setLoaded(props.options as O[]);
            },
            options: loaded,
          }}
        />
      </>
    );
  }
});

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
