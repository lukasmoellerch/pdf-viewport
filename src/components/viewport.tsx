import { PDFDocumentProxy } from "pdfjs-dist/types/display/api";
import * as React from "react";
import {
  DetailedHTMLProps,
  HTMLAttributes,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  createContext,
  useState,
  useContext,
} from "react";
import { getPage } from "../lib/promise-memo";

interface ViewportContextData {
  pdf: PDFDocumentProxy;
  pageNumber: number;
  targetWidth: number;

  pageAspectRatio: number;

  xStart: number;
  xEnd: number;
  yStart: number;
  yEnd: number;
}
const ViewportContext = createContext<ViewportContextData | undefined>(
  undefined
);
export const useViewport = () => {
  const data = useContext(ViewportContext);
  if (data === undefined)
    throw new Error("useViewport called without a Viewport parent,");
  return data;
};

// width / height
export const portraitA4 = 595 / 841;
export const landscapeA4 = 1 / portraitA4;
export const dynamic = Symbol("dynamic");

interface Props
  extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
  aspectRatio?: number;
  approximateAspectRatio?: number;
  pdf: PDFDocumentProxy | undefined;
  pageNumber: number;

  xStart?: number;
  xEnd?: number;

  yStart?: number;
  yEnd?: number;
}

const PdfViewport: React.FC<Props> = ({
  aspectRatio,
  approximateAspectRatio,
  pdf,
  pageNumber,
  children,

  xStart = 0,
  xEnd = 1,

  yStart = 0,
  yEnd = 1,

  ...rest
}) => {
  const [computedAspectRation, setComputedAspectRatio] = useState<
    undefined | number
  >(undefined);
  const [width, setWidth] = useState(0);
  useEffect(() => {
    if (pdf === undefined) return;
    if (approximateAspectRatio !== undefined) {
      let cancel = false;

      getPage(pdf, pageNumber).then(page => {
        if (cancel) return;
        const intrinsicSize = page.getViewport({ scale: 1 });
        const newAspect = intrinsicSize.width / intrinsicSize.height;
        setComputedAspectRatio(newAspect);
      });

      return () => {
        cancel = true;
      };
    }
    return undefined;
  }, [pageNumber, pdf, approximateAspectRatio]);
  const realPageAspectRatio =
    aspectRatio ?? computedAspectRation ?? approximateAspectRatio;

  const refElement = useRef<HTMLDivElement | null>(null);
  const observer = useMemo(
    () =>
      new (window as any).ResizeObserver(() => {
        setWidth(refElement.current?.getBoundingClientRect().width ?? 0);
      }),
    []
  );
  const ref = useCallback(
    (el: HTMLDivElement | null) => {
      if (refElement.current !== null) observer.unobserve(refElement.current);

      if (el === null) return;
      refElement.current = el;
      observer.observe(el);
    },
    [observer]
  );

  const viewportData = useMemo(
    () => ({
      width,
      pdf: pdf!,
      pageNumber,
      targetWidth: width,
      xStart,
      xEnd,
      yStart,
      yEnd,
      pageAspectRatio: realPageAspectRatio!,
    }),
    [width, pdf, pageNumber, xStart, xEnd, yStart, yEnd, realPageAspectRatio]
  );

  if (realPageAspectRatio === undefined)
    throw new Error(
      "either aspectRatio or approximateAspectRatio has to be set."
    );

  const effectiveAspectRatio =
    realPageAspectRatio * ((xEnd - xStart) / (yEnd - yStart));

  if (
    pdf === undefined ||
    (aspectRatio === undefined && computedAspectRation === undefined) ||
    width === 0
  ) {
    return (
      <div {...rest}>
        <div
          ref={ref}
          style={{
            paddingTop: `${(1 / effectiveAspectRatio) * 100}%`,
          }}
        ></div>
      </div>
    );
  }

  return (
    <div {...rest}>
      <div
        ref={ref}
        style={{
          paddingTop: `${(1 / effectiveAspectRatio) * 100}%`,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <ViewportContext.Provider value={viewportData}>
          {children}
        </ViewportContext.Provider>
      </div>
    </div>
  );
};

export default PdfViewport;
