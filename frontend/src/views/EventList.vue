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
      
      <!-- Search and Filter Section -->
      <div class="search-section">
        <div class="search-container">
          <div class="search-input-group">
            <div class="search-icon">🔍</div>
            <input 
              v-model="searchQuery" 
              @input="handleSearch"
              type="text" 
              placeholder="Search event name..." 
              class="search-input"
            />
            <button 
              v-if="searchQuery" 
              @click="clearSearch" 
              class="clear-btn"
            >
              ✕
            </button>
          </div>
          
          <div class="filter-group">
            <select v-model="statusFilter" @change="handleSearch" class="status-filter">
              <option value="">All statuses</option>
              <option value="OPEN">Open</option>
              <option value="ARCHIVE">Archived</option>
              <option v-if="isAuthenticated" value="MY_EVENTS">My events</option>
              <option v-if="isAuthenticated" value="ATTENDING">Attending</option>
            </select>
            
            <select v-model="sortBy" @change="handleSearch" class="sort-filter">
              <option value="start_date">By start time</option>
              <option value="name">By name</option>
              <option value="max_attendees">By capacity</option>
            </select>
          </div>
        </div>
        
        <div v-if="hasActiveFilters" class="active-filters">
          <span class="filter-label">Active filters:</span>
          <span v-if="searchQuery" class="filter-tag">
            Search: "{{ searchQuery }}"
            <button @click="clearSearchQuery" class="remove-filter">✕</button>
          </span>
          <span v-if="statusFilter" class="filter-tag">
            Status: {{ getStatusText(statusFilter) }}
            <button @click="clearStatusFilter" class="remove-filter">✕</button>
          </span>
          <button @click="clearAllFilters" class="clear-all-btn">Clear all</button>
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
              <span>Creator: {{ event.first_name }} {{ event.last_name }}</span>
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
import { ref, onMounted, computed, watch } from 'vue'
import { eventAPI } from '../services/api'
import { useAuth } from '../store/auth'

