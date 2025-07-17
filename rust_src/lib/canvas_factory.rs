use wasm_bindgen::prelude::*;
use web_sys::{Document, HtmlCanvasElement, CanvasRenderingContext2d};
use std::collections::{HashMap, HashSet};
use std::cell::RefCell;
use std::rc::Rc;
use crate::lib::canvas_object::CanvasObject;

#[wasm_bindgen]
pub struct CanvasFactory {
    canvas_array: RefCell<Vec<Rc<RefCell<CanvasObject>>>>,
    object_index_map: RefCell<HashMap<*const CanvasObject, usize>>,
    free: RefCell<HashSet<usize>>,
}

#[wasm_bindgen]
impl CanvasFactory {
    #[wasm_bindgen(constructor)]
    pub fn new() -> Self {
        Self {
            canvas_array: RefCell::new(Vec::new()),
            object_index_map: RefCell::new(HashMap::new()),
            free: RefCell::new(HashSet::new()),
        }
    }
    
    fn get_free_index(&self) -> Option<usize> {
        self.free.borrow().iter().next().copied()
    }
    
    #[wasm_bindgen]
    pub fn create(&self, width: Option<u32>, height: Option<u32>) -> Rc<RefCell<CanvasObject>> {
        if let Some(index) = self.get_free_index() {
            let obj = self.canvas_array.borrow()[index].clone();
            self.free.borrow_mut().remove(&index);
            
            let mut obj_ref = obj.borrow_mut();
            let canvas_width = obj_ref.canvas.width();
            let canvas_height = obj_ref.canvas.height();
            
            if (width.is_none() || width.unwrap() == canvas_width) &&
               (height.is_none() || height.unwrap() == canvas_height) {
                obj_ref.context.clear_rect(0.0, 0.0, canvas_width as f64, canvas_height as f64);
            }
            
            if let Some(w) = width {
                obj_ref.canvas.set_width(w);
            }
            if let Some(h) = height {
                obj_ref.canvas.set_height(h);
            }
            
            drop(obj_ref);
            obj
        } else {
            let window = web_sys::window().unwrap();
            let document = window.document().unwrap();
            let canvas = document.create_element("canvas").unwrap()
                .dyn_into::<HtmlCanvasElement>().unwrap();
                
            if let Some(w) = width {
                canvas.set_width(w);
            }
            if let Some(h) = height {
                canvas.set_height(h);
            }
            
            let context = canvas
                .get_context("2d")
                .unwrap()
                .unwrap()
                .dyn_into::<CanvasRenderingContext2d>()
                .unwrap();
                
            context.set_font("10px sans-serif");
            
            let obj = CanvasObject { canvas, context };
            let obj_rc = Rc::new(RefCell::new(obj));
            
            let mut canvas_array = self.canvas_array.borrow_mut();
            canvas_array.push(obj_rc.clone());
            let index = canvas_array.len() - 1;
            
            let obj_ptr = &*obj_rc.borrow() as *const CanvasObject;
            self.object_index_map.borrow_mut().insert(obj_ptr, index);
            
            obj_rc
        }
    }
    
    #[wasm_bindgen]
    pub fn reset(&self, obj: &JsValue, width: u32, height: u32) -> Result<(), JsValue> {
        let obj_ref: Rc<RefCell<CanvasObject>> = obj.clone().dyn_into()?;
        let mut obj = obj_ref.borrow_mut();
        
        if width == 0 || height == 0 {
            return Err(JsValue::from_str("Invalid canvas size"));
        }
        
        obj.canvas.set_width(width);
        obj.canvas.set_height(height);
        Ok(())
    }
    
    #[wasm_bindgen]
    pub fn destroy(&self, obj: &JsValue) -> Result<(), JsValue> {
        let obj_ref: Rc<RefCell<CanvasObject>> = obj.clone().dyn_into()?;
        let mut obj = obj_ref.borrow_mut();
        
        obj.canvas.set_height(0);
        obj.canvas.set_width(0);
        
        let obj_ptr = &*obj as *const CanvasObject;
        if let Some(&index) = self.object_index_map.borrow().get(&obj_ptr) {
            self.free.borrow_mut().insert(index);
        }
        
        Ok(())
    }
}

thread_local! {
    static GLOBAL_FACTORY: CanvasFactory = CanvasFactory::new();
}

#[wasm_bindgen]
pub fn get_global_factory() -> CanvasFactory {
    GLOBAL_FACTORY.with(|f| CanvasFactory::new())
}