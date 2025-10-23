const questionModel = require('../models/questionModel');
const eventModel = require('../models/eventModel');

// 1. Create question for event (POST /questions, requires authentication)
exports.createQuestion = async (req, res) => {
  try {
    const question  = req.body.question;
    const userId = req.user.user_id;
    const event_id = req.params.eventId;

    const allowedFields = ['question'];
    const receivedFields = Object.keys(req.body);
    const extraFields = receivedFields.filter(field => !allowedFields.includes(field));
    if (extraFields.length > 0) {
      return res.status(400).json({
        error: 'Bad Request',
        error_message: 'Extra fields are not allowed: ' + extraFields.join(', ')
      });
    }
    // 1. Validate required fields
    if (!event_id || !question) {
      return res.status(400).json({
        error: 'Bad Request',
        error_message: 'event_id and question are required fields'
      });
    }

    // 2. Validate if event exists (simplified: directly call event model query)
    const event = await eventModel.getEventById(event_id);
    if (!event) {
      return res.status(404).json({
        error: 'Not Found',
        error_message: `Event with ID ${event_id} does not exist, cannot ask question`
      });
    }
    // 3. Validate if user is the event creator
    const isEventCreator = await eventModel.isEventCreator(event_id, userId);
    if (isEventCreator) {
      return res.status(403).json({
        error: 'Forbidden',
        error_message: 'You do not have permission to ask questions'
      });
    }
    // 4. Validate if user has registered for the event
    const isUserRegistered = await eventModel.isUserRegistered(event_id, userId);
    if (!isUserRegistered) {
      return res.status(403).json({
        error: 'Forbidden',
        error_message: 'You have not registered for this event, cannot ask question'
      });
    }
    const questionData = {
      event_id: event_id,
      question: question,
      asked_by: userId
    };
    // 3. Create question
    const questionId = await questionModel.createQuestion(questionData);

    // 4. Success response
    res.status(201).json({
      message: 'Question submitted successfully',
      question_id: questionId,
      question: question
    });

  } catch (err) {
    console.error('[Create Question Exception] Error message:', err.message, '| Error stack:', err.stack);
    res.status(500).json({
      error: 'Internal Server Error',
      error_message: 'Question submission failed: ' + err.message
    });
  }
};

// 2. Query questions by event ID (GET /events/:eventId/questions, requires authentication)
exports.getQuestionsByEventId = async (req, res) => {
  try {
    const eventId = req.params.eventId;

    // 1. Validate if event exists
    const event = await eventModel.getEventById(eventId);
    if (!event) {
      return res.status(404).json({
        error: 'Not Found',
        error_message: `Event with ID ${eventId} does not exist`
      });
    }

    // 2. Query questions
    const questions = await questionModel.getQuestionsByEventId(eventId);

    // 3. Success response
    res.status(200).json({
      message: `Questions for event ${eventId} queried successfully`,
      count: questions.length,
      questions: questions
    });

  } catch (err) {
    res.status(500).json({
      error: 'Internal Server Error',
      error_message: 'Question query failed: ' + err.message
    });
  }
};

// 3. Vote for question (POST /question/:questionId/vote, requires authentication)
exports.voteQuestion = async (req, res) => {
  try {
    const questionId = req.params.questionId;
    const userId = req.user.user_id;

    // 1. Validate if question exists
    const questionExists = await questionModel.isQuestionExists(questionId);
    if (!questionExists) {
      return res.status(404).json({
        error: 'Not Found',
        error_message: `Question with ID ${questionId} does not exist`
      });
    }
    // 2. Validate if user has already voted
   
    const isVoted = await questionModel.isVoted(questionId, userId);
    const now1 = new Date();
    const timestamp1 = now1.getTime();
    if (isVoted) {
      return res.status(403).json({
        timestamp1: timestamp1,
        isVoted: isVoted,
        userId: userId,
        questionId: questionId,
        error: 'Forbidden',
        error_message: 'You have already voted, cannot vote again'
      });
    }
    // 2. Vote
    questionModel.voteQuestion(questionId, userId);

    // 3. Success response
    const now = new Date();
    const timestamp = now.getTime();
    res.status(200).json({
      isVoted:isVoted,
      message: 'Vote successful',
      question_id: questionId,
      timestamp: timestamp
    });

  } catch (err) {
    const now = new Date();
    const timestamp = now.getTime();
    res.status(500).json({
      timestamp: timestamp,
      error: 'Internal Server Error',
      error_message: 'Vote failed: ' + err.message
    });
  }
};

exports.downvoteQuestion = async (req, res) => {
  try {
    const questionId = req.params.questionId;
    const userId = req.user.user_id;
    // 1. Validate if question exists
    const questionExists = await questionModel.isQuestionExists(questionId);
    if (!questionExists) {
      return res.status(404).json({
        error: 'Not Found',
        error_message: `Question with ID ${questionId} does not exist`
      });
    }
    // 2. Validate if user has already voted
    const isVoted = await questionModel.isVoted(questionId, userId);
    
    const now1 = new Date();
    const timestamp1 = now1.getTime();
    if (isVoted) {
      return res.status(403).json({
        isVoted: isVoted,
        userId: userId,
        questionId: questionId,
        timestamp1: timestamp1,
        error: 'Forbidden',
        error_message: 'You have already voted'
      });
    }
    // 2. Downvote
    questionModel.downvoteQuestion(questionId, userId);
    // 3. Success response
    const now= new Date();
    const timestamp = now.getTime();
    res.status(200).json({
      isVoted: isVoted,
      timestamp: timestamp,
      message: 'Downvote successful',
      question_id: questionId
    });
  } catch (err) {
    const now1 = new Date();
    const timestamp1 = now1.getTime();
    res.status(500).json({
      timestamp1: timestamp1,
      error: 'Internal Server Error',
      error_message: 'Vote failed: ' + err.message
    });
  }
};

exports.deleteQuestion = async (req, res) => {
  try {
    const questionId = req.params.questionId;
    const userId = req.user.user_id;
    // 1. Validate if question exists
    const question = await questionModel.getQuestionById(questionId);
      if (!question) {
      return res.status(404).json({
        error: 'Not Found',
        error_message: `Question with ID ${questionId} does not exist`
      });
    }
    // 2. Validate if user is the question creator
    const isQuestionCreator = (question.asked_by === userId);
    const isEventCreator = await eventModel.isEventCreator(question.event_id, userId);
    if (!(isQuestionCreator || isEventCreator)) {
      return res.status(403).json({
        error: 'Forbidden',
        data:{isEventCreator,isQuestionCreator,userId,question},
        error_message: 'You do not have permission to delete this question'
      });
    }
    // 3. Delete question
    await questionModel.deleteQuestion(questionId);
    // 4. Success response
    res.status(200).json({
      message: 'Question deleted successfully',
      question_id: questionId
    });
  } catch (err) {
    console.error('[Delete Question Exception] Error message:', err.message, '| Error stack:', err.stack);
    res.status(500).json({
      error: 'Internal Server Error',
      error_message: 'Question deletion failed: ' + err.message
    });
  }
};