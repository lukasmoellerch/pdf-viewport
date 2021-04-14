import { PDFDocumentProxy } from "pdfjs-dist/types/display/api";
import { useState, useEffect } from "react";
import { getPage } from "../lib/promise-memo";
import { PdfCanvasReference } from "../lib/reference-counting";
import { renderCanvasRegion } from "../lib/render-canvas";

/**
 * A hook that wraps `renderCanvasRegion` iin a react hook
 * @param pdf The pdf given as a `PDFDocumentProxy` which should be rendered in a canvas
 * @param pageNumber The page to be rendered
 * @param xStart the left boundary of the cropping region given relative to the width 0 <= `xStart` < `xEnd`
 * @param xEnd the right boundary of the cropping region given relative to the width `xStart` < `xEnd` <= 1
 * @param yStart the top boundary of the cropping region given relative to the height `0` <= `yStart` < `yEnd`
 * @param yEnd the bottom boundary of the cropping region given relative to the height `yStart` < `yEnd` <= `1`
 * @param targetWidth The resolution the resulting canvas should have given as the number
 * of horizontal pixels that a full-size render of the the page given as `pageNumber` should
 * have. Rendering is deferred until `targetWidth` is set.
 * @returns A canvas element and a boolean that is true iff. the canvas is a primary canvas
 * -> see render-canvas for details for what a primary canvas is
 */
export function usePdf(
  pdf: PDFDocumentProxy,
  pageNumber: number,
  xStart: number,
  xEnd: number,
  yStart: number,
  yEnd: number,
  targetWidth: number | undefined
): [HTMLCanvasElement | null, boolean] {
  const [canvasElement, setCanvasElement] = useState<HTMLCanvasElement | null>(
    null
  );

  const [isPrimaryCanvas, setIsPrimaryCanvas] = useState(false);
  useEffect(() => {
    if (targetWidth === undefined) return;
    /** Whether the effect was already cancelled */
    let cancel = false;

    /**
     * If we got a canvas already we store its reference here so that we can release it
     * in the cleanup function
     */
    let canvasRef: PdfCanvasReference | undefined;

    /**
     * We also have to handle the case where we started a promise, but are interrupted while
     * the promise is running. In that case we save the promise here so that we can still release
     * the resulting reference.
     */
    let currentPromise:
      | Promise<[HTMLCanvasElement, boolean, PdfCanvasReference]>
      | undefined;

    (async () => {
      const page = await getPage(pdf, pageNumber);
      if (cancel) return;

      const viewport = page.getViewport({ scale: 1.0 });

      currentPromise = renderCanvasRegion(
        pdf,
        pageNumber,
        targetWidth / viewport.width,
        xStart,
        xEnd,
        yStart,
        yEnd
      );
      const [canvas, isMain, ref] = await currentPromise;

      canvasRef = ref;
      if (cancel) return;
      setIsPrimaryCanvas(isMain);
      setCanvasElement(canvas);
    })();
    return () => {
      cancel = true;
      setCanvasElement(null);

      if (canvasRef) canvasRef.release();
      else if (currentPromise) {
        currentPromise.then(([, , newRef]) => newRef.release());
      }
    };
  }, [pdf, pageNumber, targetWidth, xStart, xEnd, yStart, yEnd]);
  return [canvasElement, isPrimaryCanvas];
}
