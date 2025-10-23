const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const questionController = require('../controllers/questionController');
const { authenticateToken, optionalAuthentication } = require('../middleware/auth'); // Requires authentication

// All event interfaces require login (Swagger requirement)
// try{
//     router.use(authenticateToken);} catch(error){
//         console.error('Error in questionRoutes:', error);
//         res.status(500).json({
//             error: 'Internal Server Error',
//             error_message: 'Question interface authentication failed: ' + error.message
//         });
//     }

// 1. Create event (POST /events)
router.post('/', authenticateToken, eventController.createEvent);
// 2. Query all events (GET /events)
router.get('/',authenticateToken, eventController.getAllEvents);
// 3. Query event by ID (GET /events/:eventId)
router.get('/:eventId',optionalAuthentication, eventController.getEventById);

// 4. Update event (PATCH /events/:eventId)
router.patch('/:eventId', authenticateToken,eventController.updateEvent);

// 5. Delete event (DELETE /events/:eventId)
router.delete('/:eventId', authenticateToken,eventController.deleteEvent);

// 6. User registration for event (POST /events/:eventId)
router.post('/:eventId', authenticateToken,eventController.registerForEvent);

// 1. Create question (POST /questions)
router.post('/:eventId/question', authenticateToken,questionController.createQuestion);
// 2. Query questions by event ID (GET /events/:eventId/questions)
router.get('/:eventId/questions', authenticateToken,questionController.getQuestionsByEventId);

module.exports = router;