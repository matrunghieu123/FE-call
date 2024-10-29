const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/chatroom', // Đường dẫn bạn muốn proxy
    createProxyMiddleware({
      target: 'http://192.168.1.13:81',
      changeOrigin: true,
    })
  );
};