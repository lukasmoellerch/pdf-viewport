#!/bin/bash

# Build script for the Rust PDF viewer library

echo "Building Rust PDF viewer library..."

# Ensure wasm-pack is installed
if ! command -v wasm-pack &> /dev/null; then
    echo "wasm-pack not found. Installing..."
    curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf | sh
fi

# Build the library
wasm-pack build --target web --out-dir pkg

echo "Build complete! Output in pkg/"