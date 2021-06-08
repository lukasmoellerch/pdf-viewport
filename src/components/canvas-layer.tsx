import * as React from "react";
import { useCallback } from "react";
import useDpr from "../hooks/useDpr";
import { usePdf } from "../hooks/usePdf";
import { useViewport } from "./viewport";

/**
 * This component renders the pdf viewport on a canvas element, taking dpr into account
 *
 * This component has to be rendered as a child of a `PdfViewport`.
 *
 * If you want to conditionally display the canvas region (i.e. lazy-loading it) you can just
 * conditionally render `PdfCanvasLayer`. The `PdfViewport` will ensure that no layout shift
 * occurs.
 *
 * @example
 * ```tsx
 *  <PdfViewport
 *    pdf={pdf}
 *    approximateAspectRatio={portraitA4}
 *    pageNumber={page}
 *  >
 *    <PdfCanvasLayer />
 *  </PdfViewport>
 * ```
 *
 */
const PdfCanvasLayer: React.FC<{ className?: string }> = ({ className }) => {
  // Extract the data from `PdfViewport`.
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

  const dpr = useDpr(true);
  const [canvas, isPrimaryCanvas] = usePdf(
    pdf,
    pageNumber,
    xStart,
    xEnd,
    yStart,
    yEnd,
    // Our target width of the element itself is `targetWidth`, but the canvas resolution
    // has to be scaled to the region that the viewport is. E.g. if we render the left half
    // of a pdf page we have to make the primary canvas twice as big.
    // If we don't have the dpr yet (because either the first client-side render is taking place
    // or the component is rendered on the server) we pass undefined to defer rendering until the
    // useEffect call in useDpr sets the dpr. Rendering this component is pretty cheap so that
    // shouldn't be an issue.
    dpr !== undefined ? (targetWidth / (xEnd - xStart)) * dpr : undefined
  );

  /**
   * This is just a ref callback function that mounts the `canvas` in the referenced element and
   * removes all other children.
   */
  const canvasMountingPoint = useCallback<(element: HTMLDivElement) => void>(
    element => {
      if (element === null) return;
      if (canvas === null) return;

      // Delete all other children
      while (element.firstChild) element.removeChild(element.firstChild);
      // Add our canvas
      element.appendChild(canvas);
    },
    [canvas]
  );
  if (canvas) {
    return (
      <div
        style={{
          // The `PdfViewport` already handles the aspect ratio and it's also `position: "relative"` we
          // simply cover its area.
          position: "absolute",
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          // The canvas is only used for display purposes. We ignore all pointer events and also
          // ensure that the canvas itself is not selectable.
          pointerEvents: "none",
          userSelect: "none",
        }}
      >
        <div
          style={
            isPrimaryCanvas
              ? {
                  position: "absolute",

                  // The viewport has a horizontal size of 100% = xEnd - xStart (in relative pdf coordinates)
                  // We have to move the canvas xStart to the left in relative pdf coordinates
                  left: `-${(xStart / (xEnd - xStart)) * 100}%`,
                  // 100% = yEnd - yStart, move yStart relative units up
                  top: `-${(yStart / (yEnd - yStart)) * 100}%`,

                  // This is the size the primary canvas has to have as calculated above, but we are not using
                  // dpr here because we want the additional pixels to align on subpixels (in css term - they will still
                  // be hardware pixels)
                  width: targetWidth / (xEnd - xStart),
                  height: targetWidth / (xEnd - xStart) / pageAspectRatio,
                }
              : {
                  // If it's not a primary canvas we already know that it has the correct size and our viewport applied
                  // - we just have to position it in the top left corner.
                  position: "absolute",
                  top: 0,
                  left: 0,
                }
          }
          className={className}
          ref={canvasMountingPoint}
        />
      </div>
    );
  } else {
    // No canvas. no content.
    return <div />;
  }
};

export default PdfCanvasLayer;
