<template>
  <div class="event-detail">
    <div class="container">
      <div v-if="loading" class="text-center">
        <p>Loading...</p>
      </div>
      
      <div v-else-if="error" class="alert alert-error">
        {{ error }}
      </div>
      
      <div v-else-if="event" class="event-detail-content">
        <!-- Event Basic Information -->
        <div class="event-header">
          <div class="event-title-section">
            <h1 class="event-title">{{ event.name }}</h1>
            <div class="event-meta">
              <span class="event-status" :class="getEventStatus(event)">
                {{ getEventStatusText(event) }}
              </span>
            <span class="event-creator">
              Creator: {{ event.creator.first_name }} {{ event.creator.last_name }}
            </span>
            </div>
          </div>
          
          <div class="event-actions">
            <button 
              v-if="isAuthenticated && !isCreator && !isRegistered && canRegister"
              @click="handleRegister"
              :disabled="registerLoading"
              class="btn btn-primary"
            >
              {{ registerLoading ? 'Registering...' : 'Register for Event' }}
            </button>
            
            <button 
              v-if="isAuthenticated && isCreator"
              @click="editEvent"
              class="btn btn-secondary"
            >
              Edit Event
            </button>
            
            <button 
              v-if="isAuthenticated && isCreator"
              @click="handleDelete"
              :disabled="deleteLoading"
              class="btn btn-danger"
            >
              {{ deleteLoading ? 'Deleting...' : 'Delete Event' }}
            </button>
          </div>
        </div>
        
        <div class="event-content">
          <div class="event-info">
            <div class="info-card">
              <h3>Event Details</h3>
              <div class="info-item">
                <span class="info-label">📍 Location</span>
                <span class="info-value">{{ event.location }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">📅 Start Time</span>
                <span class="info-value">{{ formatDate(event.start) }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">�?Registration Deadline</span>
                <span class="info-value">{{ formatDate(event.close_registration) }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">👥 Participants</span>
                <span class="info-value">{{ event.number_attending || 0 }} / {{ event.max_attendees }} people</span>
              </div>
            </div>
            
            <div class="description-card">
              <h3>Event Description</h3>
              <p>{{ event.description }}</p>
            </div>
          </div>
          
          <!-- Questions Section -->
          <div class="questions-section">
            <div class="questions-header">
              <h3>Questions & Discussion</h3>
              <button 
                v-if="isAuthenticated && !isCreator && isRegistered"
                @click="showQuestionForm = !showQuestionForm"
                class="btn btn-primary"
              >
                {{ showQuestionForm ? 'Cancel Question' : 'Ask Question' }}
              </button>
            </div>
            
            <!-- Question Form -->
            <div v-if="showQuestionForm" class="question-form">
              <form @submit.prevent="handleSubmitQuestion">
                <div class="form-group">
                  <textarea
                    v-model="newQuestion"
                    class="form-control"
                    rows="3"
                    placeholder="Please enter your question..."
                    required
                  ></textarea>
                </div>
                <div class="form-actions">
                  <button type="submit" :disabled="questionLoading" class="btn btn-primary">
                    {{ questionLoading ? 'Submitting...' : 'Submit Question' }}
                  </button>
                  <button type="button" @click="showQuestionForm = false" class="btn btn-secondary">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
            
            <!-- Questions List -->
            <div v-if="questions.length === 0" class="no-questions">
              <p>No questions yet, be the first to ask!</p>
            </div>
            
            <div v-else class="questions-list">
              <div v-for="question in questions" :key="question.question_id" class="question-item">
                <div class="question-content">
                  <p class="question-text">{{ question.question }}</p>
                  <div class="question-meta">
                    <span class="question-author">
                      Asked by: {{ question.asked_by.first_name }}
                    </span>
                    <span class="question-votes">
                      👍 {{ question.votes }} votes
                    </span>
                  </div>
                </div>
                
                <div class="question-actions">
                  <button 
                    v-if="isAuthenticated && !isCreator && isRegistered"
                    @click="handleVote(question.question_id)"
                    :disabled="votingLoading"
                    class="btn btn-success btn-sm"
                  >
                    Vote
                  </button>
                  
                  <button 
                    v-if="isAuthenticated && (isCreator || question.asked_by.user_id == userId)"
                    @click="handleDeleteQuestion(question.question_id)"
                    :disabled="deleteQuestionLoading"
                    class="btn btn-danger btn-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { eventAPI, questionAPI } from '../services/api'
import { useAuth } from '../store/auth'

export default {
  name: 'EventDetail',
  props: {
    id: {
      type: String,
      required: true
    }
  },
  setup(props) {
    const router = useRouter()
    const route = useRoute()
    const { state, getUserId } = useAuth()
    
    const event = ref(null)
    const questions = ref([])
    const loading = ref(true)
    const error = ref('')
    
    // Form state
    const showQuestionForm = ref(false)
    const newQuestion = ref('')
    const questionLoading = ref(false)
    const registerLoading = ref(false)
    const deleteLoading = ref(false)
    const votingLoading = ref(false)
    const deleteQuestionLoading = ref(false)
    
    const isAuthenticated = computed(() => state.isAuthenticated)
    const userId = computed(() => getUserId())
    const isCreator = computed(() => event.value && event.value.creator.creator_id == userId.value)
    const isRegistered = computed(() => {
      if (!event.value || !isAuthenticated.value) return false
      return event.value.attendees?.some(attendee => attendee.user_id == userId.value) || false
    })
    const canRegister = computed(() => {
      if (!event.value) return false
      const now = new Date()
      const closeDate = new Date(event.value.close_registration)
      return closeDate > now && event.value.close_registration !== -1
    })
    
    const fetchEvent = async () => {
      try {
        loading.value = true
        const response = await eventAPI.getEventById(props.id)
        event.value = response.data
        questions.value = event.value.questions || []
      } catch (err) {
        error.value = err.response?.data?.error_message || 'Failed to get event details'
      } finally {
        loading.value = false
      }
    }
    
    const handleRegister = async () => {
      try {
        registerLoading.value = true
        await eventAPI.registerForEvent(props.id)
        // Refresh event details
        await fetchEvent()
      } catch (err) {
        alert(err.response?.data?.error_message || 'Registration failed')
      } finally {
        registerLoading.value = false
      }
    }
    
    const handleDelete = async () => {
      if (!confirm('Are you sure you want to delete this event?')) return
      
      try {
        deleteLoading.value = true
        await eventAPI.deleteEvent(props.id)
        router.push('/events')
      } catch (err) {
        alert(err.response?.data?.error_message || 'Delete failed')
      } finally {
        deleteLoading.value = false
      }
    }
    
    const handleSubmitQuestion = async () => {
      try {
        questionLoading.value = true
        await questionAPI.createQuestion(props.id, newQuestion.value)
        newQuestion.value = ''
        showQuestionForm.value = false
        // Refresh event details
        await fetchEvent()
      } catch (err) {
        alert(err.response?.data?.error_message || 'Question submission failed')
      } finally {
        questionLoading.value = false
      }
    }
    
    const handleVote = async (questionId) => {
      try {
        votingLoading.value = true
        await questionAPI.voteQuestion(questionId)
        // Refresh event details
        await fetchEvent()
      } catch (err) {
        alert(err.response?.data?.error_message || 'Vote failed')
      } finally {
        votingLoading.value = false
      }
    }
    
    const handleDeleteQuestion = async (questionId) => {
      if (!confirm('Are you sure you want to delete this question?')) return
      
      try {
        deleteQuestionLoading.value = true
        await questionAPI.deleteQuestion(questionId)
        // Refresh event details
        await fetchEvent()
      } catch (err) {
        alert(err.response?.data?.error_message || 'Delete failed')
      } finally {
        deleteQuestionLoading.value = false
      }
    }
    
    const editEvent = () => {
      router.push(`/events/${props.id}/edit`)
    }
    
    const formatDate = (dateString) => {
      if (!dateString) return 'Not set'
      const date = new Date(dateString)
      return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    }
    
    const getEventStatus = (event) => {
      const now = new Date()
      const startDate = new Date(event.start)
      const closeDate = new Date(event.close_registration)
      
      if (event.close_registration === -1) {
        return 'archived'
      } else if (closeDate < now) {
        return 'closed'
      } else if (startDate < now) {
        return 'ongoing'
      } else {
        return 'upcoming'
      }
    }
    
    const getEventStatusText = (event) => {
      const status = getEventStatus(event)
      const statusMap = {
        'upcoming': 'Upcoming',
        'ongoing': 'Ongoing',
        'closed': 'Registration Closed',
        'archived': 'Archived'
      }
      return statusMap[status] || 'Unknown Status'
    }
    
    onMounted(() => {
      fetchEvent()
    })
    
    return {
      event,
      questions,
      loading,
      error,
      isAuthenticated,
      userId,
      isCreator,
      isRegistered,
      canRegister,
      showQuestionForm,
      newQuestion,
      questionLoading,
      registerLoading,
      deleteLoading,
      votingLoading,
      deleteQuestionLoading,
      handleRegister,
      handleDelete,
      handleSubmitQuestion,
      handleVote,
      handleDeleteQuestion,
      editEvent,
      formatDate,
      getEventStatus,
      getEventStatusText
    }
  }
}
</script>

<style scoped>
.event-detail {
  padding: 40px 0;
}

.event-detail-content {
  max-width: 1000px;
  margin: 0 auto;
}

.event-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 40px;
  padding: 30px;
  background: rgba(30, 35, 45, 0.9);
  border: 1px solid rgba(120, 140, 160, 0.3);
  border-radius: 20px;
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.3),
    0 0 20px rgba(120, 140, 160, 0.03),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  position: relative;
  overflow: hidden;
}

.event-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, 
    rgba(120, 140, 160, 0.02) 0%, 
    rgba(140, 120, 140, 0.02) 50%, 
    rgba(120, 140, 160, 0.02) 100%);
  z-index: -1;
}

