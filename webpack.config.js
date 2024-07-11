const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
  mode: 'development', // or 'development' for non-minified
  entry: './app.js', // entry point of your application
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
          },
        },
      },
    ],
  },
  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin()], // minify JavaScript
  },
};