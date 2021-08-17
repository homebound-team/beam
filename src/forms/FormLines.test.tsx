import { FormLines } from "src/forms/FormLines";

describe("FormLines", () => {
  it("can be used with boolean expressions", () => {
    const lines = (
      <FormLines>
        {false && <div>maybe line one</div>}
        <div>line two</div>
      </FormLines>
    );
  });

  it("can be used with just one line", () => {
    const lines = (
      <FormLines>
        <div>line one</div>
      </FormLines>
    );
  });
});
