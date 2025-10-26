<template>
  <div class="create-event">
    <div class="container">
      <div class="page-header">
        <h1>Create Event</h1>
        <router-link to="/events" class="btn btn-secondary">
          Back to Events
        </router-link>
      </div>
      
      <div class="create-form-container">
        <div class="card">
          <form @submit.prevent="handleSubmit">
            <div v-if="error" class="alert alert-error">
              {{ error }}
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label for="name" class="form-label">Event Name *</label>
                <input
                  id="name"
                  v-model="form.name"
                  type="text"
                  class="form-control"
                  required
                  placeholder="Enter event name"
                />
              </div>
            </div>
            
            <div class="form-group">
              <label for="description" class="form-label">Event Description *</label>
              <textarea
                id="description"
                v-model="form.description"
                class="form-control"
                rows="4"
                required
                placeholder="Describe the event in detail"
              ></textarea>
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label for="location" class="form-label">Event Location *</label>
                <input
                  id="location"
                  v-model="form.location"
                  type="text"
                  class="form-control"
                  required
                  placeholder="Enter event location"
                />
              </div>
              
              <div class="form-group">
                <label for="max_attendees" class="form-label">Max Attendees *</label>
                <input
                  id="max_attendees"
                  v-model.number="form.max_attendees"
                  type="number"
                  class="form-control"
                  min="1"
                  required
                  placeholder="Enter max number of attendees"
                />
              </div>
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label for="start" class="form-label">Event Start Time *</label>
                <input
                  id="start"
                  v-model="form.start"
                  type="datetime-local"
                  class="form-control"
                  required
                />
              </div>
              
              <div class="form-group">
                <label for="close_registration" class="form-label">Registration Deadline *</label>
                <input
                  id="close_registration"
                  v-model="form.close_registration"
                  type="datetime-local"
                  class="form-control"
                  required
                />
              </div>
            </div>
            
            <div class="form-actions">
              <button 
                type="submit" 
                class="btn btn-primary"
                :disabled="loading"
              >
                {{ loading ? 'Creating...' : 'Create Event' }}
              </button>
              <router-link to="/events" class="btn btn-secondary">
                Cancel
              </router-link>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { eventAPI } from '../services/api'

export default {
  name: 'CreateEvent',
  setup() {
    const router = useRouter()
    
    const form = reactive({
      name: '',
      description: '',
      location: '',
      start: '',
      close_registration: '',
      max_attendees: 10
    })
    
    const loading = ref(false)
    const error = ref('')
    
    const handleSubmit = async () => {
      loading.value = true
      error.value = ''
      
      try {
        // Validate time
        const startDate = new Date(form.start)
        const closeDate = new Date(form.close_registration)
        
        if (closeDate >= startDate) {
          error.value = 'Registration deadline must be earlier than event start time'
          return
        }
        
        if (startDate <= new Date()) {
          error.value = 'Event start time must be in the future'
          return
        }
        
        // Prepare submission data
        const eventData = {
          ...form,
          start: startDate.getTime(),
          close_registration: closeDate.getTime()
        }
        
        const response = await eventAPI.createEvent(eventData)
        
        // Creation successful, redirect to event detail page
        router.push(`/events/${response.data.event_id}`)
        
      } catch (err) {
        error.value = err.response?.data?.error_message || 'Failed to create event'
      } finally {
        loading.value = false
      }
    }
    
    return {
      form,
      loading,
      error,
      handleSubmit
    }
  }
}
</script>

<style scoped>
.create-event {
  padding: 40px 0;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;
  padding: 20px 0;
}

