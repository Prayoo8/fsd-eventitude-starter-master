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
const singleEventRouter = require('./app/routes/eventRoutes.js');
const questionRoutes = require('./app/routes/questionRoutes.js');

app.use('/users', userRoutes);
app.use('/', authRoutes);
app.use('/event', singleEventRouter); // 【修复】挂载到 /event 而不是根路径
app.use('/events',singleEventRouter);
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