.event-title {
  font-size: 2.5rem;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 15px;
  font-weight: 700;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  background: linear-gradient(45deg, rgba(255, 255, 255, 0.9), rgba(120, 140, 160, 0.7));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.event-meta {
  display: flex;
  gap: 20px;
  align-items: center;
}

.event-status {
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
}

.event-status.upcoming {
  background-color: #e3f2fd;
  color: #1976d2;
}

.event-status.ongoing {
  background-color: #e8f5e8;
  color: #2e7d32;
}

.event-status.closed {
  background-color: #fff3e0;
  color: #f57c00;
}

.event-status.archived {
  background-color: #f3e5f5;
  color: #7b1fa2;
}

.event-creator {
  color: rgba(150, 170, 190, 0.8);
  font-size: 14px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
  font-weight: 500;
}

.event-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.event-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
}

.event-info {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.info-card, .description-card {
  background: rgba(30, 35, 45, 0.85);
  border: 1px solid rgba(120, 140, 160, 0.25);
  padding: 25px;
  border-radius: 16px;
  box-shadow: 
    0 8px 24px rgba(0, 0, 0, 0.2),
    0 0 12px rgba(120, 140, 160, 0.03),
    inset 0 1px 0 rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  position: relative;
  overflow: hidden;
}

.info-card::before, .description-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, 
    rgba(120, 140, 160, 0.015) 0%, 
    rgba(140, 120, 140, 0.015) 50%, 
    rgba(120, 140, 160, 0.015) 100%);
  z-index: -1;
}

