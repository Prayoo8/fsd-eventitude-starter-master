<template>
  <div class="event-list">
    <div class="container">
      <div class="page-header">
        <h1>All Events</h1>
        <div class="header-actions">
          <router-link v-if="isAuthenticated" to="/events/create" class="btn btn-primary">
            Create Event
          </router-link>
        </div>
      </div>
      
      <div v-if="loading" class="text-center">
        <p>Loading...</p>
      </div>
      
      <div v-else-if="error" class="alert alert-error">
        {{ error }}
      </div>
      
      <div v-else-if="events.length === 0" class="text-center">
        <p>No events available</p>
      </div>
      
      <div v-else class="events-grid">
        <div v-for="event in events" :key="event.event_id" class="event-card">
          <div class="event-header">
            <h3 class="event-title">{{ event.name }}</h3>
            <span class="event-status" :class="getEventStatus(event)">
              {{ getEventStatusText(event) }}
            </span>
          </div>
          
          <div class="event-content">
            <p class="event-description">{{ event.description }}</p>
            
            <div class="event-details">
              <div class="detail-item">
                <span class="detail-label">📍</span>
                <span>{{ event.location }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">📅</span>
                <span>{{ formatDate(event.start) }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">👥</span>
                <span>{{ event.number_attending || 0 }} / {{ event.max_attendees }} people</span>
              </div>
            </div>
            
            <div class="event-creator">
              <span>Creator: {{ event.creator.first_name }} {{ event.creator.last_name }}</span>
            </div>
          </div>
          
          <div class="event-actions">
            <router-link :to="`/events/${event.event_id}`" class="btn btn-primary">
              View Details
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { eventAPI } from '../services/api'
import { useAuth } from '../store/auth'

export default {
  name: 'EventList',
  setup() {
    const { state } = useAuth()
    const events = ref([])
    const loading = ref(true)
    const error = ref('')
    
    const isAuthenticated = computed(() => state.isAuthenticated)
    
    const fetchEvents = async () => {
      try {
        loading.value = true
        const response = await eventAPI.getAllEvents()
        events.value = response.data.events || []
      } catch (err) {
        error.value = err.response?.data?.error_message || 'Failed to fetch events'
      } finally {
        loading.value = false
      }
    }
    
    const formatDate = (dateString) => {
      if (!dateString) return 'Not set'
      const date = new Date(dateString)
      return date.toLocaleString('en-US', {
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
      fetchEvents()
    })
    
    return {
      events,
      loading,
      error,
      isAuthenticated,
      formatDate,
      getEventStatus,
      getEventStatusText
    }
  }
}
</script>

<style scoped>
.event-list {
  padding: 60px 0;
  position: relative;
  min-height: calc(100vh - 80px);
}

.event-list::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    radial-gradient(circle at 20% 20%, rgba(120, 119, 198, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 80%, rgba(255, 119, 198, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 50% 50%, rgba(120, 219, 255, 0.05) 0%, transparent 50%);
  pointer-events: none;
  z-index: 0;
}

.event-list .container {
  position: relative;
  z-index: 1;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 60px;
  padding: 40px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 24px;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  box-shadow: 0 8px 32px rgba(31, 38, 135, 0.37);
}

.page-header h1 {
  color: rgba(255, 255, 255, 0.9);
  font-size: 3rem;
  font-weight: 700;
  margin: 0;
  background: linear-gradient(135deg, #ffffff 0%, #f0f0f0 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.header-actions {
  display: flex;
  gap: 16px;
  align-items: center;
}

.events-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  gap: 32px;
}

.event-card {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 24px;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  box-shadow: 0 8px 32px rgba(31, 38, 135, 0.37);
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

.event-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: 1;
}

.event-card:hover::before {
  opacity: 1;
}

.event-card:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 0 20px 60px rgba(31, 38, 135, 0.5), 0 0 25px rgba(0, 255, 255, 0.2);
  border-color: rgba(0, 255, 255, 0.4);
  animation: cyberFloat 4s ease-in-out infinite;
}

.event-header {
  padding: 24px 24px 0;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  position: relative;
  z-index: 2;
}

.event-title {
  font-size: 1.4rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  margin: 0;
  flex: 1;
  margin-right: 16px;
  line-height: 1.3;
}

.event-status {
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.event-status.upcoming {
  background: rgba(25, 118, 210, 0.2);
  color: #64b5f6;
  border-color: rgba(25, 118, 210, 0.3);
}

.event-status.ongoing {
  background: rgba(46, 125, 50, 0.2);
  color: #81c784;
  border-color: rgba(46, 125, 50, 0.3);
}

.event-status.closed {
  background: rgba(245, 124, 0, 0.2);
  color: #ffb74d;
  border-color: rgba(245, 124, 0, 0.3);
}

.event-status.archived {
  background: rgba(123, 31, 162, 0.2);
  color: #ba68c8;
  border-color: rgba(123, 31, 162, 0.3);
}

.event-content {
  padding: 24px;
  position: relative;
  z-index: 2;
}

.event-description {
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.6;
  margin-bottom: 24px;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  font-size: 15px;
}

.event-details {
  margin-bottom: 20px;
}

.detail-item {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
}

.detail-label {
  margin-right: 12px;
  font-size: 16px;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
}

.event-creator {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 16px;
  margin-top: 16px;
}

.event-actions {
  padding: 0 24px 24px;
  position: relative;
  z-index: 2;
}

.event-actions .btn {
  width: 100%;
  text-align: center;
  padding: 14px 24px;
  font-weight: 600;
  border-radius: 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.event-actions .btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s;
}

.event-actions .btn:hover::before {
  left: 100%;
}

.event-actions .btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 40px rgba(102, 126, 234, 0.5);
}

/* Loading and Error State Styles */
.text-center {
  text-align: center;
  padding: 60px 20px;
  color: rgba(255, 255, 255, 0.8);
  font-size: 18px;
}

.alert-error {
  background: rgba(255, 107, 107, 0.2);
  color: #ff6b6b;
  border: 1px solid rgba(255, 107, 107, 0.3);
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 24px;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

/* Responsive Design */
@media (max-width: 768px) {
  .event-list {
    padding: 40px 0;
  }
  
  .page-header {
    flex-direction: column;
    gap: 24px;
    text-align: center;
    padding: 32px 24px;
  }
  
  .page-header h1 {
    font-size: 2.2rem;
  }
  
  .header-actions {
    justify-content: center;
  }
  
  .events-grid {
    grid-template-columns: 1fr;
    gap: 24px;
  }
  
  .event-card {
    border-radius: 20px;
  }
  
  .event-header {
    padding: 20px 20px 0;
  }
  
  .event-content {
    padding: 20px;
  }
  
  .event-actions {
    padding: 0 20px 20px;
  }
}

@media (max-width: 480px) {
  .page-header {
    padding: 24px 20px;
  }
  
  .page-header h1 {
    font-size: 1.8rem;
  }
  
  .event-header {
    padding: 16px 16px 0;
  }
  
  .event-content {
    padding: 16px;
  }
  
  .event-actions {
    padding: 0 16px 16px;
  }
  
  .event-title {
    font-size: 1.2rem;
  }
}
</style>
