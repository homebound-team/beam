import { render } from "@homebound/rtl-utils";
import { Icon } from "src/components/Icon";

describe("Icon", () => {
  it("renders without crashing", async () => {
    const r = await render(<Icon icon="x" />);
    expect(r.baseElement).toMatchInlineSnapshot(`
      .emotion-0 {
        display: -webkit-box;
        display: -webkit-flex;
        display: -ms-flexbox;
        display: flex;
        -webkit-flex-direction: column;
        -ms-flex-direction: column;
        flex-direction: column;
        min-height: 0;
        min-width: 0;
      }

      .emotion-1 {
        padding-left: 0px;
        padding-right: 0px;
      }

      .emotion-2 path {
        fill: currentColor;
      }

      .emotion-3 {
        -webkit-box-flex: 1;
        -webkit-flex-grow: 1;
        -ms-flex-positive: 1;
        flex-grow: 1;
        overflow: auto;
        padding-left: 0px;
        padding-right: 0px;
      }

      <body>
        <div>
          <div
            data-overlay-container="true"
          >
            <div
              class="emotion-0"
            >
              <div
                class="emotion-1"
              >
                <svg
                  aria-hidden="true"
                  class="emotion-2"
                  data-icon="x"
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
              <div
                class="emotion-3"
              >
                <div
                  style="height: 100%;"
                />
              </div>
            </div>
          </div>
        </div>
      </body>
    `);
  });
});
