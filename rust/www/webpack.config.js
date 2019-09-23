const CopyWebpackPlugin = require("copy-webpack-plugin");
const path = require('path');

module.exports = [
  {
    entry: "./bootstrap.js",
    output: {
      path: path.resolve(__dirname, "dist"),
      filename: "bootstrap.js",
    },
    mode: "development",
    plugins: [
      new CopyWebpackPlugin(['index.html'])
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
      }
    },
    mode: "development",
  }
];
