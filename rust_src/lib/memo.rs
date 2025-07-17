use std::collections::HashMap;
use std::hash::Hash;
use std::rc::{Rc, Weak};
use std::cell::RefCell;

pub struct WeakCache<K, V> {
    cache: RefCell<HashMap<K, Weak<V>>>,
}

impl<K: Eq + Hash, V> WeakCache<K, V> {
    pub fn new() -> Self {
        Self {
            cache: RefCell::new(HashMap::new()),
        }
    }
    
    pub fn get_or_insert_with<F>(&self, key: K, f: F) -> Rc<V>
    where
        K: Clone,
        F: FnOnce() -> V,
    {
        let mut cache = self.cache.borrow_mut();
        
        if let Some(weak) = cache.get(&key) {
            if let Some(rc) = weak.upgrade() {
                return rc;
            }
        }
        
        let value = Rc::new(f());
        cache.insert(key, Rc::downgrade(&value));
        value
    }
}

pub struct MemoCache<K, V> {
    cache: RefCell<HashMap<K, V>>,
}

impl<K: Eq + Hash, V> MemoCache<K, V> {
    pub fn new() -> Self {
        Self {
            cache: RefCell::new(HashMap::new()),
        }
    }
    
    pub fn get_or_insert_with<F>(&self, key: K, f: F) -> V
    where
        K: Clone,
        V: Clone,
        F: FnOnce() -> V,
    {
        let mut cache = self.cache.borrow_mut();
        
        if let Some(value) = cache.get(&key) {
            return value.clone();
        }
        
        let value = f();
        cache.insert(key.clone(), value.clone());
        value
    }
}

#[macro_export]
macro_rules! memoize {
    ($name:ident, $input:ty, $output:ty, $body:expr) => {
        {
            use std::cell::RefCell;
            use std::collections::HashMap;
            
            thread_local! {
                static CACHE: RefCell<HashMap<$input, $output>> = RefCell::new(HashMap::new());
            }
            
            move |input: $input| -> $output {
                CACHE.with(|cache| {
                    let mut cache = cache.borrow_mut();
                    if let Some(output) = cache.get(&input) {
                        output.clone()
                    } else {
                        let output = $body(input.clone());
                        cache.insert(input, output.clone());
                        output
                    }
                })
            }
        }
    };
}