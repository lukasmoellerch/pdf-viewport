import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import { getPage } from '../lib/promise-memo';
import { renderText } from '../lib/render-text';
import { useViewport } from './viewport';

const PdfTextLayer: React.FC<{}> = () => {
  const {
    pdf,
    pageNumber,
    targetWidth,
    xStart,
    xEnd,
    yStart,
    yEnd,
  } = useViewport();

  const [width, setWidth] = useState(targetWidth);

  const el = useRef<HTMLDivElement>() as React.MutableRefObject<HTMLDivElement>;
  useEffect(() => {
    let cancel = false;
    getPage(pdf, pageNumber).then(page => {
      if (!cancel) setWidth(page.getViewport({ scale: 1 }).width);
    });
    renderText(pdf, pageNumber).then(textDiv => {
      if (cancel) return;
      const parent = el.current;
      if (parent === null) return;
      while (parent.firstChild) parent.removeChild(parent.firstChild);

      parent.appendChild(textDiv);
    });
    return () => {
      cancel = true;
    };
  }, [pageNumber, pdf]);

  return (
    <div
      ref={el}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
        transform: `translateX(-${(xStart / (xEnd - xStart)) *
          100}%) translateY(-${(yStart / (yEnd - yStart)) *
          100}%) scale(${targetWidth / (xEnd - xStart) / width})`,
        transformOrigin: '0 0',
      }}
    />
  );
};
export default PdfTextLayer;
