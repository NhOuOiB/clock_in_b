require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');

const app = express();
app.use(cookieParser());
const cors = require('cors');
const moment = require('moment');
const port = process.env.SERVER_PORT || 3001;

const http = require('http');
const server = http.createServer(app);

const hr = require('./routers/hr')
const login = require('./routers/login');
const Authentication = require('./middlewares/Authentication');

const corsOptions = {
  // 如果要讓 cookie 可以跨網域存取，這邊要設定 credentials
  // 且 origin 也要設定
  credentials: true,
  origin: ['http://localhost:5174', 'http://192.168.1.108:8001'],
};
app.use(cors(corsOptions));
app.use(express.json());
app.use((req, res, next) => {
  console.log(`Now：${moment().format('YYYY-MM-DD HH:mm:ss')}`);
  next();
});

app.use('/api/', login);
app.use('/api/', hr);
app.use('/api/auth', Authentication);

server.listen(port, () => console.log('server is runing : ' + port));
