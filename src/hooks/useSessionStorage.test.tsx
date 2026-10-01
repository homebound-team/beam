import { TextField } from "src/inputs/TextField";
import { render, type } from "src/utils/rtl";
import { vi } from "vitest";
import { useSessionStorage } from "./useSessionStorage";

describe("useSessionStorage", () => {
  it("should initially use default if nothing is stored in session storage", async () => {
    // Given a test component
    const r = await render(<TestComponent />);
    // Then expect text to have "default" value that was passed into useSessionStorage
    expect(r.firstName).toHaveValue("default");
  });

  it("can get a value from session storage", async () => {
    // Given a saved value in session storage
    sessionStorage.setItem("test", '{ "firstName": "saved" }');
    // And given a test component
    const r = await render(<TestComponent />);
    // Then expect firstName to have the "saved" value from session storage
    expect(r.firstName).toHaveValue("saved");
  });

  it("can set a value to session storage", async () => {
    vi.spyOn(Object.getPrototypeOf(window.sessionStorage), "setItem");
    // Given a saved value in session storage
    sessionStorage.setItem("test", '{ "firstName": "saved" }');
    // Given a test component
    const r = await render(<TestComponent />);
    // When we type an update into the firstName field
    type(r.firstName, "update");
    // Then expect sessions storage to have been called with the update
    expect(sessionStorage.setItem).toHaveBeenLastCalledWith("test", '{"firstName":"update"}');
    // And expect firstName to have the updated value
    expect(r.firstName).toHaveValue("update");
  });

  it("does not read or write session storage when persist is false", async () => {
    // Given a saved value
    sessionStorage.setItem("test", '{ "firstName": "saved" }');
    // When persist is off
    const r = await render(<EphemeralTestComponent />);
    // Then the default is used
    expect(r.firstName).toHaveValue("default");
    // When the value changes
    type(r.firstName, "update");
    // Then memory updates and the stored value is unchanged
    expect(r.firstName).toHaveValue("update");
    expect(sessionStorage.getItem("test")).toBe('{ "firstName": "saved" }');
  });

  it("returns the default value if it cannot parse the stored string", async () => {
    // Given an value in session storage that cannot be parsed in session storage
    sessionStorage.setItem("test", "undefined");
    // Given a test component
    const r = await render(<TestComponent />);
    // Then expect the firstName to be the default value passed into `useSessionStorage` instead of erroring
    expect(r.firstName).toHaveValue("default");
  });
});

function TestComponent() {
  const [storage, setStorage] = useSessionStorage("test", { firstName: "default" });
  return (
    <TextField label="First Name" value={storage.firstName} onChange={(v) => setStorage({ firstName: v ?? "" })} />
  );
}

function EphemeralTestComponent() {
  const [storage, setStorage] = useSessionStorage("test", { firstName: "default" }, false);
  return (
    <TextField label="First Name" value={storage.firstName} onChange={(v) => setStorage({ firstName: v ?? "" })} />
  );
}