.page-header h1 {
  color: rgba(255, 255, 255, 0.9);
  font-size: 2.5rem;
  font-weight: 700;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  background: linear-gradient(45deg, rgba(255, 255, 255, 0.9), rgba(0, 255, 255, 0.7));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.create-form-container {
  max-width: 800px;
  margin: 0 auto;
}

.card {
  background: linear-gradient(145deg, 
    rgba(25, 30, 40, 0.95) 0%, 
    rgba(35, 40, 50, 0.9) 50%, 
    rgba(25, 30, 40, 0.95) 100%);
  border: 2px solid rgba(80, 100, 120, 0.4);
  border-radius: 24px;
  box-shadow: 
    0 20px 60px rgba(0, 0, 0, 0.4),
    0 8px 24px rgba(0, 0, 0, 0.3),
    inset 0 2px 4px rgba(255, 255, 255, 0.1),
    inset 0 -2px 4px rgba(0, 0, 0, 0.2),
    0 0 0 1px rgba(255, 255, 255, 0.05);
  padding: 40px;
  backdrop-filter: blur(25px) saturate(1.2);
  -webkit-backdrop-filter: blur(25px) saturate(1.2);
  position: relative;
  overflow: hidden;
  transform: perspective(1000px) rotateX(2deg);
  transition: all 0.3s ease;
}

.card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, 
    rgba(100, 120, 140, 0.08) 0%, 
    rgba(120, 100, 130, 0.05) 30%,
    rgba(80, 100, 120, 0.06) 70%,
    rgba(100, 120, 140, 0.08) 100%);
  z-index: -1;
  border-radius: 22px;
}

.card::after {
  content: '';
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  background: linear-gradient(45deg, 
    rgba(120, 140, 160, 0.3) 0%, 
    rgba(140, 120, 140, 0.2) 50%, 
    rgba(120, 140, 160, 0.3) 100%);
  border-radius: 26px;
  z-index: -2;
  opacity: 0.6;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.form-group {
  margin-bottom: 25px;
}

.form-label {
  display: block;
  margin-bottom: 12px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  font-size: 14px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  letter-spacing: 0.5px;
}

.form-control {
  width: 100%;
  padding: 16px 20px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  font-size: 16px;
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 
    inset 0 2px 4px rgba(0, 0, 0, 0.1),
    0 4px 8px rgba(0, 0, 0, 0.1);
  position: relative;
}

.form-control::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.form-control:focus {
  outline: none;
  border-color: rgba(0, 255, 255, 0.6);
  background: rgba(255, 255, 255, 0.15);
  box-shadow: 
    inset 0 2px 4px rgba(0, 0, 0, 0.1),
    0 0 0 3px rgba(0, 255, 255, 0.2),
    0 8px 16px rgba(0, 255, 255, 0.1);
  transform: translateY(-2px);
}

.form-control:hover {
  border-color: rgba(255, 255, 255, 0.3);
  background: rgba(255, 255, 255, 0.12);
  transform: translateY(-1px);
}

.form-control:invalid {
  border-color: #dc3545;
}

.form-actions {
  display: flex;
  gap: 15px;
  justify-content: center;
  margin-top: 40px;
}

.btn {
  padding: 12px 30px;
  font-size: 16px;
  font-weight: 500;
  border-radius: 8px;
  transition: all 0.3s ease;
  color: inherit !important;
  position: relative;
  z-index: 10;
}

.btn > * {
  position: relative;
  z-index: 11;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Ensure button text is visible */
.btn-secondary {
  color: rgba(255, 255, 255, 0.9) !important;
  background: rgba(255, 255, 255, 0.1) !important;
  border: 1px solid rgba(255, 255, 255, 0.3) !important;
  backdrop-filter: blur(10px) !important;
  -webkit-backdrop-filter: blur(10px) !important;
  box-shadow: 
    0 4px 16px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.2),
    inset 0 -1px 0 rgba(0, 0, 0, 0.1) !important;
  position: relative !important;
  overflow: hidden !important;
}

.btn-secondary::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.6s ease;
  z-index: 1;
}

.btn-secondary:hover::before {
  left: 100%;
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.15) !important;
  color: rgba(255, 255, 255, 1) !important;
  border-color: rgba(0, 255, 255, 0.5) !important;
  box-shadow: 
    0 8px 24px rgba(0, 255, 255, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.3),
    inset 0 -1px 0 rgba(0, 0, 0, 0.1) !important;
  transform: translateY(-2px) !important;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: 20px;
    text-align: center;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .btn {
    width: 100%;
  }
}
</style>
