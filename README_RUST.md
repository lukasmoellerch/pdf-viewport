# Rust PDF Viewer Library

This is a Rust/WebAssembly port of the TypeScript PDF viewer library. It provides the same functionality as the original library but with the performance benefits of Rust and WebAssembly.

## Project Structure

```
├── Cargo.toml          # Rust project configuration
├── rust_src/           # Rust source code
│   ├── lib.rs          # Main library entry point
│   ├── components/     # PDF viewer components
│   ├── hooks/          # React-like hooks (adapted for Rust)
│   └── lib/            # Utility modules
├── build.sh            # Build script
└── pkg/                # Generated WebAssembly output (after build)
```

## Features Converted

### ✅ Completed
- Basic project structure and dependencies
- Utility functions (color utilities, memoization)
- Canvas factory and object management
- Type definitions and interfaces

### 🚧 In Progress
- Render modules (canvas, SVG, text)
- Dark mode utilities
- Component implementations
- WebAssembly bindings

### 📋 TODO
- Complete component implementations
- Add comprehensive tests
- Create usage examples
- Performance benchmarks

## Building

To build the library:

```bash
./build.sh
```

This will:
1. Install wasm-pack if not already installed
2. Build the Rust code to WebAssembly
3. Generate JavaScript bindings in the `pkg/` directory

## Usage

After building, you can use the generated WebAssembly module in your JavaScript/TypeScript project:

```javascript
import init, { PdfViewport, CanvasFactory } from './pkg/pdf_viewer.js';

async function main() {
    await init();
    
    const factory = new CanvasFactory();
    // Use the factory to create canvases for PDF rendering
}

main();
```

## Dependencies

- `wasm-bindgen` - Rust/WebAssembly interop
- `web-sys` - Web API bindings
- `js-sys` - JavaScript API bindings
- `serde` - Serialization/deserialization
- Various utility crates

## Development Status

This is a work in progress. The following modules have been converted:

1. **Utilities** ✅
   - `color_utils.rs` - RGB/HSL color conversion
   - `utils.rs` - Generic map utilities and middleware types
   - `memo.rs` - Memoization utilities
   - `promise_memo.rs` - Async memoization for PDF.js

2. **Canvas Management** ✅
   - `canvas_object.rs` - Canvas object structure
   - `canvas_factory.rs` - Canvas pooling and management

3. **Components** 🚧
   - Basic structure defined, implementation pending

4. **Rendering** 🚧
   - Placeholder files created, implementation pending

## Contributing

Feel free to contribute by implementing the remaining modules or improving existing ones. The TypeScript source files in `src/` serve as the reference implementation.

## License

MIT (same as the original TypeScript library)