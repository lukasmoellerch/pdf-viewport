#![allow(clippy::new_without_default)]

use wasm_bindgen::prelude::*;

pub mod components;
pub mod hooks;
pub mod lib;

pub use components::{
    canvas_layer::PdfCanvasLayer,
    layer::PdfCustomLayer,
    svg_layer::PdfSvgLayer,
    text_layer::PdfTextLayer,
    viewport::{PdfViewport, PortraitA4, LandscapeA4},
};

pub use lib::{
    render_text::get_stream,
    proxy_context::ProxyContext,
    promise_memo::get_page,
    canvas_dark_mode::dark_mode_canvas_middleware,
    svg_dark_mode::dark_mode_svg_middleware,
};

#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);
}

#[macro_export]
macro_rules! console_log {
    ($($t:tt)*) => (log(&format_args!($($t)*).to_string()))
}

#[wasm_bindgen(start)]
pub fn main() {
    console_error_panic_hook::set_once();
}