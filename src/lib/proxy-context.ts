/**
 * A ProxyContext proxies all methods to the underlying context. It is intended as a
 * superclass for middleware that need to intercept calls to the canvas rendering context.
 */
export class ProxyContext implements CanvasRenderingContext2D {
  ctx: CanvasRenderingContext2D;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
  }

  get canvas(): HTMLCanvasElement {
    return this.ctx.canvas;
  }

  get globalAlpha(): number {
    return this.ctx.globalAlpha;
  }
  set globalAlpha(alpha: number) {
    this.ctx.globalAlpha = alpha;
  }

  get globalCompositeOperation(): string {
    return this.ctx.globalCompositeOperation;
  }
  set globalCompositeOperation(globalCompositeOperation: string) {
    this.ctx.globalCompositeOperation = globalCompositeOperation;
  }

  beginPath(): void {
    this.ctx.beginPath();
  }

  clip(fillRule?: CanvasFillRule): void;
  clip(path: Path2D, fillRule?: CanvasFillRule): void;
  clip(path?: any, fillRule?: any) {
    if (fillRule === undefined) {
      this.ctx.clip(path);
    } else {
      this.ctx.clip(path, fillRule);
    }
  }

  isPointInPath(x: number, y: number, fillRule?: CanvasFillRule): boolean;
  isPointInPath(
    path: Path2D,
    x: number,
    y: number,
    fillRule?: CanvasFillRule
  ): boolean;
  isPointInPath(path: any, x: any, y?: any, fillRule?: any) {
    if (fillRule === undefined) {
      return this.ctx.isPointInPath(path, x, y);
    } else {
      return this.ctx.isPointInPath(path, x, y, fillRule);
    }
  }

  isPointInStroke(x: number, y: number): boolean;
  isPointInStroke(path: Path2D, x: number, y: number): boolean;
  isPointInStroke(path: any, x: any, y?: any): boolean {
    return this.ctx.isPointInStroke(path, x, y);
  }

  get fillStyle(): string | CanvasGradient | CanvasPattern {
    return this.ctx.fillStyle;
  }
  set fillStyle(fillStyle: string | CanvasGradient | CanvasPattern) {
    this.ctx.fillStyle = fillStyle;
  }

  get strokeStyle(): string | CanvasGradient | CanvasPattern {
    return this.ctx.strokeStyle;
  }
  set strokeStyle(strokeStyle: string | CanvasGradient | CanvasPattern) {
    this.ctx.strokeStyle = strokeStyle;
  }

  createLinearGradient(
    x0: number,
    y0: number,
    x1: number,
    y1: number
  ): CanvasGradient {
    return this.ctx.createLinearGradient(x0, y0, x1, y1);
  }
  createPattern(
    image: CanvasImageSource,
    repetition: string | null
  ): CanvasPattern | null {
    return this.ctx.createPattern(image, repetition);
  }

  createRadialGradient(
    x0: number,
    y0: number,
    r0: number,
    x1: number,
    y1: number,
    r1: number
  ): CanvasGradient {
    return this.ctx.createRadialGradient(x0, y0, r0, x1, y1, r1);
  }

  get filter(): string {
    return this.ctx.filter;
  }
  set filter(filter: string) {
    this.ctx.filter = filter;
  }

  createImageData(sw: number, sh: number): ImageData;
  createImageData(imagedata: ImageData): ImageData;
  createImageData(sw: any, sh?: any): ImageData {
    return this.ctx.createImageData(sw, sh);
  }

  getImageData(sx: number, sy: number, sw: number, sh: number): ImageData {
    return this.ctx.getImageData(sx, sy, sw, sh);
  }

  putImageData(imagedata: ImageData, dx: number, dy: number): void;
  putImageData(
    imagedata: ImageData,
    dx: number,
    dy: number,
    dirtyX: number,
    dirtyY: number,
    dirtyWidth: number,
    dirtyHeight: number
  ): void;
  putImageData(
    imagedata: any,
    dx: any,
    dy: any,
    dirtyX?: any,
    dirtyY?: any,
    dirtyWidth?: any,
    dirtyHeight?: any
  ) {
    this.ctx.putImageData(
      imagedata,
      dx,
      dy,
      dirtyX,
      dirtyY,
      dirtyWidth,
      dirtyHeight
    );
  }

  get imageSmoothingEnabled(): boolean {
    return this.ctx.imageSmoothingEnabled;
  }
  set imageSmoothingEnabled(enabled: boolean) {
    this.ctx.imageSmoothingEnabled = enabled;
  }

  get imageSmoothingQuality(): ImageSmoothingQuality {
    return this.ctx.imageSmoothingQuality;
  }
  set imageSmoothingQuality(imageSmoothingQuality: ImageSmoothingQuality) {
    this.ctx.imageSmoothingQuality = imageSmoothingQuality;
  }

  get lineCap(): CanvasLineCap {
    return this.ctx.lineCap;
  }
  set lineCap(lineCap: CanvasLineCap) {
    this.ctx.lineCap = lineCap;
  }

  get lineDashOffset(): number {
    return this.ctx.lineDashOffset;
  }
  set lineDashOffset(lineDashOffset: number) {
    this.ctx.lineDashOffset = lineDashOffset;
  }

  get lineJoin(): CanvasLineJoin {
    return this.ctx.lineJoin;
  }
  set lineJoin(lineJoin: CanvasLineJoin) {
    this.ctx.lineJoin = lineJoin;
  }

  get lineWidth(): number {
    return this.ctx.lineWidth;
  }
  set lineWidth(width: number) {
    this.ctx.lineWidth = width;
  }

  get miterLimit(): number {
    return this.ctx.miterLimit;
  }
  set miterLimit(limit: number) {
    this.ctx.miterLimit = limit;
  }

  getLineDash(): number[] {
    return this.ctx.getLineDash();
  }

  setLineDash(segments: number[]): void;
  setLineDash(segments: Iterable<number>): void;
  setLineDash(segments: any) {
    this.ctx.setLineDash(segments);
  }

  clearRect(x: number, y: number, w: number, h: number): void {
    this.ctx.clearRect(x, y, w, h);
  }

  get shadowBlur(): number {
    return this.ctx.shadowBlur;
  }
  set shadowBlur(blur: number) {
    this.ctx.shadowBlur = blur;
  }

  get shadowColor(): string {
    return this.ctx.shadowColor;
  }
  set shadowColor(color: string) {
    this.ctx.shadowColor = color;
  }

  get shadowOffsetX(): number {
    return this.ctx.shadowOffsetX;
  }
  set shadowOffsetX(x: number) {
    this.ctx.shadowOffsetX = x;
  }

  get shadowOffsetY(): number {
    return this.ctx.shadowOffsetY;
  }
  set shadowOffsetY(y: number) {
    this.ctx.shadowOffsetY = y;
  }

  restore(): void {
    this.ctx.restore();
  }

  save(): void {
    this.ctx.save();
  }

  measureText(text: string): TextMetrics {
    return this.ctx.measureText(text);
  }

  get direction(): CanvasDirection {
    return this.ctx.direction;
  }
  set direction(direction: CanvasDirection) {
    this.ctx.direction = direction;
  }

  get font(): string {
    return this.ctx.font;
  }
  set font(font: string) {
    this.ctx.font = font;
  }

  get textAlign(): CanvasTextAlign {
    return this.ctx.textAlign;
  }
  set textAlign(textAlign: CanvasTextAlign) {
    this.ctx.textAlign = textAlign;
  }

  get textBaseline(): CanvasTextBaseline {
    return this.ctx.textBaseline;
  }
  set textBaseline(textBaseline: CanvasTextBaseline) {
    this.ctx.textBaseline = textBaseline;
  }

  resetTransform(): void {
    this.ctx.resetTransform();
  }

  rotate(angle: number): void {
    this.ctx.rotate(angle);
  }

  scale(x: number, y: number): void {
    this.ctx.scale(x, y);
  }

  setTransform(
    a: number,
    b: number,
    c: number,
    d: number,
    e: number,
    f: number
  ): void;
  setTransform(transform?: DOMMatrix2DInit): void;
  setTransform(a?: any, b?: any, c?: any, d?: any, e?: any, f?: any) {
    this.ctx.setTransform(a, b, c, d, e, f);
  }

  transform(
    a: number,
    b: number,
    c: number,
    d: number,
    e: number,
    f: number
  ): void {
    this.ctx.transform(a, b, c, d, e, f);
  }

  translate(x: number, y: number): void {
    this.ctx.translate(x, y);
  }

  drawFocusIfNeeded(element: Element): void;
  drawFocusIfNeeded(path: Path2D, element: Element): void;
  drawFocusIfNeeded(path: any, element?: any) {
    this.ctx.drawFocusIfNeeded(path, element);
  }

  scrollPathIntoView(): void;
  scrollPathIntoView(path: Path2D): void;
  scrollPathIntoView(path?: any) {
    this.ctx.scrollPathIntoView(path);
  }

  getTransform(): DOMMatrix {
    return this.ctx.getTransform();
  }

  fillRect(x: number, y: number, w: number, h: number) {
    this.ctx.fillRect(x, y, w, h);
  }
  rect(x: number, y: number, w: number, h: number) {
    this.ctx.rect(x, y, w, h);
  }
  strokeRect(x: number, y: number, w: number, h: number) {
    this.ctx.strokeRect(x, y, w, h);
  }

  drawImage(image: CanvasImageSource, dx: number, dy: number): void;
  drawImage(
    image: CanvasImageSource,
    dx: number,
    dy: number,
    dw: number,
    dh: number
  ): void;
  drawImage(
    image: CanvasImageSource,
    sx: number,
    sy: number,
    sw: number,
    sh: number,
    dx: number,
    dy: number,
    dw: number,
    dh: number
  ): void;
  drawImage(
    image: any,
    sx: any,
    sy: any,
    sw?: any,
    sh?: any,
    dx?: any,
    dy?: any,
    dw?: any,
    dh?: any
  ) {
    this.ctx.drawImage(image, sx, sy, sw, sh, dx, dy, dw, dh);
  }

  fillText(text: string, x: number, y: number) {
    this.ctx.fillText(text, x, y);
  }

  strokeText(text: string, x: number, y: number) {
    this.ctx.strokeText(text, x, y);
  }

  moveTo(x: number, y: number) {
    this.ctx.moveTo(x, y);
  }

  lineTo(x: number, y: number) {
    this.ctx.lineTo(x, y);
  }

  bezierCurveTo(
    cp1x: number,
    cp1y: number,
    cp2x: number,
    cp2y: number,
    x: number,
    y: number
  ) {
    this.ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y);
  }

  arc(
    x: number,
    y: number,
    radius: number,
    startAngle: number,
    endAngle: number
  ) {
    this.ctx.arc(x, y, radius, startAngle, endAngle);
  }

  arcTo(x1: number, y1: number, x2: number, y2: number, radius: number) {
    this.ctx.arcTo(x1, y1, x2, y2, radius);
  }

  ellipse(
    x: number,
    y: number,
    radiusX: number,
    radiusY: number,
    rotation: number,
    startAngle: number,
    endAngle: number
  ) {
    this.ctx.ellipse(x, y, radiusX, radiusY, rotation, startAngle, endAngle);
  }

  stroke() {
    this.ctx.stroke();
  }
  fill() {
    this.ctx.fill();
  }

  closePath(): void {
    this.ctx.closePath();
  }
  quadraticCurveTo(cpx: number, cpy: number, x: number, y: number): void {
    this.ctx.quadraticCurveTo(cpx, cpy, x, y);
  }
}
