const path = require('path');
const WebpackShellPlugin = require('webpack-shell-plugin')

module.exports = {
  entry: { quick: './quick.ts' },
  // devtool: 'inline-source-map',
  mode: 'none',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js']
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
    libraryTarget: 'commonjs2'
  },
  plugins: [new WebpackShellPlugin({
    onBuildExit: 'copy /Y .\\dist\\quick.js .\\test\\modules'
  })]
};
