import * as pdfjsLib from "pdfjs-dist/es5/build/pdf";
import { getDocument } from "pdfjs-dist/es5/build/pdf";
import { PDFDocumentProxy } from "pdfjs-dist/types/display/api";
import * as React from "react";
import { useEffect, useState } from "react";
import "react-app-polyfill/ie11";
import * as ReactDOM from "react-dom";
import { tw } from "twind";
import examplePdf from "url:./assets/pdfjs_example.pdf";
import {
  getPage,
  getStream,
  PdfCanvasLayer,
  PdfCustomLayer,
  PdfSvgLayer,
  PdfTextLayer,
  PdfViewport,
  useViewport,
} from "../";

const portraitA4 = 0.772727273;

if ((module as any).hot) {
  (module as any).hot.accept();
}

pdfjsLib.GlobalWorkerOptions.workerSrc =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.7.570/pdf.worker.min.js";

const exampleA = `<PdfViewport
  aspectRatio={portraitA4}
  pdf={pdf}
  pageNumber={1}
>
  <PdfSvgLayer />
</PdfViewport>`;
const exampleB = `<PdfViewport
  aspectRatio={portraitA4}
  pdf={pdf}
  pageNumber={1}
>
  <PdfCanvasLayer />
</PdfViewport>`;

const exampleC = `<PdfViewport
  aspectRatio={portraitA4}
  pdf={pdf}
  pageNumber={1}
  yStart={0.1}
  yEnd={0.3}
>
  <PdfSvgLayer />
</PdfViewport>`;

const exampleD = `<PdfViewport
  aspectRatio={portraitA4}
  pdf={pdf}
  pageNumber={1}
  yStart={0.1}
  yEnd={0.3}
  xStart={0.1}
  xEnd={0.4}
>
  <PdfTextLayer />
  <PdfSvgLayer />
</PdfViewport>`;

export type Interval = [number, number];
export function merge(intervals: Interval[]) {
  if (intervals.length === 0) return [];
  intervals.sort(([a], [b]) => a - b);
  const stack: Interval[] = [[...intervals[0]]];
  for (let i = 1; i < intervals.length; i++) {
    const c = intervals[i];
    const t = stack[stack.length - 1];
    if (t[1] < c[0]) {
      stack.push([...c]);
    } else if (t[1] < c[1]) {
      t[1] = c[1];
    }
  }
  return stack;
}
const useIntervals = (
  pdf: PDFDocumentProxy,
  pageNumber: number,
  threshold: number
) => {
  const [intervals, setIntervals] = useState<Interval[]>([]);
  useEffect(() => {
    let cancel = false;
    const stream = getStream(pdf, pageNumber);
    (async () => {
      const page = await getPage(pdf, pageNumber);
      if (cancel) return;
      const scale = 1;
      const viewport = page.getViewport({ scale });
      const intervals: [number, number][] = [];
      const reader = (await stream).getReader();
      if (cancel) return;
      while (true) {
        const a = await reader.read();
        if (cancel) return;
        if (a.done) break;
        const { items } = a.value as {
          items: {
            dir: "ltr";
            height: number;
            width: number;
            transform: [number, number, number, number, number, number];
          }[];
        };
        for (let item of items) {
          const [_x, y] = [item.transform[4], item.transform[5]];

          const yStart =
            viewport.height / scale - (y + item.height) - threshold / scale / 2;
          const height = item.height + threshold / scale;

          intervals.push([yStart, yStart + height]);
        }
      }
      if (cancel) return;
      setIntervals(merge(intervals));
    })();
    return () => void (cancel = true);
  }, [pdf, pageNumber, threshold]);
  return intervals;
};

const Custom = ({ threshold }: { threshold: number }) => {
  const { pdf, pageNumber } = useViewport();
  const intervals = useIntervals(pdf, pageNumber, threshold);
  return (
    <PdfCustomLayer>
      {intervals.map(([start, end], i) => (
        <div
          key={i}
          className={tw`hover:bg-opacity-40 bg-red-300 bg-opacity-10 border-t border-b border-red-500 border-opacity-25 cursor-pointer transition-colors duration-75`}
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: start,
            height: end - start,
          }}
        ></div>
      ))}
    </PdfCustomLayer>
  );
};

