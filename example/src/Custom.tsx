import { PDFDocumentProxy } from "pdfjs-dist/types/display/api";
import React, { useEffect, useState } from "react";
import { getPage, getStream, PdfCustomLayer, useViewport } from "pdf-viewport";

import { tw } from "twind";

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

export default Custom;
