import { TextField } from "src/inputs/TextField";
import { render, type } from "src/utils/rtl";
import { useSessionStorage } from "./useSessionStorage";

describe("useSessionStorage", () => {
  beforeEach(() => sessionStorage.clear());

  it("should initially use default if nothing is stored in session storage", async () => {
    // Given a test component
    const r = await render(<TestComponent />);
    // Then expect text to have "default" value that was passed into useSessionStorage
    expect(r.firstName()).toHaveValue("default");
  });

  it("can get a value from session storage", async () => {
    // Given a saved value in session storage
    sessionStorage.setItem("test", '{ "firstName": "saved" }');
    // And given a test component
    const r = await render(<TestComponent />);
    // Then expect firstName to have the "saved" value from session storage
    expect(r.firstName()).toHaveValue("saved");
  });

  it("can set a value to session storage", async () => {
    jest.spyOn(Object.getPrototypeOf(window.sessionStorage), "setItem");
    // Given a saved value in session storage
    sessionStorage.setItem("test", '{ "firstName": "saved" }');
    // Given a test component
    const r = await render(<TestComponent />);
    // When we type an update into the firstName field
    type(r.firstName(), "update");
    // Then expect sessions storage to have been called with the update
    expect(sessionStorage.setItem).toHaveBeenLastCalledWith("test", '{"firstName":"update"}');
    // And expect firstName to have the updated value
    expect(r.firstName()).toHaveValue("update");
  });

  it("returns the default value if it cannot parse the stored string", async () => {
    // Given an value in session storage that cannot be parsed in session storage
    sessionStorage.setItem("test", "undefined");
    // Given a test component
    const r = await render(<TestComponent />);
    // Then expect the firstName to be the default value passed into `useSessionStorage` instead of erroring
    expect(r.firstName()).toHaveValue("default");
  });
});

function TestComponent() {
  const [storage, setStorage] = useSessionStorage("test", { firstName: "default" });
  return (
    <TextField label="First Name" value={storage.firstName} onChange={(v) => setStorage({ firstName: v ?? "" })} />
  );
}
