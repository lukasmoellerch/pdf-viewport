import { ProxyContext } from "./proxy-context";
import { darkModeTransform } from "./dark-mode";
import { CanvasMiddleware } from "./utils";

class DarkModeProxyContext extends ProxyContext {
  private realFillStyle: string | CanvasGradient | CanvasPattern = "#000000";
  set fillStyle(color: string | CanvasGradient | CanvasPattern) {
    this.realFillStyle = color;
    if (typeof color !== "string") {
      this.ctx.fillStyle = color;
      return;
    }
    this.ctx.fillStyle = color;
    this.ctx.fillStyle = darkModeTransform(this.ctx.fillStyle);
  }
  get fillStyle(): string | CanvasGradient | CanvasPattern {
    return this.realFillStyle;
  }

  private realStrokeStyle: string | CanvasGradient | CanvasPattern = "#000000";
  set strokeStyle(color: string | CanvasGradient | CanvasPattern) {
    this.realStrokeStyle = color;
    if (typeof color !== "string") {
      this.ctx.strokeStyle = color;
      return;
    }
    this.ctx.strokeStyle = color;
    this.ctx.strokeStyle = darkModeTransform(this.ctx.strokeStyle);
  }
  get strokeStyle(): string | CanvasGradient | CanvasPattern {
    return this.realStrokeStyle;
  }
}

export const darkModeCanvasMiddleware: CanvasMiddleware = (
  ctx: CanvasRenderingContext2D
) => {
  const proxy = new DarkModeProxyContext(ctx);
  proxy.fillStyle = "rgb(0,0,0)";
  proxy.strokeStyle = "rgb(0,0,0)";

  return proxy;
};
