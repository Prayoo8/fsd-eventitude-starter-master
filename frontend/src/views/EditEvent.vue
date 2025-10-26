<template>
  <div class="edit-event">
    <div class="container">
      <div class="page-header">
        <h1>Edit Event</h1>
        <div class="header-actions">
          <router-link :to="`/events/${id}`" class="btn btn-secondary">
            Back to Event Details
          </router-link>
        </div>
      </div>
      
      <div v-if="loading" class="text-center">
        <p>Loading...</p>
      </div>
      
      <div v-else-if="error" class="alert alert-error">
        {{ error }}
      </div>
      
      <div v-else-if="event" class="edit-form-container">
        <div class="card">
          <form @submit.prevent="handleSubmit">
            <div v-if="submitError" class="alert alert-error">
              {{ submitError }}
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
                  placeholder="Please enter event name"
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
                placeholder="Please describe the event in detail"
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
                  placeholder="Please enter event location"
                />
              </div>
              
              <div class="form-group">
                <label for="max_attendees" class="form-label">Max Participants *</label>
                <input
                  id="max_attendees"
                  v-model.number="form.max_attendees"
                  type="number"
                  class="form-control"
                  min="1"
                  required
                  placeholder="Please enter max participants"
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
                :disabled="submitting"
              >
                {{ submitting ? 'Saving...' : 'Save Changes' }}
              </button>
              <router-link :to="`/events/${id}`" class="btn btn-secondary">
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
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { eventAPI } from '../services/api'

export default {
  name: 'EditEvent',
  props: {
    id: {
      type: String,
      required: true
    }
  },
  setup(props) {
    const router = useRouter()
    
    const event = ref(null)
    const loading = ref(true)
    const error = ref('')
    const submitting = ref(false)
    const submitError = ref('')
    
    const form = reactive({
      name: '',
      description: '',
      location: '',
      start: '',
      close_registration: '',
      max_attendees: 10
    })
    
    const fetchEvent = async () => {
      try {
        loading.value = true
        const response = await eventAPI.getEventById(props.id)
        event.value = response.data
        
        // Fill form data
        form.name = event.value.name
        form.description = event.value.description
        form.location = event.value.location
        form.max_attendees = event.value.max_attendees
        
        // Convert time format
        const startDate = new Date(event.value.start)
        const closeDate = new Date(event.value.close_registration)
        
        form.start = startDate.toISOString().slice(0, 16)
        form.close_registration = closeDate.toISOString().slice(0, 16)
        
      } catch (err) {
        error.value = err.response?.data?.error_message || 'Failed to fetch event details'
      } finally {
        loading.value = false
      }
    }
    
    const handleSubmit = async () => {
      submitting.value = true
      submitError.value = ''
      
      try {
        // Validate time
        const startDate = new Date(form.start)
        const closeDate = new Date(form.close_registration)
        
        if (closeDate >= startDate) {
          submitError.value = 'Registration deadline must be earlier than event start time'
          return
        }
        
        // Prepare submission data
        const eventData = {
          name: form.name,
          description: form.description,
          location: form.location,
          max_attendees: form.max_attendees,
          start: startDate.getTime(),
          close_registration: closeDate.getTime()
        }
        
        await eventAPI.updateEvent(props.id, eventData)
        
        // Update successful, redirect to event detail page
        router.push(`/events/${props.id}`)
        
      } catch (err) {
        submitError.value = err.response?.data?.error_message || 'Failed to update event'
      } finally {
        submitting.value = false
      }
    }
    
    onMounted(() => {
      fetchEvent()
    })
    
    return {
      event,
      loading,
      error,
      submitting,
      submitError,
      form,
      handleSubmit
    }
  }
}
</script>

<style scoped>
.edit-event {
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
  background: linear-gradient(45deg, rgba(255, 255, 255, 0.9), rgba(120, 140, 160, 0.7));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.edit-form-container {
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
  border: 2px solid rgba(80, 100, 120, 0.3);
  border-radius: 18px;
  font-size: 16px;
  background: linear-gradient(145deg, 
    rgba(40, 45, 55, 0.8) 0%, 
    rgba(30, 35, 45, 0.9) 100%);
  color: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(15px) saturate(1.1);
  -webkit-backdrop-filter: blur(15px) saturate(1.1);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 
    inset 0 3px 6px rgba(0, 0, 0, 0.2),
    inset 0 -1px 2px rgba(255, 255, 255, 0.05),
    0 6px 12px rgba(0, 0, 0, 0.15),
    0 2px 4px rgba(0, 0, 0, 0.1);
  position: relative;
  transform: perspective(100px) rotateX(1deg);
}

.form-control::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.form-control:focus {
  outline: none;
  border-color: rgba(100, 120, 140, 0.6);
  background: linear-gradient(145deg, 
    rgba(45, 50, 60, 0.9) 0%, 
    rgba(35, 40, 50, 0.95) 100%);
  box-shadow: 
    inset 0 3px 6px rgba(0, 0, 0, 0.2),
    inset 0 -1px 2px rgba(255, 255, 255, 0.08),
    0 0 0 3px rgba(100, 120, 140, 0.2),
    0 8px 20px rgba(100, 120, 140, 0.1),
    0 4px 8px rgba(0, 0, 0, 0.2);
  transform: perspective(100px) rotateX(0deg) translateY(-2px);
}

.form-control:hover {
  border-color: rgba(100, 120, 140, 0.5);
  background: linear-gradient(145deg, 
    rgba(42, 47, 57, 0.85) 0%, 
    rgba(32, 37, 47, 0.9) 100%);
  transform: perspective(100px) rotateX(0.5deg) translateY(-1px);
  box-shadow: 
    inset 0 3px 6px rgba(0, 0, 0, 0.15),
    inset 0 -1px 2px rgba(255, 255, 255, 0.06),
    0 6px 12px rgba(0, 0, 0, 0.2),
    0 2px 4px rgba(0, 0, 0, 0.15);
}

.form-actions {
  display: flex;
  gap: 15px;
  justify-content: center;
  margin-top: 40px;
}

.btn {
  padding: 14px 32px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 16px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  color: inherit !important;
  position: relative;
  z-index: 10;
  border: 2px solid transparent;
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  transform: perspective(100px) rotateX(1deg);
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
  background: linear-gradient(145deg, 
    rgba(40, 45, 55, 0.8) 0%, 
    rgba(30, 35, 45, 0.9) 100%) !important;
  border: 2px solid rgba(80, 100, 120, 0.4) !important;
  backdrop-filter: blur(15px) saturate(1.1) !important;
  -webkit-backdrop-filter: blur(15px) saturate(1.1) !important;
  box-shadow: 
    0 8px 20px rgba(0, 0, 0, 0.3),
    inset 0 3px 6px rgba(0, 0, 0, 0.2),
    inset 0 -1px 2px rgba(255, 255, 255, 0.05),
    0 0 0 1px rgba(255, 255, 255, 0.05) !important;
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
  background: linear-gradient(145deg, 
    rgba(45, 50, 60, 0.9) 0%, 
    rgba(35, 40, 50, 0.95) 100%) !important;
  color: rgba(255, 255, 255, 1) !important;
  border-color: rgba(100, 120, 140, 0.6) !important;
  box-shadow: 
    0 12px 28px rgba(0, 0, 0, 0.4),
    0 0 0 3px rgba(100, 120, 140, 0.2),
    inset 0 3px 6px rgba(0, 0, 0, 0.15),
    inset 0 -1px 2px rgba(255, 255, 255, 0.08) !important;
  transform: perspective(100px) rotateX(0deg) translateY(-3px) !important;
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
