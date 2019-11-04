// Use this server for testing (you may need to `npm i express` to get correct serving of wasm files)
const app = require('express')()

express.static.mime.define({'application/wasm': ['wasm']})
app.use(express.static('./'))
app.listen(8000, () => console.log('Listening on port 8000'))
