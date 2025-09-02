const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/timeline',
    createProxyMiddleware({
      target: 'http://localhost:5004',
      changeOrigin: true,
      secure: false,
      logLevel: 'warn',
    })
  );
};
