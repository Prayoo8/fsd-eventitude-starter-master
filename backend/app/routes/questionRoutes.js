const express = require('express');
const router = express.Router();
const questionController = require('../controllers/questionController');
const { authenticateToken } = require('../middleware/auth'); // Requires authentication

// All question interfaces require login
try{
router.use(authenticateToken);} catch(error){
    console.error('Error in questionRoutes:', error);
    res.status(500).json({
        error: 'Internal Server Error',
        error_message: 'Question interface authentication failed: ' + error.message
    });
}


// 3. Vote for question (POST /questions/:questionId/vote)
router.post('/:questionId/vote', questionController.voteQuestion);

router.delete('/:questionId', questionController.deleteQuestion);

router.delete('/:questionId/vote', questionController.downvoteQuestion);

module.exports = router;