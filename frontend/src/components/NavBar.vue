<template>
  <nav class="navbar">
    <div class="container">
      <div class="navbar-brand">
        <router-link to="/" class="brand-link">
          Eventitude
        </router-link>
      </div>
      
      <div class="navbar-menu">
        <div class="navbar-start">
          <router-link to="/events" class="navbar-item">
            All Events
          </router-link>
          <router-link v-if="isAuthenticated" to="/my-events" class="navbar-item">
            My Events
          </router-link>
        </div>
        
        <div class="navbar-end">
          <div v-if="!isAuthenticated" class="navbar-item">
            <router-link to="/login" class="btn btn-primary">
              Login
            </router-link>
            <router-link to="/register" class="btn btn-secondary">
              Register
            </router-link>
          </div>
          
          <div v-else class="navbar-item">
            <span class="user-info">User ID: {{ userId }}</span>
            <button @click="handleLogout" class="btn btn-secondary">
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>

<script>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../store/auth'

export default {
  name: 'NavBar',
  setup() {
    const router = useRouter()
    const { state, logout, getUserId } = useAuth()
    
    const isAuthenticated = computed(() => state.isAuthenticated)
    const userId = computed(() => getUserId())
    
    const handleLogout = async () => {
      await logout()
      router.push('/')
    }
    
    return {
      isAuthenticated,
      userId,
      handleLogout
    }
  }
}
</script>

<style scoped>
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(31, 38, 135, 0.37);
  z-index: 1000;
  height: 80px;
  transition: all 0.3s ease;
}

.navbar .container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
  padding: 0 24px;
}

.navbar-brand {
  font-size: 28px;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%, #00ffff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: relative;
  animation: cyberPulse 4s ease-in-out infinite;
}

.navbar-brand::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 0;
  height: 2px;
  background: linear-gradient(90deg, var(--cyber-primary), var(--cyber-secondary));
  transition: width 0.3s ease;
  animation: cyberGlow 2s ease-in-out infinite;
}

.navbar-brand:hover::after {
  width: 100%;
}

.brand-link {
  color: inherit;
  text-decoration: none;
  transition: all 0.3s ease;
}

.brand-link:hover {
  transform: scale(1.05);
  filter: brightness(1.1);
}

.navbar-menu {
  display: flex;
  align-items: center;
  gap: 32px;
}

.navbar-start {
  display: flex;
  gap: 24px;
}

.navbar-end {
  display: flex;
  align-items: center;
  gap: 16px;
}

.navbar-item {
  color: rgba(255, 255, 255, 0.9);
  text-decoration: none;
  padding: 12px 20px;
  border-radius: 16px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  font-weight: 500;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid transparent;
}

.navbar-item:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(31, 38, 135, 0.3);
  color: rgba(255, 255, 255, 1);
}

.navbar-item.router-link-active {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.3);
  color: rgba(255, 255, 255, 1);
  box-shadow: 0 4px 15px rgba(31, 38, 135, 0.2);
}

.user-info {
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
  font-weight: 500;
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

/* Enhanced Button Styles */
.navbar .btn {
  padding: 10px 20px;
  font-size: 14px;
  border-radius: 12px;
  font-weight: 500;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.navbar .btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
  position: relative;
  overflow: hidden;
}

.navbar .btn-primary::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(0, 255, 255, 0.3), transparent);
  transition: left 0.6s ease;
}

.navbar .btn-primary:hover::before {
  left: 100%;
}

.navbar .btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.6), 0 0 20px rgba(0, 255, 255, 0.3);
  animation: cyberPulse 2s ease-in-out infinite;
}

.navbar .btn-secondary {
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.navbar .btn-secondary:hover {
  background: rgba(255, 255, 255, 0.25);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(31, 38, 135, 0.3);
}

/* Responsive Design */
@media (max-width: 768px) {
  .navbar {
    height: 70px;
  }
  
  .navbar .container {
    padding: 0 16px;
  }
  
  .navbar-brand {
    font-size: 24px;
  }
  
  .navbar-menu {
    gap: 16px;
  }
  
  .navbar-start {
    gap: 12px;
  }
  
  .navbar-end {
    gap: 12px;
  }
  
  .navbar-item {
    padding: 8px 12px;
    font-size: 13px;
  }
  
  .user-info {
    font-size: 12px;
    padding: 6px 12px;
  }
  
  .navbar .btn {
    padding: 8px 16px;
    font-size: 13px;
  }
}

@media (max-width: 480px) {
  .navbar-menu {
    flex-direction: column;
    gap: 8px;
  }
  
  .navbar-start {
    flex-direction: column;
    gap: 8px;
  }
  
  .navbar-end {
    flex-direction: column;
    gap: 8px;
  }
}
</style>
