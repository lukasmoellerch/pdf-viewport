import * as SliderPrimitive from "@radix-ui/react-slider";
import * as pdfjsLib from "pdfjs-dist/es5/build/pdf";
import { PDFDocumentProxy } from "pdfjs-dist/types/display/api";
import * as React from "react";
import { useEffect, useState } from "react";
import { css, tw } from "twind/css";
import {
  PdfCanvasLayer,
  PdfSvgLayer,
  PdfTextLayer,
  PdfViewport,
  portraitA4,
} from "../../src";
import "./index.css";

pdfjsLib.GlobalWorkerOptions.workerSrc =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.7.570/pdf.worker.min.js";

const StyledSlider: React.FC<SliderPrimitive.SliderOwnProps> = props => {
  return (
    <SliderPrimitive.Root
      className={tw(
        "absolute flex items-center select-none top-1/2 transform -translate-y-1/2",
        css({
          touchAction: "none",

          '&[data-orientation="horizontal"]': {
            width: "100%",
            height: "100%",
          },

          '&[data-orientation="vertical"]': {
            flexDirection: "column",
            width: "100px",
            height: "200px",
          },
        })
      )}
      {...props}
    />
  );
};

const StyledTrack: React.FC<SliderPrimitive.SliderTrackOwnProps> = props => {
  return <SliderPrimitive.Track {...props} />;
};

const StyledRange: React.FC<SliderPrimitive.SliderRangeOwnProps> = props => {
  return <SliderPrimitive.Range {...props} />;
};

const StyledThumb: React.FC<SliderPrimitive.SliderThumbOwnProps> = props => {
  const { children, ...rest } = props;
  return (
    <SliderPrimitive.Thumb
      className={tw(
        css({
          outline: "none",
          width: "0",
          height: "0",
        })
      )}
      {...rest}
    >
      {children}
      <span
        className={tw(
          css({
            outline: "none",
            display: "block",
            width: "22px",
            height: "22px",
            backgroundColor: "rgb(240, 240, 240)",
            borderRadius: "11px",
            "&:hover": { backgroundColor: "rgb(220, 220, 220)" },
          }),
          "ring-4 ring-gray-500 ring-opacity-40 hover:ring-opacity-60 focus:ring-opacity-80"
        )}
      ></span>
    </SliderPrimitive.Thumb>
  );
};

const App = () => {
  const [file, setFile] = useState<File | undefined>(undefined);
  const [documentProxy, setDocumentProxy] = useState<PDFDocumentProxy>();
  const changeHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files && event.target.files[0];
    if (file === null) return;
    setFile(file);
  };

  useEffect(() => {
    if (file === undefined) {
      setDocumentProxy(undefined);
      return;
    }

    let cancel = false;

    const fr = new FileReader();
    fr.onload = () => {
      if (cancel) return;
      const result = fr.result;
      if (!(result instanceof ArrayBuffer)) return;
      const ar = new Uint8Array(result);
      pdfjsLib.getDocument(ar).promise.then(pdf => {
        if (cancel) return;
        setDocumentProxy(pdf);
      });
    };
    fr.readAsArrayBuffer(file);

    return () => {
      cancel = true;
    };
  }, [file]);
  const [pageNumber, setPageNumber] = useState(1);
  const [maxWidth, setMaxWidth] = useState(900);
  const [svg, setSvg] = useState(false);
  const [darkAmount, setDarkAmount] = useState(0.5);

  return (
    <div>
      <div className={tw`my-4 max-w-4xl mx-auto px-5`}>
        <p>Choose a PDF file:</p>
        <div className={tw`flex space-x-2`}>
          <label
            className={tw`bg-blue-500 text-white rounded px-4 py-2 font-extrabold my-2 inline-block cursor-pointer`}
          >
            <input
              className={tw`hidden`}
              type="file"
              onChange={changeHandler}
              accept="application/pdf"
            />
            Choose File
          </label>
          {documentProxy !== undefined && (
            <button
              onClick={() => {
                setFile(undefined);
                setDocumentProxy(undefined);
              }}
              className={tw`bg-red-500 text-white rounded px-4 py-2 font-extrabold my-2 inline-block cursor-pointer`}
            >
              Close
            </button>
          )}
        </div>

        {documentProxy !== undefined && (
          <>
            <p>Max-Width:</p>

            <input
              type="range"
              min={200}
              max={3000}
              value={maxWidth}
              onChange={e => setMaxWidth(e.currentTarget.valueAsNumber)}
            />

            <label className={tw`md:w-2/3 block text-gray-500 font-bold`}>
              <input
                className={tw`mr-2 leading-tight`}
                type="checkbox"
                onChange={e => setSvg(e.currentTarget.checked)}
                checked={svg}
              />
              <span className={tw`text-sm`}>Use SVG</span>
            </label>
          </>
        )}
      </div>
      {documentProxy !== undefined && (
        <div
          className={tw`px-5 py-32 bg-gray-900`}
          style={{
            backgroundColor: "hsl(0,0%,9%)",
          }}
        >
          <div
            style={{
              margin: "auto",
              maxWidth,
              display: "flex",
            }}
            className={tw`rounded-md shadow-lg ring-1 ring-gray-400 relative z-10 overflow-hidden`}
          >
            <PdfViewport
              pdf={documentProxy}
              pageNumber={pageNumber}
              approximateAspectRatio={portraitA4}
              className={tw`w-full`}
            />

            <div
              className={tw`absolute inset-0`}
              style={{
                clipPath: `inset(0 ${(1 - darkAmount) * 100}% 0 0)`,
              }}
            >
              <PdfViewport
                pdf={documentProxy}
                pageNumber={pageNumber}
                approximateAspectRatio={portraitA4}
                className={tw`absolute inset-0`}
              >
                {svg ? <PdfSvgLayer darkMode /> : <PdfCanvasLayer darkMode />}
              </PdfViewport>
            </div>
            <div
              className={tw`absolute inset-0`}
              style={{
                clipPath: `inset(0 0 0 ${darkAmount * 100}%)`,
              }}
            >
              <PdfViewport
                pdf={documentProxy}
                pageNumber={pageNumber}
                approximateAspectRatio={portraitA4}
                className={tw`absolute inset-0`}
              >
                {svg ? <PdfSvgLayer /> : <PdfCanvasLayer />}
              </PdfViewport>
            </div>
            <StyledSlider
              min={0}
              max={1}
              step={0.01}
              aria-label="Image Slider"
              value={[darkAmount]}
              onValueChange={e => setDarkAmount(e[0])}
            >
              <StyledTrack>
                <StyledRange />
              </StyledTrack>
              <StyledThumb />
            </StyledSlider>
          </div>
          <div className={tw`my-4 max-w-4xl mx-auto px-5 text-white`}>
            <p>Page:</p>
            <div
              className={tw`grid grid-cols-5 md:grid-cols-10 xl:grid-cols-15 gap-2 my-3`}
            >
              {Array(documentProxy.numPages)
                .fill(0)
                .map((_, index) => (
                  <button
                    key={index}
                    disabled={index + 1 === pageNumber}
                    onClick={() => setPageNumber(index + 1)}
                    className={tw`p-2 rounded bg-blue-900 hover:bg-blue-700 disabled:bg-blue-600 disabled:ring-4 ring-blue-500 cursor-pointer text-white text-lg font-extrabold flex items-center justify-center`}
                  >
                    {index + 1}
                  </button>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