export default {
  name: 'EventList',
  setup() {
    const { state } = useAuth()
    const events = ref([])
    const loading = ref(true)
    const error = ref('')
    
    // Search and filter states
    const searchQuery = ref('')
    const statusFilter = ref('')
    const sortBy = ref('start_date')
    const searchTimeout = ref(null)
    
    const isAuthenticated = computed(() => state.isAuthenticated)
    
    // Check if there are active filters
    const hasActiveFilters = computed(() => {
      return searchQuery.value || statusFilter.value
    })
    
    // Search function with debouncing
    const handleSearch = () => {
      if (searchTimeout.value) {
        clearTimeout(searchTimeout.value)
      }
      
      searchTimeout.value = setTimeout(() => {
        fetchEvents()
      }, 300) // 300ms debounce
    }
    
    // Clear search query
    const clearSearchQuery = () => {
      searchQuery.value = ''
      handleSearch()
    }
    
    // Clear status filter
    const clearStatusFilter = () => {
      statusFilter.value = ''
      handleSearch()
    }
    
    // Clear all filters
    const clearAllFilters = () => {
      searchQuery.value = ''
      statusFilter.value = ''
      handleSearch()
    }
    
    // Clear search (for the clear button in input)
    const clearSearch = () => {
      searchQuery.value = ''
      handleSearch()
    }
    
    // Get status text for display
    const getStatusText = (status) => {
      const statusMap = {
        'OPEN': 'Open',
        'ARCHIVE': 'Archived',
        'MY_EVENTS': 'My events',
        'ATTENDING': 'Attending'
      }
      return statusMap[status] || status
    }
    
    const fetchEvents = async () => {
      try {
        loading.value = true
        error.value = ''
        
        // Prepare search filters
        const filters = {}
        if (searchQuery.value.trim()) {
          filters.q = searchQuery.value.trim()
        }
        if (statusFilter.value) {
          filters.status = statusFilter.value
        }
        
        // Use search API if there are filters, otherwise use getAllEvents
        let response
        if (Object.keys(filters).length > 0) {
          response = await eventAPI.searchEvents(filters)
          events.value = response.data || []
        } else {
          response = await eventAPI.getAllEvents()
          events.value = response.data.events || []
        }
        
        console.log('Events fetched:', events.value.length)
      } catch (err) {
        error.value = err.response?.data?.error_message || 'Failed to fetch events'
        console.error('Error fetching events:', err)
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
      searchQuery,
      statusFilter,
      sortBy,
      hasActiveFilters,
      handleSearch,
      clearSearchQuery,
      clearStatusFilter,
      clearAllFilters,
      clearSearch,
      getStatusText,
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
  line-clamp: 3;
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

/* Search Section Styles */
.search-section {
  margin-bottom: 40px;
  padding: 32px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 20px;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  box-shadow: 0 8px 32px rgba(31, 38, 135, 0.2);
}

.search-container {
  display: flex;
  gap: 20px;
  align-items: center;
  margin-bottom: 20px;
}

.search-input-group {
  position: relative;
  flex: 1;
  max-width: 400px;
}

.search-icon {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 18px;
  color: rgba(255, 255, 255, 0.6);
  z-index: 2;
}

.search-input {
  width: 100%;
  padding: 14px 16px 14px 48px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  color: rgba(255, 255, 255, 0.9);
  font-size: 16px;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

.search-input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.search-input:focus {
  outline: none;
  border-color: rgba(0, 255, 255, 0.5);
  box-shadow: 0 0 20px rgba(0, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.15);
}

.clear-btn {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  color: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  transition: all 0.2s ease;
}

.clear-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  color: white;
}

.filter-group {
  display: flex;
  gap: 16px;
  align-items: center;
}

.status-filter,
.sort-filter {
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  color: rgba(255, 255, 255, 0.9);
  font-size: 14px;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 140px;
}

.status-filter:focus,
.sort-filter:focus {
  outline: none;
  border-color: rgba(0, 255, 255, 0.5);
  box-shadow: 0 0 15px rgba(0, 255, 255, 0.2);
}

.status-filter option,
.sort-filter option {
  background: rgba(30, 30, 30, 0.95);
  color: rgba(255, 255, 255, 0.9);
}

.active-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
  padding-top: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.filter-label {
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
  font-weight: 500;
}

.filter-tag {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: rgba(0, 255, 255, 0.15);
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 20px;
  color: rgba(0, 255, 255, 0.9);
  font-size: 13px;
  font-weight: 500;
}

.remove-filter {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  font-size: 12px;
  padding: 2px;
  border-radius: 50%;
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.remove-filter:hover {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

.clear-all-btn {
  padding: 8px 16px;
  background: rgba(255, 107, 107, 0.2);
  border: 1px solid rgba(255, 107, 107, 0.3);
  border-radius: 16px;
  color: #ff6b6b;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.clear-all-btn:hover {
  background: rgba(255, 107, 107, 0.3);
  border-color: rgba(255, 107, 107, 0.5);
  transform: translateY(-1px);
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
  
  .search-section {
    padding: 24px 20px;
    margin-bottom: 32px;
  }
  
  .search-container {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
  
  .search-input-group {
    max-width: none;
  }
  
  .filter-group {
    flex-direction: column;
    gap: 12px;
  }
  
  .status-filter,
  .sort-filter {
    min-width: auto;
    width: 100%;
  }
  
  .active-filters {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
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
  
  .search-section {
    padding: 20px 16px;
    margin-bottom: 24px;
  }
  
  .search-input {
    font-size: 14px;
    padding: 12px 14px 12px 44px;
  }
  
  .search-icon {
    left: 14px;
    font-size: 16px;
  }
  
  .status-filter,
  .sort-filter {
    font-size: 13px;
    padding: 10px 14px;
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
