const path = require('path');
const webpack = require('webpack');

module.exports = {
  entry: './src/index.js', // File đầu vào của bạn
  output: {
    path: path.resolve(__dirname, 'dist'), // Thư mục đầu ra
    filename: 'bundle.js', // Tên file đầu ra
  },
  devServer: {
    static: {
      directory: path.join(__dirname, 'public'), // Thư mục chứa file tĩnh
    },
    compress: true,
    port: 8000,
    allowedHosts: ['localhost', process.env.REACT_APP_BASE_URL], // Host được phép
    headers: {
      'Access-Control-Allow-Origin': '*', // Cho phép tất cả nguồn gốc
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization',
    },
    proxy: {
      '/chatroom': {
        target: process.env.REACT_APP_BASE_URL, // Proxy đến API
        changeOrigin: true,
      },
    },
  },
  module: {
    rules: [
      {
        test: /\.js$/, // Định nghĩa loader cho file JS
        exclude: /node_modules/, // Bỏ qua thư mục node_modules
        use: {
          loader: 'babel-loader', // Sử dụng babel-loader để biên dịch JS
        },
      },
      {
        test: /\.css$/, // Định nghĩa loader cho file CSS
        use: ['style-loader', 'css-loader'], // Sử dụng style-loader và css-loader
      },
    ],
  },
  resolve: {
    fallback: {
      stream: require.resolve('stream-browserify'), // Polyfill cho stream
      process: require.resolve('process/browser'), // Polyfill cho process
    },
  },
  plugins: [
    new webpack.ProvidePlugin({
      process: 'process/browser', // Cung cấp process cho trình duyệt
    }),
  ],
};