const App = () => {
  const [pdf, setPdf] = useState<PDFDocumentProxy | undefined>();
  const [page, setPage] = useState(1);
  const [threshold, setThreshold] = useState(10);
  React.useEffect(() => {
    getDocument(examplePdf).promise.then(setPdf);
  }, []);
  const pageStyle = tw`shadow-lg rounded-md overflow-hidden border-1 border-gray-400`;
  const canvasStyle = tw`rounded-md overflow-hidden`;
  return (
    <div className={tw`container mx-auto px-6`}>
      <h1
        className={tw`text(4xl sm:6xl lg:7xl) font-extrabold tracking-tight text-gray-900 mt-12 mb-5`}
      >
        pdf-viewport
      </h1>
      <p
        className={tw`max-w-screen-lg text-lg sm:text-3xl sm:leading-10 font-medium mb-8 sm:mb-10 text-gray-700`}
      >
        A library that makes using{" "}
        <a
          href="https://mozilla.github.io/pdf.js/"
          className={tw`text-underline text-purple-600`}
        >
          pdfjs
        </a>{" "}
        in react projects easy.
      </p>
      <ul className={tw`list-disc my-4`}>
        <li>
          Minimizes layout shift by allowing developers to pass an estimated
          aspect ratio
        </li>
        <li>Displaying a pdf page can be done using a few lines of js</li>
        <li>
          Modular: The different layers are displayed on top of each other
          allowing users to add new layers that interact with the viewport and
          use the coordinate system of the pdf page
        </li>
        <li>
          Memoization: Results are being reused and copied / cloned whenever
          possible
        </li>
      </ul>

      <div className={tw`py-5 grid grid-cols-4 md:grid-cols-5 gap-4`}>
        <PdfViewport
          aspectRatio={portraitA4}
          pdf={pdf}
          pageNumber={1}
          className={pageStyle}
        >
          <PdfCanvasLayer className={canvasStyle} />
        </PdfViewport>
        <PdfViewport
          aspectRatio={portraitA4}
          pdf={pdf}
          pageNumber={2}
          className={pageStyle}
        >
          <PdfCanvasLayer className={canvasStyle} />
        </PdfViewport>
        <PdfViewport
          aspectRatio={portraitA4}
          pdf={pdf}
          pageNumber={3}
          className={pageStyle}
        >
          <PdfCanvasLayer className={canvasStyle} />
        </PdfViewport>
        <PdfViewport
          aspectRatio={portraitA4}
          pdf={pdf}
          pageNumber={4}
          className={pageStyle}
        >
          <PdfCanvasLayer className={canvasStyle} />
        </PdfViewport>
      </div>

      <h3 className={tw`text-lg font-bold mt-6 mb-4`}>
        Canvas &amp; SVG Rendering
      </h3>
      <div className={tw`flex flex-wrap w-100`}>
        <div
          className={tw`flex flex-grow bg-purple-100 justify-between p-3 items-start rounded-lg border-2 border-purple-200`}
        >
          <div className={tw`flex flex-col flex-grow`}>
            <div
              className={tw`text-center mr-auto bg-purple-500 rounded-lg py-2 px-5 text-purple-100 font-bold`}
            >
              SVG
            </div>
            <div
              className={tw`flex flex-grow items-center text-purple-800 my-5 p-2`}
            >
              <pre className={tw`mx-auto text-xs sm:text-sm md:text-lg`}>
                {exampleA}
              </pre>
            </div>
          </div>
          <div
            className={pageStyle + " " + tw`bg-white w-1/3 md:w-1/2`}
            style={{ minWidth: "12em" }}
          >
            <PdfViewport aspectRatio={portraitA4} pdf={pdf} pageNumber={1}>
              <PdfSvgLayer />
            </PdfViewport>
          </div>
        </div>
        <div
          className={tw`flex flex-grow bg-green-100 justify-between p-3 items-start rounded-lg border-2 border-green-200`}
        >
          <div
            className={pageStyle + " " + tw`bg-white w-1/3 md:w-1/2`}
            style={{ minWidth: "12em" }}
          >
            <PdfViewport aspectRatio={portraitA4} pdf={pdf} pageNumber={1}>
              <PdfCanvasLayer className={canvasStyle} />
            </PdfViewport>
          </div>
          <div className={tw`flex flex-col flex-grow`}>
            <div
              className={tw`text-center ml-auto bg-green-500 rounded-lg py-2 px-5 text-green-100 font-bold`}
            >
              Canvas
            </div>
            <div
              className={tw`flex flex-grow items-center text-green-800 my-5 p-2`}
            >
              <pre className={tw`mx-auto text-xs sm:text-sm md:text-lg`}>
                {exampleB}
              </pre>
            </div>
          </div>
        </div>
      </div>

      <h3 className={tw`text-lg font-bold mt-6 mb-4`}>Cropping</h3>
      <div className={tw`grid grid-cols-1 xl:grid-cols-2 gap-3`}>
        <PdfViewport
          aspectRatio={portraitA4}
          pdf={pdf}
          pageNumber={1}
          yStart={0.1}
          yEnd={0.3}
          className={pageStyle + " " + tw`w-5/6 mx-auto xl:ml-0`}
        >
          <PdfSvgLayer />
        </PdfViewport>
        <pre>{exampleC}</pre>
      </div>
      <h3 className={tw`text-lg font-bold mt-6 mb-4`}>Text Layer</h3>
      <div className={tw`grid grid-cols-1 xl:grid-cols-2 gap-8`}>
        <PdfViewport
          aspectRatio={portraitA4}
          pdf={pdf}
          pageNumber={1}
          yStart={0.1}
          yEnd={0.3}
          xStart={0.1}
          xEnd={0.4}
          className={pageStyle + " " + tw`w-5/6 mx-auto xl:ml-0`}
        >
          <PdfTextLayer />
          <PdfSvgLayer />
        </PdfViewport>
        <pre>{exampleD}</pre>
      </div>
      <h3 className={tw`text-lg font-bold mt-6 mb-4`}>Custom Layer</h3>
      <p className={tw`mb-3`}>
        This example implements a custom layer that displays regions with text.
        It utilizes the viewport context to get a reference to the underlying
        pdfjs handle, retrieves the text stream and uses the custom layer api to
        display these regions in the coordinate space of the pdf. This way
        cropping is supported as well and the content is dynamically resized to
        match the PDF. Overlapping text boxes are merged after they are enlarged
        by a constant threshold which can be adjusted using the slider below.
        Using this custom layer is as simple as using of the provided ones:
        Simple add <code>{`<Custom threshold={threshold} />`}</code> to your
        PdfViewport.
      </p>
      <div className={tw`md:w-5/6 lg:w-2/3 xl:w-1/2 mx-auto`}>
        <PdfViewport
          aspectRatio={portraitA4}
          pdf={pdf}
          pageNumber={page}
          className={pageStyle}
        >
          <PdfSvgLayer />
          <Custom threshold={threshold} />
        </PdfViewport>
        <table className={tw`w-full mt-3 mb-8`}>
          <tr>
            <td className={tw`w-0`}>Threshold: </td>
            <td className={tw`pl-4 pt-3 pb-2 w-full`}>
              <input
                type="range"
                className={tw`w-full`}
                value={threshold}
                min={0}
                max={50}
                onChange={e => setThreshold(e.target.valueAsNumber)}
              />
            </td>
          </tr>
          <tr>
            <td className={tw`w-0`}>Page: </td>
            <td className={tw`pl-4 pt-3 pb-2 w-full`}>
              <input
                type="range"
                className={tw`w-full`}
                value={page}
                min={1}
                max={pdf?.numPages}
                onChange={e => setPage(e.target.valueAsNumber)}
              />
            </td>
          </tr>
        </table>
      </div>
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById("root"));
