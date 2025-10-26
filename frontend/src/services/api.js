import axios from 'axios'

// Create axios instance
const api = axios.create({
  baseURL: 'http://localhost:3333',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor - add authentication token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('session_token')
    if (token) {
      config.headers['X-Authorization'] = token
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor - handle errors
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid, clear local storage and redirect to login page
      localStorage.removeItem('session_token')
      localStorage.removeItem('user_id')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Authentication related APIs
export const authAPI = {
  // User registration
  register: (userData) => api.post('/users', userData),
  
  // User login
  login: (credentials) => api.post('/login', credentials),
  
  // User logout
  logout: () => api.post('/logout')
}

// Event related APIs
export const eventAPI = {
  // Get all events
  getAllEvents: (categoryId) => api.get('/events', { params: { category_id: categoryId } }),
  
  // Get single event details
  getEventById: (eventId) => api.get(`/events/${eventId}`),
  
  // Create event
  createEvent: (eventData) => api.post('/events', eventData),
  
  // Update event
  updateEvent: (eventId, eventData) => api.patch(`/events/${eventId}`, eventData),
  
  // Delete event
  deleteEvent: (eventId) => api.delete(`/events/${eventId}`),
  
  // Register for event
  registerForEvent: (eventId) => api.post(`/events/${eventId}`),
  
  // Search events
  searchEvents: (filters) => api.get('/search', { params: filters })
}

// Question related APIs
export const questionAPI = {
  // Get questions list for event
  getQuestionsByEventId: (eventId) => api.get(`/events/${eventId}/questions`),
  
  // Create question
  createQuestion: (eventId, question) => api.post(`/events/${eventId}/question`, { question }),
  
  // Vote for question
  voteQuestion: (questionId) => api.post(`/questions/${questionId}/vote`),
  
  // Cancel vote
  downvoteQuestion: (questionId) => api.delete(`/questions/${questionId}/vote`),
  
  // Delete question
  deleteQuestion: (questionId) => api.delete(`/questions/${questionId}`)
}

export default api
