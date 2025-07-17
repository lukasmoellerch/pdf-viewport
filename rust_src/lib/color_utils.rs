use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Copy, Serialize, Deserialize)]
pub struct RgbColor {
    /// Red h ∈ [0, 255]
    pub r: u8,
    /// Green h ∈ [0, 255]
    pub g: u8,
    /// Blue h ∈ [0, 255]
    pub b: u8,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize)]
pub struct HslColor {
    /// The hue of the color h ∈ [0, 1]
    pub h: f64,
    /// The saturation of the color s ∈ [0, 1]
    pub s: f64,
    /// The lightness of the color l ∈ [0, 1]
    pub l: f64,
}

pub fn rgb_to_hsl(rgb: &RgbColor) -> HslColor {
    let ur = rgb.r as f64 / 255.0;
    let ug = rgb.g as f64 / 255.0;
    let ub = rgb.b as f64 / 255.0;
    
    let x_max = ur.max(ug).max(ub);
    let x_min = ur.min(ug).min(ub);
    let c = x_max - x_min;
    let l = (x_max + x_min) / 2.0;
    
    let h = if c == 0.0 {
        0.0
    } else if x_max == ur {
        (1.0 / 6.0) * (0.0 + (ug - ub) / c)
    } else if x_max == ug {
        (1.0 / 6.0) * (2.0 + (ub - ur) / c)
    } else if x_max == ub {
        (1.0 / 6.0) * (4.0 + (ur - ug) / c)
    } else {
        0.0
    };
    
    let s = if l == 0.0 || l == 1.0 {
        0.0
    } else {
        (x_max - l) / l.min(1.0 - l)
    };
    
    HslColor {
        h: (h + 1.0) % 1.0,
        s,
        l,
    }
}