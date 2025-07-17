use std::collections::HashMap;
use std::hash::Hash;
use web_sys::CanvasRenderingContext2d;
use wasm_bindgen::prelude::*;

pub trait GenericMap<K, V> {
    fn get(&self, k: &K) -> Option<&V>;
    fn set(&mut self, k: K, v: V);
}

impl<K: Eq + Hash, V> GenericMap<K, V> for HashMap<K, V> {
    fn get(&self, k: &K) -> Option<&V> {
        self.get(k)
    }
    
    fn set(&mut self, k: K, v: V) {
        self.insert(k, v);
    }
}

pub fn get_or_default<K, V, M>(map: &mut M, key: K, default_value: V) -> &V
where
    K: Clone,
    M: GenericMap<K, V>,
{
    if map.get(&key).is_some() {
        map.get(&key).unwrap()
    } else {
        map.set(key.clone(), default_value);
        map.get(&key).unwrap()
    }
}

pub type CanvasMiddleware = Box<dyn Fn(CanvasRenderingContext2d) -> CanvasRenderingContext2d>;

pub type SvgMiddleware = Box<dyn Fn(&web_sys::SvgElement)>;