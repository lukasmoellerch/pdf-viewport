use wasm_bindgen::prelude::*;
use wasm_bindgen::JsCast;
use js_sys::Promise;
use std::rc::Rc;
use std::cell::RefCell;
use std::collections::HashMap;

#[wasm_bindgen]
extern "C" {
    pub type PDFDocumentProxy;
    
    #[wasm_bindgen(method)]
    pub fn getPage(this: &PDFDocumentProxy, page_number: u32) -> Promise;
    
    pub type PDFPageProxy;
    
    #[wasm_bindgen(method)]
    pub fn getOperatorList(this: &PDFPageProxy) -> Promise;
    
    #[wasm_bindgen(method, getter)]
    pub fn commonObjs(this: &PDFPageProxy) -> JsValue;
    
    #[wasm_bindgen(method, getter)]
    pub fn objs(this: &PDFPageProxy) -> JsValue;
    
    pub type SVGGraphics;
    
    #[wasm_bindgen(constructor)]
    pub fn new(common_objs: &JsValue, objs: &JsValue) -> SVGGraphics;
}

thread_local! {
    static PAGE_CACHE: RefCell<HashMap<(u32, u32), Promise>> = RefCell::new(HashMap::new());
    static OPERATOR_LIST_CACHE: RefCell<HashMap<(u32, u32), Promise>> = RefCell::new(HashMap::new());
    static GFX_CACHE: RefCell<HashMap<(u32, u32), Promise>> = RefCell::new(HashMap::new());
}

pub fn get_page(pdf: &PDFDocumentProxy, page_number: u32) -> Promise {
    let pdf_id = pdf.as_ref() as *const _ as u32;
    let key = (pdf_id, page_number);
    
    PAGE_CACHE.with(|cache| {
        let mut cache = cache.borrow_mut();
        if let Some(promise) = cache.get(&key) {
            promise.clone()
        } else {
            let promise = pdf.getPage(page_number);
            cache.insert(key, promise.clone());
            promise
        }
    })
}

pub async fn get_operator_list(pdf: &PDFDocumentProxy, page_number: u32) -> Result<JsValue, JsValue> {
    let pdf_id = pdf.as_ref() as *const _ as u32;
    let key = (pdf_id, page_number);
    
    OPERATOR_LIST_CACHE.with(|cache| {
        let mut cache = cache.borrow_mut();
        if let Some(promise) = cache.get(&key) {
            promise.clone()
        } else {
            let page_promise = get_page(pdf, page_number);
            let promise = Promise::new(&mut |resolve, reject| {
                wasm_bindgen_futures::spawn_local(async move {
                    match wasm_bindgen_futures::JsFuture::from(page_promise).await {
                        Ok(page) => {
                            let page: PDFPageProxy = page.dyn_into().unwrap();
                            let list_promise = page.getOperatorList();
                            match wasm_bindgen_futures::JsFuture::from(list_promise).await {
                                Ok(list) => resolve.call1(&JsValue::undefined(), &list).unwrap(),
                                Err(e) => reject.call1(&JsValue::undefined(), &e).unwrap(),
                            };
                        }
                        Err(e) => reject.call1(&JsValue::undefined(), &e).unwrap(),
                    }
                });
            });
            cache.insert(key, promise.clone());
            promise
        }
    });
    
    Ok(JsValue::undefined())
}

pub async fn get_gfx(pdf: &PDFDocumentProxy, page_number: u32) -> Result<SVGGraphics, JsValue> {
    let page_promise = get_page(pdf, page_number);
    let page_future = wasm_bindgen_futures::JsFuture::from(page_promise).await?;
    let page: PDFPageProxy = page_future.dyn_into()?;
    
    Ok(SVGGraphics::new(&page.commonObjs(), &page.objs()))
}