use wasm_bindgen::prelude::*;
use web_sys::{HtmlCanvasElement, CanvasRenderingContext2d};

#[derive(Clone)]
pub struct CanvasObject {
    pub canvas: HtmlCanvasElement,
    pub context: CanvasRenderingContext2d,
}