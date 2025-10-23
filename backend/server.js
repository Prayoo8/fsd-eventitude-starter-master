const express = require('express');
const morgan  = require('morgan');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();

const eventController = require('./app/controllers/eventController.js');
const optionAuthentication = require('./app/middleware/auth.js').optionalAuthentication;
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
app.use('/event', singleEventRouter); // 【Fix】Mount to /event instead of root path 
app.use('/events',singleEventRouter);
app.use('/question', questionRoutes);
app.get('/search', optionAuthentication, eventController.searchEvents);

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