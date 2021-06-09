import { Meta, Story } from "@storybook/react";
import * as pdfjsLib from "pdfjs-dist/es5/build/pdf";
import { getDocument } from "pdfjs-dist/es5/build/pdf";
import { PDFDocumentProxy } from "pdfjs-dist/types/display/api";
import React, { useEffect, useState } from "react";
import { PdfCanvasLayer, PdfViewport } from "..";
import examplePdf from "./assets/pdfjs_example.pdf";

export default {
  title: "PdfViewport/Canvas",
  component: PdfCanvasLayer,
  argTypes: {
    maxWidth: {
      defaultValue: 500,
      control: { type: "range", min: 100, max: 1500, step: 10 },
    },
  },
} as Meta;

pdfjsLib.GlobalWorkerOptions.workerSrc =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.7.570/pdf.worker.min.js";

const portraitA4 = 0.772727273;

const Template: Story<{ maxWidth: number }> = ({ maxWidth }) => {
  const [pdf, setPdf] = useState<PDFDocumentProxy>();
  useEffect(() => {
    getDocument(examplePdf).promise.then(setPdf);
  }, []);
  return (
    <PdfViewport
      aspectRatio={portraitA4}
      pdf={pdf}
      pageNumber={3}
      style={{ maxWidth, margin: "auto", border: "1px solid black" }}
    >
      <PdfCanvasLayer />
    </PdfViewport>
  );
};

export const Canvas = Template.bind({});
Canvas.args = {};