.info-card h3, .description-card h3 {
  margin-bottom: 20px;
  color: rgba(150, 170, 190, 0.9);
  font-size: 1.3rem;
  font-weight: 600;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid rgba(120, 140, 160, 0.2);
  transition: all 0.3s ease;
}

.info-item:last-child {
  border-bottom: none;
}

.info-item:hover {
  background: rgba(120, 140, 160, 0.02);
  border-radius: 8px;
  padding: 12px 8px;
  margin: 0 -8px;
}

.info-label {
  font-weight: 500;
  color: rgba(255, 255, 255, 0.7);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

.info-value {
  color: rgba(150, 170, 190, 0.9);
  font-weight: 500;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

.description-card p {
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.8);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
  font-weight: 400;
}

.questions-section {
  background: rgba(30, 35, 45, 0.85);
  border: 1px solid rgba(120, 140, 160, 0.25);
  padding: 25px;
  border-radius: 16px;
  box-shadow: 
    0 8px 24px rgba(0, 0, 0, 0.2),
    0 0 12px rgba(120, 140, 160, 0.03),
    inset 0 1px 0 rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  position: relative;
  overflow: hidden;
}

.questions-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, 
    rgba(120, 140, 160, 0.015) 0%, 
    rgba(140, 120, 140, 0.015) 50%, 
    rgba(120, 140, 160, 0.015) 100%);
  z-index: -1;
}

.questions-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
}

.questions-header h3 {
  color: rgba(150, 170, 190, 0.9);
  font-size: 1.3rem;
  font-weight: 600;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

.question-form {
  margin-bottom: 30px;
  padding: 20px;
  background: rgba(120, 140, 160, 0.02);
  border: 1px solid rgba(120, 140, 160, 0.2);
  border-radius: 12px;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.form-actions {
  display: flex;
  gap: 10px;
  margin-top: 15px;
}

.no-questions {
  text-align: center;
  padding: 40px;
  color: rgba(255, 255, 255, 0.7);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
  font-weight: 400;
}

.questions-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.question-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #007bff;
}

.question-content {
  flex: 1;
  margin-right: 15px;
}

.question-text {
  font-size: 16px;
  color: #333;
  margin-bottom: 10px;
  line-height: 1.5;
}

.question-meta {
  display: flex;
  gap: 20px;
  font-size: 14px;
  color: #666;
}

.question-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.btn-sm {
  padding: 6px 12px;
  font-size: 12px;
}

/* Ensure button text is visible */
.btn {
  color: inherit !important;
  position: relative;
  z-index: 10;
}

.btn > * {
  position: relative;
  z-index: 11;
}

.btn-secondary {
  color: #333 !important;
  background: rgba(255, 255, 255, 0.9) !important;
  border: 1px solid #ddd !important;
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 1) !important;
  color: #000 !important;
}

@media (max-width: 768px) {
  .event-header {
    flex-direction: column;
    gap: 20px;
  }
  
  .event-content {
    grid-template-columns: 1fr;
  }
  
  .event-actions {
    width: 100%;
    justify-content: center;
  }
  
  .question-item {
    flex-direction: column;
    gap: 15px;
  }
  
  .question-actions {
    width: 100%;
    justify-content: center;
  }
}
</style>
