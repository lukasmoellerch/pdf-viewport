import * as React from "react";
import { useEffect, useRef } from "react";
import { renderSVG } from "../lib/render-svg";
import { useViewport } from "./viewport";

interface Props {
  darkMode?: boolean;
}

/**
 * This component renders the pdf viewport using an svg element.
 *
 * This component has to be rendered as a child of a `PdfViewport`.
 *
 * @example
 * ```tsx
 *  <PdfViewport
 *    pdf={pdf}
 *    approximateAspectRatio={portraitA4}
 *    pageNumber={page}
 *  >
 *    <PdfSvgLayer />
 *  </PdfViewport>
 * ```
 *
 */
const PdfSvgLayer: React.FC<Props> = ({ darkMode }) => {
  // Extract the data from `PdfViewport`.
  const {
    pdf,
    pageNumber,
    targetWidth,
    xStart,
    xEnd,
    yStart,
    pageAspectRatio,
  } = useViewport();

  // The parent we attach the svg element to
  const ref = useRef<HTMLDivElement>() as React.MutableRefObject<
    HTMLDivElement
  >;

  useEffect(() => {
    let cancel = false;
    (async () => {
      const s = await renderSVG(pdf, pageNumber, darkMode);
      if (cancel) return;

      const p = ref.current;
      if (p === null) return;
      while (p.firstChild) p.removeChild(p.firstChild);
      p.appendChild(s);

      s.setAttribute("width", "100%");
      s.setAttribute("height", "100%");
    })();
    return () => {
      cancel = true;
    };
  }, [pdf, pageNumber, ref, darkMode]);

  return (
    <div
      ref={ref}
      style={{
        // The `PdfViewport` already handles the aspect ratio and it's also `position: "relative"` we
        // simply cover its area.
        position: "absolute",
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,

        // The svg is only used for display purposes. We ignore all pointer events and also
        // ensure that the svg itself is not selectable. The text spans will not contain the string content
        // of the pdf, but junk.
        pointerEvents: "none",
        userSelect: "none",
        WebkitUserSelect: "none",
        MozUserSelect: "none",
        backfaceVisibility: "hidden",
        WebkitBackfaceVisibility: "hidden",
        MozBackfaceVisibility: "hidden",
        willChange: "opacity",

        // Apply transforms so that the pdf is cropped correctly:
        // (xEnd - xStart) = 100 width in relative cropped display space
        // we shift it xStart units to the right
        // (yEnd - yStart) = 100 height in relative cropped display space
        // we shift it yStart units up
        // Finally we scale it so that the relative cropped display space matches
        // the given `targetWidth`
        transform: `translateX(-${xStart * 100}%) translateY(-${yStart *
          100}%)`,
        width: `${targetWidth / (xEnd - xStart)}px`,
        height: `${targetWidth / pageAspectRatio / (xEnd - xStart)}px`,

        // We transform with a coordinate system that has its origin in the top right coordinates
        // this makes coordinate system transformations easier.
        transformOrigin: "0 0",
      }}
    />
  );
};

export default PdfSvgLayer;
