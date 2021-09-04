import { PDFDocumentProxy } from "pdfjs-dist/types/display/api";
import { globalFactory } from "./canvas-factory";
import { CanvasObject } from "./canvas-object";
import { getCache2 } from "./memo";
import { getPage } from "./promise-memo";
import {
  PdfCanvasReference,
  PdfCanvasReferenceManager,
} from "./reference-counting";
import { CanvasMiddleware } from "./utils";

// This middleware does nothing
export const idCanvasMiddleware: CanvasMiddleware = x => x;

interface MainCanvasPageLoadedData {
  width: number;
  height: number;
}
/**
 * Each page has one main canvas that pdf-js renders to. This interface
 * describes the data that is associated with such a canvas. Please notice
 * that is not guaranteed that the content is rendered until the `rendered`
 * Promie is resolved. The `pageLoaded` promise is guaranteed to always resolve
 * before `rendered` is resolved.
 */
interface MainCanvas {
  scale: number;
  currentMainRef: PdfCanvasReference | undefined;
  canvasObject: CanvasObject;
  referenceManager: PdfCanvasReferenceManager;
  pageLoaded: Promise<MainCanvasPageLoadedData>;
  rendered: Promise<void>;
}

/**
 * Each `Set` once set shouldn't change anymore as it saves us from having to lookup
 * again. You therefore need to clear each set if you want to remove all references.
 */
const mainCanvasMap: WeakMap<
  PDFDocumentProxy,
  WeakMap<CanvasMiddleware, Map<number, Set<MainCanvas>>>
> = new WeakMap();

/**
 * Renders the page `pageNumber` to `canvasObject` with a scale of
 * `scale`. Creates a reference using `referenceManager` that is active
 * until rendering is finished. It expects that `canvasObject` is not
 * reused until the reference is released. The method also sets the
 * `width` and `height` of the `canvasObject`.
 * @param referenceManager The reference manager which manages references
 *                         to the main canvas object the result is used for
 * @param canvasObject The canvas object to render to
 * @param pageNumber The page number to render (starting with 1)
 * @param scale The scale to render the page at
 * @param middleware A middleware to apply while rendering
 * @returns two promises:
 * [0]: when the page is loaded,
 * [1]: when the page is rendered
 */
function renderCanvas(
  pdf: PDFDocumentProxy,
  referenceManager: PdfCanvasReferenceManager,
  canvasObject: CanvasObject,
  pageNumber: number,
  scale: number,
  middleware: CanvasMiddleware
): [Promise<void>, Promise<void>] {
  const renderingReference = referenceManager.createRetainedRef();
  const pagePromise = getPage(pdf, pageNumber);
  const renderingPromise = (async () => {
    const page = await pagePromise;

    const viewport = page.getViewport({ scale });
    canvasObject.canvas.width = viewport.width;
    canvasObject.canvas.height = viewport.height;
    canvasObject.canvas.style.width = "100%";
    canvasObject.canvas.style.height = "100%";
    await new Promise(resolve => window.requestAnimationFrame(resolve));
    if (middleware !== idCanvasMiddleware) {
      const context = middleware(canvasObject.context);
      await page.render({
        canvasContext: context,
        viewport,
        canvasFactory: globalFactory,
      }).promise;
    } else {
      await page.render({
        canvasContext: canvasObject.context,
        viewport,
        canvasFactory: globalFactory,
      }).promise;
    }
    renderingReference.release();
  })();

  return [pagePromise.then(() => undefined), renderingPromise];
}
/**
 * Creates a new mainCanvas for `pageNumber` and renders the page to it.
 * The `MainCanvas` object contains all the necessary data.
 * @param pdf The pdf to render
 * @param pageNumber The page number to render (starting with 1)
 * @param scale The scale to render the page at
 * @param middleware A middleware to apply while rendering
 */
