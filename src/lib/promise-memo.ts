import { PDFDocumentProxy } from "pdfjs-dist/types/display/api";
import { memo } from "./memo";
import { SVGGraphics } from "pdfjs-dist/es5/build/pdf";

export const getPage = memo((pdf: PDFDocumentProxy, pageNumber: number) => {
  return pdf.getPage(pageNumber);
});
export const getOperatorList = memo(
  async (pdf: PDFDocumentProxy, pageNumber: number) => {
    return (await getPage(pdf, pageNumber)).getOperatorList();
  }
);
export const getGfx = memo(
  async (pdf: PDFDocumentProxy, pageNumber: number) => {
    const page = await getPage(pdf, pageNumber);
    return new SVGGraphics(page.commonObjs, page.objs);
  }
);
