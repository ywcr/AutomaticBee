const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

// 生产环境的后端服务器地址
const TARGET_SERVER = 'https://zxyy.ltd';

// 启用 CORS
app.use(cors({
  origin: '*',
  credentials: true
}));

// 静态文件服务 - 服务前端资源
app.use(express.static(path.join(__dirname, '../renderer')));

// API 代理中间件配置
const apiProxy = createProxyMiddleware({
  target: TARGET_SERVER,
  changeOrigin: true,
  secure: true,
  followRedirects: true,
  logLevel: 'info',
  // Cookie 域名改写，确保后端 Cookie 能在 localhost 域生效
  cookieDomainRewrite: {
    'zxyy.ltd': 'localhost',
    '.zxyy.ltd': 'localhost'
  },
  cookiePathRewrite: '/',
  onProxyReq: (proxyReq, req, res) => {
    // 添加必要的请求头
    proxyReq.setHeader('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
    proxyReq.setHeader('Accept', 'application/json, text/plain, */*');
    proxyReq.setHeader('Accept-Language', 'zh-CN,zh;q=0.9,en;q=0.8');
    
    // 如果是 POST 请求，确保 Content-Type 正确
    if (req.method === 'POST' && !proxyReq.getHeader('Content-Type')) {
      proxyReq.setHeader('Content-Type', 'application/x-www-form-urlencoded');
    }
    
    console.log(`[代理请求] ${req.method} ${req.url} -> ${TARGET_SERVER}${req.url}`);
  },
  onProxyRes: (proxyRes, req, res) => {
    // 处理响应头，允许跨域
    proxyRes.headers['Access-Control-Allow-Origin'] = '*';
    proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
    proxyRes.headers['Access-Control-Allow-Headers'] = 'Origin, X-Requested-With, Content-Type, Accept, Authorization';
    
    // 详细的Cookie日志
    if (proxyRes.headers['set-cookie']) {
      console.log(`[代理Cookie] ${req.method} ${req.url} - Set-Cookie:`, proxyRes.headers['set-cookie']);
    }
    
    console.log(`[代理响应] ${req.method} ${req.url} - ${proxyRes.statusCode}`);
    
    // 如果是登录请求，输出更多详情
    if (req.url.includes('/user/login') && req.method === 'POST') {
      console.log('[登录响应头]', JSON.stringify({
        statusCode: proxyRes.statusCode,
        headers: proxyRes.headers
      }, null, 2));
    }
  },
  onError: (err, req, res) => {
    console.error(`[代理错误] ${req.method} ${req.url}:`, err.message);
    res.status(500).json({
      error: '代理服务器错误',
      message: err.message
    });
  }
});

// 仅代理精灵蜂相关的 /lgb API 请求
app.use('/lgb', apiProxy);

// 添加健康检查端点，用于主进程等待代理就绪
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 添加一个健康检查端点，不需要代理
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: '工具站运行正常' });
});


// 外部资源不再通过本地代理统一转发，仅保留 /lgb 代理
const externalProxies = [];

externalProxies.forEach(({ path: proxyPath, target }) => {
  app.use(proxyPath, createProxyMiddleware({
    target,
    changeOrigin: true,
    secure: true,
    pathRewrite: {
      [`^${proxyPath}`]: ''
    }
  }));
});

// 静态文件服务
app.use(express.static(path.join(__dirname, '../renderer')));

// 根路径重定向到工具站首页
app.get('/', (req, res) => {
  res.redirect('/tools-home.html');
});

// 页面路由
app.get('/automation-dashboard.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../renderer/automation-dashboard.html'));
});

app.get('/automation-tasks.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../renderer/automation-tasks.html'));
});

app.get('/login.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../renderer/login.html'));
});


app.get('/tools-home.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../renderer/tools-home.html'));
});
app.get('/main-responsive', (req, res) => {
  res.sendFile(path.join(__dirname, '../renderer/main-responsive.html'));
});

app.get('/create-task', (req, res) => {
  res.sendFile(path.join(__dirname, '../renderer/create-task.html'));
});


app.get('/task-detail', (req, res) => {
  res.sendFile(path.join(__dirname, '../renderer/task-detail.html'));
});

app.get('/chat', (req, res) => {
  res.sendFile(path.join(__dirname, '../renderer/chat.html'));
});

// 测试页面路由
app.get('/test', (req, res) => {
  res.sendFile(path.join(__dirname, '../../test-main.html'));
});

app.get('/test-simple.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../renderer/test-simple.html'));
});

// 处理 SPA 路由 - 所有未匹配的路径返回 tools-home.html
app.get('*', (req, res) => {
  // 如果是API请求或资源文件，返回404
  if (req.path.startsWith('/api/') || req.path.startsWith('/lgb/') || req.path.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$/)) {
    res.status(404).send('Not Found');
  } else {
    // 其他未匹配的路径返回工具站首页
    res.sendFile(path.join(__dirname, '../renderer/tools-home.html'));
  }
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error('服务器错误:', err);
  res.status(500).json({
    error: '内部服务器错误',
    message: err.message
  });
});

// 启动服务器
const server = app.listen(PORT, 'localhost', () => {
  console.log(`🚀 代理服务器已启动: http://localhost:${PORT}`);
  console.log(`📡 后端代理目标: ${TARGET_SERVER}`);
  console.log(`🧪 测试页面: http://localhost:${PORT}/test`);
});

// 优雅关闭
process.on('SIGTERM', () => {
  console.log('收到 SIGTERM 信号，正在关闭代理服务器...');
  server.close(() => {
    console.log('代理服务器已关闭');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('收到 SIGINT 信号，正在关闭代理服务器...');
  server.close(() => {
    console.log('代理服务器已关闭');
    process.exit(0);
  });
});

module.exports = app;
