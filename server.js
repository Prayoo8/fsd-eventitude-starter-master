const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());

const HTTP_PORT = 3333;

app.listen(HTTP_PORT, () => {
    console.log('Server running on port: ' + HTTP_PORT);
});

app.use(morgan('tiny'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/', (req, res, next) => {
    res.json({'status': 'Alive'});
});

// 只保留一种挂载方式
const userRoutes = require('./app/routes/user.server.routes');
app.use('/users', userRoutes); // 使用这种挂载方式

// 暂时注释掉其他路由，先专注于用户路由
// require('./app/routes/event.server.routes')(app);
// require('./app/routes/question.server.routes')(app);

// 添加调试中间件来查看请求路径
app.use((req, res, next) => {
    console.log(`Received ${req.method} request for: ${req.url}`);
    next();
});

app.use((req, res) => {
    console.log(`404 - ${req.method} ${req.url}`);
    res.sendStatus(404);
});