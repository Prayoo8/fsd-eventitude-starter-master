const express = require('express');
const morgan  = require('morgan');
const bodyParser = require('body-parser');
const cors = require('cors');


const app = express();
app.use(cors());


// Logging
app.use(morgan('tiny'));

// Body parser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


const userRoutes = require('./app/routes/userRoutes.js');
const authRoutes = require('./app/routes/authRoutes.js');
const eventRoutes = require('./app/routes/eventRoutes.js');
const questionRoutes = require('./app/routes/questionRoutes.js');

app.use('/users', userRoutes);
app.use('/auth', authRoutes);
app.use('/events', eventRoutes);
app.use('/questions', questionRoutes);

// Server port
const HTTP_PORT = 3333;

// Start server
app.listen(HTTP_PORT, () => {
    console.log('Server running on port: ' + HTTP_PORT);
});

// Root endpoint
app.get('/', (req, res, next) => {
    res.json({'status': 'Alive'});
});


// Other API endpoints: Links go here...（作业文档要求的路由注册位置，）
// 注册所有路由（与 app/routes 目录下的文件对应）
/* require('./app/routes/userRoutes')(app);       // 映射 /users
require('./app/routes/authRoutes')(app);       // 映射 /auth
require('./app/routes/eventRoutes')(app);      // 映射 /events
require('./app/routes/questionRoutes')(app);   // 映射 /questions、/events/:eventId/questions 等
 */

// Default response for any other request
/* app.use((req, res) => {
    res.sendStatus(404);
}); */