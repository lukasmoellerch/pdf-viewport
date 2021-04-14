import * as React from "react";
import { useEffect, useState } from "react";
import { getPage } from "../lib/promise-memo";
import { useViewport } from "./viewport";

const PdfLayer: React.FC = ({ children }) => {
  const {
    pdf,
    pageNumber,
    targetWidth,
    pageAspectRatio,
    xStart,
    xEnd,
    yStart,
    yEnd,
  } = useViewport();

  const [width, setWidth] = useState(42);

  useEffect(() => {
    let cancel = false;
    getPage(pdf, pageNumber).then(page => {
      if (!cancel) setWidth(page.getViewport({ scale: 1 }).width);
    });
    return () => {
      cancel = true;
    };
  }, [pageNumber, pdf]);

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,

        transform: `translateX(-${(xStart / (xEnd - xStart)) *
          100}%) translateY(-${(yStart / (yEnd - yStart)) *
          100}%) scale(${targetWidth / (xEnd - xStart) / width})`,
        transformOrigin: "0 0",
      }}
    >
      <div
        style={{
          width: width,
          height: width / pageAspectRatio,
          position: "relative",
        }}
      >
        {children}
      </div>
    </div>
  );
};
export default PdfLayer;
