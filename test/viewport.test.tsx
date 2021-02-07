import * as React from "react";
import * as ReactDOM from "react-dom";
import { PdfViewport } from "../src";
import { portraitA4 } from "../src/components/viewport";

describe("it", () => {
  it("renders without crashing", () => {
    const div = document.createElement("div");
    ReactDOM.render(
      <PdfViewport pdf={undefined} aspectRatio={portraitA4} pageNumber={1} />,
      div
    );
    ReactDOM.unmountComponentAtNode(div);
  });
});
