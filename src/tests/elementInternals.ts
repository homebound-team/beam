// jsdom declares `ElementInternals` but implements none of the form-associated custom element
// members. trix 2 sees the constructor, takes its ElementInternals code path, and then calls
// `setFormValue`/`setValidity`, so fill in inert versions of what it uses.
if (typeof ElementInternals !== "undefined") {
  const proto = ElementInternals.prototype as any;
  const noop = () => {};
  for (const method of ["setFormValue", "setValidity"]) {
    if (!(method in proto)) proto[method] = noop;
  }
  for (const method of ["checkValidity", "reportValidity"]) {
    if (!(method in proto)) proto[method] = () => true;
  }
  for (const getter of ["form", "labels", "validationMessage", "willValidate", "validity"]) {
    if (!(getter in proto)) Object.defineProperty(proto, getter, { get: () => undefined, configurable: true });
  }
}

export {};
