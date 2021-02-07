import { render } from "@testing-library/react";
import * as React from "react";
import { PdfViewport } from "../src";

describe("it", () => {
  it("renders without crashing", async () => {
    const { container } = render(
      <PdfViewport pdf={undefined} pageNumber={1} aspectRatio={1}></PdfViewport>
    );
    const contentWrapper = container.querySelector("div > div > div");
  });
});
