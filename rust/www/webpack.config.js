const CopyWebpackPlugin = require("copy-webpack-plugin");
const WasmPackPlugin = require("@wasm-tool/wasm-pack-plugin");
const path = require('path');

const mode = 'development'

module.exports = [
  {
    entry: "./bootstrap.js",
    output: {
      path: path.resolve(__dirname, "dist"),
      filename: "bootstrap.js",
    },
    mode: mode,
    plugins: [
      new CopyWebpackPlugin(['index.html', 'logo.png', 'style.css']),
      new WasmPackPlugin({
        crateDirectory: path.resolve(__dirname, '..'),
        outName: 'mysterious_murder',
        outDir: 'pkg',
        forceMode: 'production',
      }),
    ],
    module: {
      rules: [
        {
          test: /\.(js|jsx)$/,
          exclude: /node_modules/,
          use: ['babel-loader']
        },
        {
          test: /\.css$/i,
          use: ['style-loader', 'css-loader'],
        },
      ],
    },
    resolve: {
      extensions: ['*', '.js', '.jsx'],
      modules: [path.resolve(__dirname), 'node_modules'],
    },
  },
  {
    entry: "./worker.js",
    target: "webworker",
    output: {
      path: path.resolve(__dirname, "dist"),
      filename: "worker.js"
    },
    resolve: {
      alias:  {
        "mysterious-murder": path.resolve(__dirname, '../pkg')
      },
    },
    module: {
      rules: [
        {
          test: /\.(js|jsx)$/,
          exclude: /node_modules/,
          use: ['babel-loader']
        },
      ]
    },
    mode: mode,
  }
];
