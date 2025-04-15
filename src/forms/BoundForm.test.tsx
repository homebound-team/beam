import { createObjectState, ObjectConfig, required } from "@homebound/form-state";
import { act } from "@testing-library/react";
import { click, render } from "src/utils/rtl";
import { boundCheckboxField, BoundForm, boundTextField } from "./BoundForm";
import { ListFieldConfig } from "./BoundListField";
import { AuthorInput } from "./formStateDomain";

const formConfig: ObjectConfig<AuthorInput> = {
  isAvailable: { type: "value", rules: [required] },
  firstName: { type: "value", rules: [required] },
  lastName: { type: "value" },
  books: {
    type: "list",
    config: {
      title: { type: "value", rules: [required] },
      isPublished: { type: "value" },
      delete: { type: "value" },
    },
  },
};

describe("BoundForm", () => {
  it("renders rows of fields", async () => {
    // Given a formState with configured fields
    const formState = createObjectState(formConfig, { isAvailable: true, firstName: "John", lastName: "Doe" });

    // When rendered with two rows of inputs
    const r = await render(
      <BoundForm
        formState={formState}
        rows={[{ firstName: boundTextField(), lastName: boundTextField() }, { isAvailable: boundCheckboxField() }]}
      />,
    );

    // Then expect two rows to of fields to be rendered
    expect(r.getAllByTestId("boundFormRow")).toHaveLength(2);

    // And the individual inputs to be rendered with their values
    expect(r.firstName).toHaveValue("John");
    expect(r.lastName).toHaveValue("Doe");
    expect(r.isAvailable).toBeChecked();
  });

  describe("BoundListField", () => {
    it("renders list field with items", async () => {
      // Given a formState with a list field containing items
      const formState = createObjectState(formConfig, {
        firstName: "John",
        books: [
          { title: "Book 1", isPublished: true },
          { title: "Book 2", isPublished: false },
        ],
      });

      const listFieldConfig: ListFieldConfig<AuthorInput, "books"> = {
        name: "Book",
        rows: [{ title: boundTextField() }, { isPublished: boundCheckboxField() }],
        onNew: (objectState) => {
          objectState.add({ title: "", isPublished: false });
        },
      };

      // When rendered with a list field
      const r = await render(<BoundForm formState={formState} rows={[{ listFieldBooks: listFieldConfig }]} />);

      // Then expect the list field to be rendered with its items
      expect(r.listField).toBeInTheDocument();
      expect(r.getAllByTestId("listFieldRow")).toHaveLength(2);
      expect(r.listFieldRow_name_0).toHaveTextContent("Book 1");
      expect(r.listFieldRow_name_1).toHaveTextContent("Book 2");
    });

    it("adds new items to list field", async () => {
      // Given a formState with an empty list field
      const formState = createObjectState(formConfig, {
        firstName: "John",
        books: [],
      });

      const listFieldConfig: ListFieldConfig<AuthorInput, "books"> = {
        name: "Book",
        rows: [{ title: boundTextField() }, { isPublished: boundCheckboxField() }],
        onNew: (objectState) => {
          objectState.add({ title: "", isPublished: false });
        },
      };

      // When rendered with a list field
      const r = await render(<BoundForm formState={formState} rows={[{ listFieldBooks: listFieldConfig }]} />);

      // And the add button is clicked
      act(() => click(r.addBook));

      // Then expect a new item to be added
      expect(r.getAllByTestId("listFieldRow")).toHaveLength(1);
      expect(r.listFieldRow_name_0).toHaveTextContent("Book 1");
    });

    it("deletes items from list field", async () => {
      // Given a formState with a list field containing items
      const formState = createObjectState(formConfig, {
        firstName: "John",
        books: [
          { title: "Book 1", isPublished: true },
          { title: "Book 2", isPublished: false },
        ],
      });

      const listFieldConfig: ListFieldConfig<AuthorInput, "books"> = {
        name: "Book",
        rows: [{ title: boundTextField() }, { isPublished: boundCheckboxField() }],
        onNew: (objectState) => {
          objectState.add({ title: "", isPublished: false });
        },
        onDelete: (listFieldState, rowObjectState) => {
          if (rowObjectState.id?.value) {
            rowObjectState.set({ delete: true });
          } else {
            listFieldState.remove(rowObjectState.value);
          }
        },
        filterDeleted: (objectState) => !objectState.delete?.value,
      };

      // When rendered with a list field
      const r = await render(<BoundForm formState={formState} rows={[{ listFieldBooks: listFieldConfig }]} />);

      // We expect the two book rows to be rendered
      expect(r.getAllByTestId("listFieldRow")).toHaveLength(2);

      // And the delete button is clicked for the first book
      act(() => click(r.listFieldRow_menu_0));
      act(() => click(r.listFieldRow_menu_delete));

      // Then expect the first book to be removed from the list
      expect(r.getAllByTestId("listFieldRow")).toHaveLength(1);
    });
  });
});