function createMainCanvas(
  pdf: PDFDocumentProxy,
  pageNumber: number,
  scale: number,
  middleware: CanvasMiddleware
): MainCanvas {
  const cache = getCache2(mainCanvasMap, pdf, middleware);
  const canvasObject = globalFactory.create(undefined, undefined);
  const referenceManager = new PdfCanvasReferenceManager(0);
  const initialRef = referenceManager.createRetainedRef();
  const [loadPromise, renderingPromise] = renderCanvas(
    pdf,
    referenceManager,
    canvasObject,
    pageNumber,
    scale,
    middleware
  );
  const mainCanvas: MainCanvas = {
    scale,
    currentMainRef: initialRef,
    canvasObject,
    referenceManager,
    pageLoaded: (async () => {
      await loadPromise;
      return {
        width: canvasObject.canvas.width,
        height: canvasObject.canvas.height,
      };
    })(),
    rendered: renderingPromise,
  };
  // Add the mainCanvas to the correct set
  const existingSet = cache.get(pageNumber);
  const newSet = new Set([mainCanvas]);
  const mainCanvasSet = existingSet || newSet;
  if (existingSet) {
    existingSet.add(mainCanvas);
  } else {
    const cache = getCache2(mainCanvasMap, pdf, middleware);
    cache.set(pageNumber, newSet);
  }
  // Remove it if we no longer need it
  let timeout: number | undefined;
  initialRef.addListener(() => {
    mainCanvas.currentMainRef = undefined;
  });
  referenceManager.addListener((cnt: number) => {
    if (cnt <= 0) {
      // We keep the mainCanvas around a bit so that it can be reused.
      // 10_000 turned out to be a decent value.
      timeout = window.setTimeout(() => {
        globalFactory.destroy(canvasObject);
        mainCanvasSet.delete(mainCanvas);
      }, 10_000);
    } else {
      // If the reference is used again we abort its removal.
      if (timeout) window.clearTimeout(timeout);
      timeout = undefined;
    }
  });
  return mainCanvas;
}
/**
 * Renders `pageNumber` from `start` to `end` using at least `scale`.
 * It returns a promise that resolves when the content is rendered. The method
 * can either return a main canvas or just the specified section. If a main
 * canvas is returned you are responsible for aligning it correctly. It assumes
 * that scaling a canvas down doesn't reduce the quality. You are also responsible
 * for releasing the retained reference that gets returned. There is no guarantee
 * the size of the the canvas that the promise resolves to. It's aspect ratio will
 * match the aspect ration of the pdf page if the canvas is a main canvas. Otherwise
 * the aspect ratio will match the aspect ratio of the section.
 * @param pdf The pdf to render
 * @param pageNumber The page number to render (starting with 1)
 * @param scale Minimum scale
 * @param xStart Relative x-start on page
 * @param xEnd Relative x-end on page
 * @param yStart Relative y-start on page
 * @param yEnd Relative y-end on page
 * @param middleware A middleware to apply while rendering
 * @returns A promise resolving to an array:
 * [0]: The canvas,
 * [1]: Wether the canvas is a main canvas,
 * [2]: The reference you have to release if you no longer need the canvas.
 */
export async function renderCanvasRegion(
  pdf: PDFDocumentProxy,
  pageNumber: number,
  scale: number,
  xStart: number,
  xEnd: number,
  yStart: number,
  yEnd: number,
  middleware: CanvasMiddleware = idCanvasMiddleware
): Promise<[HTMLCanvasElement, boolean, PdfCanvasReference]> {
  const cache = getCache2(mainCanvasMap, pdf, middleware);

  const mainCanvasSet = cache.get(pageNumber);
  let mainCanvas: MainCanvas | undefined;
  let isMainUser = false;
  if (mainCanvasSet) {
    for (const existingMainCanvas of mainCanvasSet) {
      if (
        // We allow slightly main canvas with a slightly smaller size. This
        // might not be the best way to do it
        existingMainCanvas.scale * 1.2 >= scale &&
        // It might be possible that there is a main canvas that is suitable
        // and currently has no use. Prefer to use that one instead.
        (mainCanvas === undefined || mainCanvas.currentMainRef !== undefined)
      ) {
        mainCanvas = existingMainCanvas;
      }
    }
    // Did we find a main canvas that isn't used?
    if (mainCanvas && mainCanvas.currentMainRef === undefined) {
      isMainUser = true;
      mainCanvas.currentMainRef = mainCanvas?.referenceManager.createRetainedRef();
    }
  }

  // It looks like we have to render from scratch
  if (mainCanvas === undefined) {
    mainCanvas = createMainCanvas(pdf, pageNumber, scale, middleware);
    isMainUser = true;
  }
  // This isn't possible but it's hard to tell typescript that it is not
  // possible.
  if (mainCanvas === undefined) throw new Error();
  const ref = isMainUser
    ? mainCanvas.currentMainRef!
    : mainCanvas.referenceManager.createRetainedRef();

  if (isMainUser) {
    ref.addListener(() => {
      // Typescript still thinks that mainCanvas could be undefined...
      if (mainCanvas === undefined) throw new Error();
      mainCanvas.currentMainRef = undefined;
    });

    return [mainCanvas.canvasObject.canvas, true, ref];
  } else {
    // It should also be possible to await mainCanvas.pageLoaded first
    // but it doesn't really matter.
    const [pageSize, page] = await Promise.all([
      mainCanvas.pageLoaded,
      getPage(pdf, pageNumber),
    ]);
    const viewport = page.getViewport({ scale });
    const width = viewport.width * (xEnd - xStart);
    const height = viewport.height * (yEnd - yStart);
    const obj = globalFactory.create(width, height);
    const newManager = new PdfCanvasReferenceManager(0);
    const childRef = newManager.createRetainedRef();
    obj.canvas.style.width = "100%";
    obj.canvas.style.height = "100%";
    //source
    const [sx, sy, sw, sh] = [
      pageSize.width * xStart,
      pageSize.height * yStart,
      (xEnd - xStart) * pageSize.width,
      (yEnd - yStart) * pageSize.height,
    ];
    // destination
    const [dx, dy, dw, dh] = [0, 0, width, height];
    const renderingReference = newManager.createRetainedRef();
    mainCanvas.rendered.then(() => {
      const ctx = obj.context;
      if (ctx === null) throw new Error("Rendering failed.");
      if (mainCanvas === undefined) throw new Error();
      ctx.drawImage(
        mainCanvas.canvasObject.canvas,
        sx,
        sy,
        sw,
        sh,
        dx,
        dy,
        dw,
        dh
      );
      renderingReference.release();
    });

    newManager.addListener((cnt: number) => {
      if (cnt <= 0) {
        ref.release();
        globalFactory.destroy(obj);
      }
    });

    return [obj.canvas, false, childRef];
  }
}
