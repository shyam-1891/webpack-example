const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const glob = require("glob");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const mode = process.env.MODE === "production" ? "production" : "development";
const _ESLintPlugin = require('eslint-webpack-plugin');
const _StyleLintPlugin = require('stylelint-webpack-plugin');

// const ESLintPlugin = new _ESLintPlugin({
//   overrideConfigFile: path.resolve(__dirname, '.eslintrc'),
//   context: path.resolve(__dirname, './src/js'),
//   files: '**/*.js',
// });

module.exports = {
  mode,
  watch: mode !== "production",
  entry: glob.sync("./src/js/*.js").reduce((acc, item) => {
    const itempath = item.split("/");
    const getname = itempath.slice(-1)[0].split(".")
    const name = getname[0];
    acc[name] = './' + item;
    return acc;
  }, {}),

  output: {
    filename: (pathData) => {
      return pathData.chunk.name === 'main' ? '[name].js' : '[name].js';
    },
    path: __dirname + '/dist',
    clean: true
  },
  module: {
    rules: [
      {
        test: /\.s[ac]ss$/i, // Process SCSS files
        use: [
          MiniCssExtractPlugin.loader, // Extract CSS to a separate file
          {
            loader: "css-loader",
            options: {
              url: false,
            },
          },
          {
            loader: "postcss-loader",
            options: {
              postcssOptions: {
                plugins: [["postcss-preset-env"]],
              },
            },
          },
          {
            loader: "sass-loader",
            options: {
              implementation: require("sass"),
            },
          },
        ]
      },

      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env"],
          },
        },
      },
    ]
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: '[name].css', // Name of the generated CSS file
    }),
    new _ESLintPlugin({
      overrideConfigFile: path.resolve(__dirname, '.eslintrc'),
    }),
    new _StyleLintPlugin({
      configFile: path.resolve(__dirname, 'stylelint.config.js'),
    })
  ],
  optimization: {
    minimizer: ["...", new CssMinimizerPlugin()],
  },
};
