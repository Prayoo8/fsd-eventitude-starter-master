<template>
  <div id="app">
    <CyberParticles />
    <NavBar />
    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<script>
import { onMounted } from 'vue'
import { useAuth } from './store/auth'
import NavBar from './components/NavBar.vue'
import CyberParticles from './components/CyberParticles.vue'

export default {
  name: 'App',
  components: {
    NavBar,
    CyberParticles
  },
  setup() {
    const { state } = useAuth()
    
    onMounted(() => {
      // Check authentication status in local storage
      const token = localStorage.getItem('session_token')
      const userId = localStorage.getItem('user_id')
      
      if (token && userId) {
        state.token = token
        state.user = { user_id: userId }
        state.isAuthenticated = true
      }
    })
  }
}
</script>

<style>
/* Glassmorphism Component Styles */
.main-content {
  padding-top: 80px;
  min-height: calc(100vh - 80px);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

/* Glassmorphism Button Styles */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 12px 24px;
  border: 1px solid var(--glass-border);
  border-radius: 16px;
  cursor: pointer;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: var(--glass-backdrop);
  -webkit-backdrop-filter: var(--glass-backdrop);
  position: relative;
  overflow: hidden;
  z-index: 2;
}

.btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s;
  z-index: 1;
}

.btn:hover::before {
  left: 100%;
}

/* Ensure button text is always displayed on top layer */
.btn > * {
  position: relative;
  z-index: 3;
}

.btn-primary {
  background: var(--btn-primary);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: var(--glass-shadow);
  position: relative;
  overflow: hidden;
}

.btn-primary::after {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(0, 255, 255, 0.3), transparent);
  transition: left 0.6s ease;
}

.btn-primary:hover::after {
  left: 100%;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 40px rgba(31, 38, 135, 0.5), 0 0 20px rgba(0, 255, 255, 0.3);
  animation: cyberPulse 2s ease-in-out infinite;
}

.btn-secondary {
  background: var(--btn-secondary);
  color: var(--text-primary);
  border: 1px solid var(--glass-border);
  box-shadow: var(--glass-shadow);
}

.btn-secondary:hover {
  background: var(--btn-hover);
  transform: translateY(-2px);
  box-shadow: 0 12px 40px rgba(31, 38, 135, 0.4);
}

.btn-danger {
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: var(--glass-shadow);
}

.btn-danger:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 40px rgba(255, 107, 107, 0.4);
}

.btn-success {
  background: linear-gradient(135deg, #51cf66 0%, #40c057 100%);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: var(--glass-shadow);
}

.btn-success:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 40px rgba(81, 207, 102, 0.4);
}

/* Cyberpunk Button Styles */
.btn-cyber {
  background: var(--btn-cyber);
  color: white;
  border: 1px solid var(--cyber-primary);
  box-shadow: 0 0 20px rgba(0, 255, 255, 0.3);
  position: relative;
  overflow: hidden;
  animation: cyberGlow 3s ease-in-out infinite;
}

.btn-cyber::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
  transition: left 0.8s ease;
}

.btn-cyber:hover::before {
  left: 100%;
}

.btn-cyber:hover {
  transform: translateY(-3px);
  box-shadow: 0 0 30px var(--cyber-primary), 0 0 60px var(--cyber-primary);
  animation: cyberGlow 1s ease-in-out infinite;
}

.btn-cyber::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  background: radial-gradient(circle, rgba(0, 255, 255, 0.3) 0%, transparent 70%);
  transform: translate(-50%, -50%);
  transition: all 0.3s ease;
}

.btn-cyber:hover::after {
  width: 200px;
  height: 200px;
}

/* Glassmorphism Form Styles */
.form-group {
  margin-bottom: 24px;
}

.form-label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: var(--text-primary);
  font-size: 14px;
}

.form-control {
  width: 100%;
  padding: 16px 20px;
  border: 1px solid var(--glass-border);
  border-radius: 16px;
  font-size: 14px;
  background: var(--glass-bg);
  color: var(--text-primary);
  backdrop-filter: var(--glass-backdrop);
  -webkit-backdrop-filter: var(--glass-backdrop);
  transition: all 0.3s ease;
}

.form-control::placeholder {
  color: var(--text-muted);
}

.form-control:focus {
  outline: none;
  border-color: rgba(255, 255, 255, 0.4);
  box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.15);
}

/* Glassmorphism Card Styles */
.card {
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: 20px;
  box-shadow: var(--glass-shadow);
  padding: 24px;
  margin-bottom: 24px;
  backdrop-filter: var(--glass-backdrop);
  -webkit-backdrop-filter: var(--glass-backdrop);
  transition: all 0.3s ease;
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 16px 48px rgba(31, 38, 135, 0.5);
}

/* Cyberpunk Card Styles */
.card-cyber {
  background: rgba(10, 10, 10, 0.8);
  border: 1px solid var(--cyber-primary);
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(0, 255, 255, 0.2), inset 0 1px 0 rgba(0, 255, 255, 0.1);
  padding: 24px;
  margin-bottom: 24px;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.card-cyber::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(45deg, transparent 30%, rgba(0, 255, 255, 0.05) 50%, transparent 70%);
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: 1;
}

.card-cyber:hover::before {
  opacity: 1;
}

.card-cyber::after {
  content: '';
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  background: linear-gradient(45deg, var(--cyber-primary), var(--cyber-secondary), var(--cyber-accent), var(--cyber-primary));
  border-radius: 22px;
  z-index: -1;
  opacity: 0;
  transition: opacity 0.3s ease;
  animation: cyberScan 3s linear infinite;
}

.card-cyber:hover::after {
  opacity: 1;
}

.card-cyber:hover {
  transform: translateY(-6px) scale(1.02);
  box-shadow: 0 20px 60px rgba(0, 255, 255, 0.3), 0 0 40px rgba(0, 255, 255, 0.2);
  animation: cyberFloat 4s ease-in-out infinite;
}

/* Glassmorphism Alert Styles */
.alert {
  padding: 20px;
  border-radius: 16px;
  margin-bottom: 24px;
  backdrop-filter: var(--glass-backdrop);
  -webkit-backdrop-filter: var(--glass-backdrop);
  border: 1px solid var(--glass-border);
}

.alert-success {
  background: rgba(81, 207, 102, 0.2);
  color: #51cf66;
  border-color: rgba(81, 207, 102, 0.3);
}

.alert-error {
  background: rgba(255, 107, 107, 0.2);
  color: #ff6b6b;
  border-color: rgba(255, 107, 107, 0.3);
}

/* Utility Classes */
.text-center {
  text-align: center;
}

.mb-3 {
  margin-bottom: 1rem;
}

.mt-3 {
  margin-top: 1rem;
}

/* Responsive Design */
@media (max-width: 768px) {
  .container {
    padding: 0 16px;
  }
  
  .btn {
    padding: 10px 20px;
    font-size: 13px;
  }
  
  .form-control {
    padding: 14px 16px;
  }
  
  .card {
    padding: 20px;
    border-radius: 16px;
  }
}
</style>