import { render } from "@homebound/rtl-utils";
import { Icon } from "src/";

describe("Icon", () => {
  it("renders without crashing", async () => {
    const r = await render(<Icon icon="x" />);
    expect(r.baseElement).toMatchInlineSnapshot(`
      .emotion-0 path {
        fill: rgba(17,24,39,1);
      }

      <body>
        <div>
          <svg
            aria-hidden="true"
            class="emotion-0"
            height="24"
            viewBox="0 0 24 24"
            width="24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M16.192 6.34399L11.949 10.586L7.70697 6.34399L6.29297 7.75799L10.535 12L6.29297 16.242L7.70697 17.656L11.949 13.414L16.192 17.656L17.606 16.242L13.364 12L17.606 7.75799L16.192 6.34399Z"
            />
          </svg>
        </div>
      </body>
    `);
  });
});
