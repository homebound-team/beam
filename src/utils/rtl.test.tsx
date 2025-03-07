import { jest } from "@jest/globals";
import { useState } from "react";
import { MultiSelectField, NestedOption, SelectField, TreeSelectField } from "src/inputs";
import { HasIdAndName } from "src/types";
import { getOptions, getSelected, render, select, selectAndWait } from "src/utils/rtl";

describe("rtl", () => {
  it("can use select helpers and select an option via value on SelectField", async () => {
    const onSelect = jest.fn();
    // Given the SelectField
    function Test() {
      const [value, setValue] = useState<string | undefined>();
      return (
        <SelectField
          label="Number"
          value={value}
          onSelect={(value, option) => {
            setValue(value);
            onSelect(value, option);
          }}
          options={[
            { id: "1", name: "One" },
            { id: "2", name: "Two" },
            { id: "3", name: "Three" },
          ]}
        />
      );
    }
    const r = await render(<Test />);
    // Then the getOptions helper returns the correct options
    expect(getOptions(r.number)).toEqual(["One", "Two", "Three"]);

    // When selecting an option
    select(r.number, "2");
    // Then the onSelect handler is called with the correct value
    expect(onSelect).toHaveBeenCalledWith("2", { id: "2", name: "Two" });
    expect(r.number).toHaveValue("Two");

    // And the getSelected helper returns the correct value
    expect(getSelected(r.number)).toBe("Two");

    // When selecting that option again
    select(r.number, "2");
    // Then the onSelect handler is not called again - no changes occurred.
    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it("can select options via label on SelectField", async () => {
    const onSelect = jest.fn();
    // Given the SelectField
    function Test() {
      const [value, setValue] = useState<string | undefined>();
      return (
        <SelectField
          label="Number"
          value={value}
          onSelect={(value, opt) => {
            setValue(value);
            onSelect(value, opt);
          }}
          options={[
            { id: "1", name: "One" },
            { id: "2", name: "Two" },
            { id: "3", name: "Three" },
          ]}
        />
      );
    }
    const r = await render(<Test />);
    // When selecting an option
    select(r.number, "Two");
    // Then the onSelect handler is called with the correct value
    expect(onSelect).toHaveBeenCalledWith("2", { id: "2", name: "Two" });
    expect(r.number).toHaveValue("Two");
  });

  it("fails when selecting disabled options", async () => {
    const onSelect = jest.fn();
    // Given a SelectField
    const r = await render(
      <SelectField
        label="Number"
        value={undefined as any}
        onSelect={onSelect}
        options={[
          { id: "1", name: "One" },
          { id: "2", name: "Two" },
          { id: "3", name: "Three" },
        ]}
        // And the 1st option option is disabled
        disabledOptions={["1"]}
      />,
    );
    // When selecting it, it fails
    expect(() => select(r.number, "One")).toThrow("Cannot select disabled option One");
  });

  it("can selectAndWait on SelectField", async () => {
    const onSelect = jest.fn();
    async function asyncSelect(v: any, o: any) {
      await new Promise((resolve) => {
        resolve(v);
      }).then(() => {
        onSelect(v, o);
      });
    }
    // Given the SelectField
    const r = await render(
      <SelectField
        label="Number"
        value={undefined as any}
        onSelect={(v, o) => {
          // TODO: verify this eslint ignore
          // eslint-disable-next-line @typescript-eslint/no-floating-promises
          asyncSelect(v, o);
        }}
        options={[
          { id: "1", name: "One" },
          { id: "2", name: "Two" },
          { id: "3", name: "Three" },
        ]}
      />,
    );
    // When selecting an option
    await selectAndWait(r.number, "Two");
    // Then the onSelect handler is called with the correct value
    expect(onSelect).toHaveBeenCalledWith("2", { id: "2", name: "Two" });
  });

  it("can use select helpers and select an option via value on MultiSelectField", async () => {
    const onSelect = jest.fn();
    // Given the MultiSelectField
    function Test() {
      const [values, setValues] = useState<string[]>([]);
      return (
        <MultiSelectField
          label="Number"
          values={values}
          onSelect={(values, options) => {
            setValues(values);
            onSelect(values, options);
          }}
          options={[
            { id: "1", name: "One" },
            { id: "2", name: "Two" },
            { id: "3", name: "Three" },
          ]}
        />
      );
    }
    const r = await render(<Test />);

    // Then the getOptions helper returns the correct options
    expect(getOptions(r.number)).toEqual(["One", "Two", "Three"]);

    // When selecting options
    select(r.number, ["2", "3"]);
    // Then the onSelect handler is called with the correct values
    expect(onSelect).toHaveBeenCalledWith(
      ["2", "3"],
      [
        { id: "2", name: "Two" },
        { id: "3", name: "Three" },
      ],
    );
    // And the getSelected helper returns the correct values
    expect(getSelected(r.number)).toEqual(["Two", "Three"]);

    // When selecting one of those options again to unselect it
    select(r.number, ["2"]);
    // Then the onSelect handler is called with the correct values (removing "2")
    expect(onSelect).toHaveBeenCalledWith(["3"], [{ id: "3", name: "Three" }]);
  });

  it("can select options via label on MultiSelectField", async () => {
    const onSelect = jest.fn();
    // Given the MultiSelectField
    function Test() {
      const [values, setValues] = useState<string[]>([]);
      return (
        <MultiSelectField
          label="Number"
          values={values}
          onSelect={(values, options) => {
            setValues(values);
            onSelect(values, options);
          }}
          options={[
            { id: "1", name: "One" },
            { id: "2", name: "Two" },
            { id: "3", name: "Three" },
          ]}
        />
      );
    }
    const r = await render(<Test />);

    // When selecting options by label
    select(r.number, ["One", "Three"]);
    // Then the onSelect handler is called with the correct values
    expect(onSelect).toHaveBeenCalledWith(
      ["1", "3"],
      [
        { id: "1", name: "One" },
        { id: "3", name: "Three" },
      ],
    );
  });

  it("can selectAndWait on MultiSelectField", async () => {
    const onSelect = jest.fn();
    async function asyncSelect(v: any, o: any) {
      await new Promise((resolve) => {
        resolve(v);
      }).then(() => {
        onSelect(v, o);
      });
    }
    // Given the SelectField
    const r = await render(
      <MultiSelectField
        label="Number"
        values={undefined as any}
        onSelect={(v, o) => {
          // TODO: verify this eslint ignore
          // eslint-disable-next-line @typescript-eslint/no-floating-promises
          asyncSelect(v, o);
        }}
        options={[
          { id: "1", name: "One" },
          { id: "2", name: "Two" },
          { id: "3", name: "Three" },
        ]}
      />,
    );
    // When selecting an option
    await selectAndWait(r.number, ["Two"]);
    // Then the onSelect handler is called with the correct value
    expect(onSelect).toHaveBeenCalledWith(["2"], [{ id: "2", name: "Two" }]);
  });

  it("can use select helpers and select an option via value on TreeSelectField", async () => {
    const onSelect = jest.fn();
    // Given the TreeSelectField
    const r = await render(
      <TreeSelectField
        label="Number"
        values={[] as string[]}
        onSelect={({ all }) => onSelect(all)}
        options={
          [
            {
              id: "1",
              name: "One",
              children: [
                { id: "1.1", name: "One One" },
                { id: "1.2", name: "One Two" },
              ],
            },
          ] as NestedOption<HasIdAndName>[]
        }
      />,
    );

    // Then the getOptions helper returns the correct options
    expect(getOptions(r.number)).toEqual(["One", "One One", "One Two"]);
    // When selecting options
    select(r.number, ["1.1"]);
    // Then the onSelect handler is called with the correct values
    expect(onSelect).toHaveBeenCalledWith({ options: [{ id: "1.1", name: "One One" }], values: ["1.1"] });
    // And the getSelected helper returns the correct values
    expect(getSelected(r.number)).toEqual("One One");
  });

  it("can select options via label on TreeSelectField", async () => {
    const onSelect = jest.fn();
    // Given the TreeSelectField
    function Test() {
      const [values, setValues] = useState<string[]>([]);
      return (
        <TreeSelectField
          label="Number"
          values={values}
          onSelect={({ all }) => {
            setValues(all.values);
            onSelect(all);
          }}
          options={
            [
              {
                id: "1",
                name: "One",
                children: [
                  { id: "1.1", name: "One One" },
                  { id: "1.2", name: "One Two" },
                ],
              },
            ] as NestedOption<HasIdAndName>[]
          }
        />
      );
    }
    const r = await render(<Test />);
    // When selecting an option by its label
    select(r.number, ["One One"]);
    // Then the onSelect handler is called with the correct values
    expect(onSelect).toHaveBeenCalledWith({ options: [{ id: "1.1", name: "One One" }], values: ["1.1"] });
  });

  it("can selectAndWait on TreeSelectField", async () => {
    const onSelect = jest.fn();
    async function asyncSelect(v: any) {
      await new Promise((resolve) => {
        resolve(v);
      }).then(() => {
        onSelect(v);
      });
    }
    // Given the SelectField
    const r = await render(
      <TreeSelectField
        label="Number"
        values={[] as string[]}
        onSelect={({ all }) => {
          // TODO: verify this eslint ignore
          // eslint-disable-next-line @typescript-eslint/no-floating-promises
          asyncSelect(all);
        }}
        options={
          [
            {
              id: "1",
              name: "One",
              children: [
                { id: "1.1", name: "One One" },
                { id: "1.2", name: "One Two" },
              ],
            },
          ] as NestedOption<HasIdAndName>[]
        }
      />,
    );
    // When selecting an option
    await selectAndWait(r.number, ["One Two"]);
    // Then the onSelect handler is called with the correct value
    expect(onSelect).toHaveBeenCalledWith({ options: [{ id: "1.2", name: "One Two" }], values: ["1.2"] });
  });

  it("can use select helpers on multiline SelectField", async () => {
    const onSelect = jest.fn();
    // Given the SelectField is multline
    function Test() {
      const [value, setValue] = useState<string | undefined>();
      return (
        <SelectField
          label="Number"
          value={value}
          onSelect={(value, option) => {
            setValue(value);
            onSelect(value, option);
          }}
          options={[
            { id: "1", name: "One" },
            { id: "2", name: "Two" },
            { id: "3", name: "Three" },
          ]}
          multiline
        />
      );
    }
    const r = await render(<Test />);
    // Then the getOptions helper returns the correct options
    expect(getOptions(r.number)).toEqual(["One", "Two", "Three"]);
    // When selecting an option
    select(r.number, "2");
    // Then the onSelect handler is called with the correct value
    expect(onSelect).toHaveBeenCalledWith("2", { id: "2", name: "Two" });
    // And the getSelected helper returns the correct value
    expect(getSelected(r.number)).toBe("Two");
    // When selecting that option again
    select(r.number, "2");
    // Then the onSelect handler is not called again - no changes occurred.
    expect(onSelect).toHaveBeenCalledTimes(1);
  });
});
