set -e

wasm-pack build --release
cd www
npm run start
