#!/bin/bash
export CARGO_TARGET_DIR="/tmp/reddit-kraken-target"
cd "$(dirname "$0")"
cargo tauri dev
