<h1 align="center">
  pdf-viewport
  <br>
</h1>
<p align="center" style="font-size: 1.2rem;">
 A library that makes using pdfjs in react projects easy.
</p>
<p align="center" style="font-size: 1.2rem;">
  <img src="https://img.shields.io/npm/v/pdf-viewport">
</p>
<p align="center" style="font-size: 1.2rem;">
  Demo: <a href="https://pdf-viewport.lukas-moeller.ch">pdf-viewport.lukas-moeller.ch</a>
</p>

# Getting Started

Add `pdfjs-dist` and `pdf-viewport` as dependencies:
```bash
$ yarn add pdfjs-dist pdf-viewport
$ npm install --save pdfjs-dist pdf-viewport
```

Set `pdfjsLib.GlobalWorkerOptions.workerSrc`. You could for example use a hosted variant of the worker or use `worker-loader` to bundle the worker yourself using webpack.
```ts
import * as pdfjsLib from "pdfjs-dist/es5/build/pdf";
pdfjsLib.GlobalWorkerOptions.workerSrc = "[your worker url]"
```

Load the PDF using `getDocument` from pdfjs. You can do this e.g. using `useEffect` or react-query:
```ts
const [pdf, setPdf] = React.useState<PDFDocumentProxy | undefined>();
React.useEffect(() => {
  getDocument(examplePdf).promise.then(setPdf);
}, []);
```

Now you can use `pdf-viewport` to render the PDF using one of its components:
```tsx
<PdfViewport
  aspectRatio={portraitA4}
  pdf={pdf}
  pageNumber={1}
>
  <PdfCanvasLayer />
</PdfViewport>
```

## Reference

Coming soon!
