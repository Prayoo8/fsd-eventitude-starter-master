<template>
  <div class="home">
    <div class="hero">
      <div class="container">
        <h1 class="hero-title">Eventitude Awaits</h1>
        <p class="hero-subtitle">Explore, host, and join unforgettable events</p>
        <div class="hero-actions">
          <router-link to="/events" class="btn btn-primary btn-lg">
            Browse Events
          </router-link>
          <router-link v-if="isAuthenticated" to="/events/create" class="btn btn-secondary btn-lg">
            Create Event
          </router-link>
          <router-link v-else to="/login" class="btn btn-secondary btn-lg">
            Login to Create
          </router-link>
        </div>
      </div>
    </div>
    
    <div class="features">
      <div class="container">
        <h2 class="section-title">Features</h2>
        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon">🎉</div>
            <h3>Create Events</h3>
            <p>Easily create and manage your events, set time, location and participant limits</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">👥</div>
            <h3>Join Events</h3>
            <p>Browse and register for interesting events, interact with other participants</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">❓</div>
            <h3>Q&A Interaction</h3>
            <p>Ask questions in events and vote for the most popular questions</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'
import { useAuth } from '../store/auth'

export default {
  name: 'Home',
  setup() {
    const { state } = useAuth()
    
    const isAuthenticated = computed(() => state.isAuthenticated)
    
    return {
      isAuthenticated
    }
  }
}
</script>

<style scoped>
.home {
  min-height: calc(100vh - 80px);
  position: relative;
}

.hero {
  position: relative;
  padding: 120px 0;
  text-align: center;
  overflow: hidden;
}

.hero::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    radial-gradient(circle at 30% 20%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
    radial-gradient(circle at 70% 80%, rgba(255, 119, 198, 0.3) 0%, transparent 50%),
    radial-gradient(circle at 50% 50%, rgba(120, 219, 255, 0.2) 0%, transparent 50%);
  pointer-events: none;
}

.hero .container {
  position: relative;
  z-index: 2;
}

.hero-title {
  font-size: 4rem;
  margin-bottom: 24px;
  font-weight: 800;
  background: linear-gradient(135deg, #ffffff 0%, #f0f0f0 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  animation: fadeInUp 1s ease-out;
}

.hero-subtitle {
  font-size: 1.4rem;
  margin-bottom: 48px;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 400;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
  animation: fadeInUp 1s ease-out 0.2s both;
}

.hero-actions {
  display: flex;
  gap: 24px;
  justify-content: center;
  flex-wrap: wrap;
  animation: fadeInUp 1s ease-out 0.4s both;
}

.btn-lg {
  padding: 18px 36px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 20px;
  position: relative;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.btn-lg::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s;
}

.btn-lg:hover::before {
  left: 100%;
}

.features {
  padding: 120px 0;
  position: relative;
}

.features::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.1) 0%, transparent 50%);
  pointer-events: none;
}

.section-title {
  text-align: center;
  font-size: 3rem;
  margin-bottom: 80px;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 700;
  position: relative;
  z-index: 2;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 48px;
  position: relative;
  z-index: 2;
}

.feature-card {
  text-align: center;
  padding: 48px 32px;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  box-shadow: 0 8px 32px rgba(31, 38, 135, 0.37);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.feature-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.feature-card:hover::before {
  opacity: 1;
}

.feature-card:hover {
  transform: translateY(-12px) scale(1.02);
  box-shadow: 0 20px 60px rgba(31, 38, 135, 0.5), 0 0 30px rgba(0, 255, 255, 0.2);
  border-color: rgba(0, 255, 255, 0.4);
  animation: cyberFloat 3s ease-in-out infinite;
}

.feature-icon {
  font-size: 4rem;
  margin-bottom: 24px;
  display: block;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1));
  animation: float 3s ease-in-out infinite;
}

.feature-card:nth-child(2) .feature-icon {
  animation-delay: 0.5s;
}

.feature-card:nth-child(3) .feature-icon {
  animation-delay: 1s;
}

.feature-card h3 {
  font-size: 1.8rem;
  margin-bottom: 20px;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 600;
  position: relative;
  z-index: 2;
}

.feature-card p {
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.7;
  font-size: 16px;
  position: relative;
  z-index: 2;
}

/* Animation Effects */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
}

/* Responsive Design */
@media (max-width: 768px) {
  .hero {
    padding: 80px 0;
  }
  
  .hero-title {
    font-size: 2.5rem;
  }
  
  .hero-subtitle {
    font-size: 1.2rem;
    margin-bottom: 32px;
  }
  
  .hero-actions {
    flex-direction: column;
    align-items: center;
    gap: 16px;
  }
  
  .btn-lg {
    padding: 16px 32px;
    font-size: 15px;
  }
  
  .features {
    padding: 80px 0;
  }
  
  .section-title {
    font-size: 2.2rem;
    margin-bottom: 60px;
  }
  
  .features-grid {
    grid-template-columns: 1fr;
    gap: 32px;
  }
  
  .feature-card {
    padding: 32px 24px;
  }
  
  .feature-icon {
    font-size: 3rem;
  }
  
  .feature-card h3 {
    font-size: 1.5rem;
  }
}

@media (max-width: 480px) {
  .hero-title {
    font-size: 2rem;
  }
  
  .hero-subtitle {
    font-size: 1.1rem;
  }
  
  .section-title {
    font-size: 1.8rem;
  }
  
  .feature-card {
    padding: 24px 20px;
  }
}
</style>
