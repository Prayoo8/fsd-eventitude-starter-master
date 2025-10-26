<template>
  <div class="login-page">
    <!-- Hacker-style Background Effects -->
    <MouseParticles />
    <NeonScanLines />
    
    <div class="container">
      <div class="login-container">
        <div class="card card-cyber">
          <!-- Hacker-style Typing Animation -->
          <!-- <HackerTyping text="SYSTEM ACCESS" /> -->
          <h2 class="cyber-title">SYSTEM ACCESS</h2>
          
          <div v-if="error" class="alert alert-error">
            {{ error }}
          </div>
          
          <form @submit.prevent="handleLogin">
            <div class="form-group">
              <label for="email" class="form-label cyber-label">
                <span class="label-text">USER_ID</span>
                <span class="label-indicator">></span>
              </label>
              <input
                id="email"
                v-model="form.email"
                type="email"
                class="form-control cyber-input"
                required
                placeholder="admin@system.local"
              />
            </div>
            
            <div class="form-group">
              <label for="password" class="form-label cyber-label">
                <span class="label-text">PASSWORD</span>
                <span class="label-indicator">></span>
              </label>
              <input
                id="password"
                v-model="form.password"
                type="password"
                class="form-control cyber-input"
                required
                placeholder="••••••••"
              />
            </div>
            
            <button 
              type="submit" 
              class="btn btn-cyber"
              :disabled="loading"
              style="width: 100%;"
            >
              <span class="btn-text">{{ loading ? 'AUTHENTICATING...' : 'ACCESS GRANTED' }}</span>
              <span class="btn-indicator">></span>
            </button>
          </form>
          
          <div class="text-center mt-3">
            <p class="cyber-text">
              <span class="text-indicator">></span>
              <span>New user? </span>
              <router-link to="/register" class="cyber-link">
                <span class="link-text">REGISTER</span>
                <span class="link-indicator">></span>
              </router-link>
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../store/auth'
import HackerTyping from '../components/HackerTyping.vue'
import MouseParticles from '../components/MouseParticles.vue'
import NeonScanLines from '../components/NeonScanLines.vue'

export default {
  name: 'Login',
  components: {
    HackerTyping,
    MouseParticles,
    NeonScanLines
  },
  setup() {
    const router = useRouter()
    const { login } = useAuth()
    
    const form = reactive({
      email: '',
      password: ''
    })
    
    const loading = ref(false)
    const error = ref('')
    
    const handleLogin = async () => {
      loading.value = true
      error.value = ''
      
      try {
        const result = await login(form)
        
        if (result.success) {
          router.push('/')
        } else {
          error.value = result.error
        }
      } catch (err) {
        error.value = 'Login failed, please try again'
      } finally {
        loading.value = false
      }
    }
    
    return {
      form,
      loading,
      error,
      handleLogin
    }
  }
}
</script>

<style scoped>
.login-page {
  min-height: calc(100vh - 80px);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.login-page::before {
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
  z-index: 0;
}

.login-container {
  width: 100%;
  max-width: 420px;
  position: relative;
  z-index: 1;
}

.card {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 24px;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  box-shadow: 0 8px 32px rgba(31, 38, 135, 0.37);
  padding: 48px 40px;
  position: relative;
  overflow: hidden;
}

.card-cyber {
  background: rgba(10, 10, 10, 0.9);
  border: 1px solid var(--cyber-primary);
  box-shadow: 
    0 8px 32px rgba(0, 255, 255, 0.3),
    inset 0 1px 0 rgba(0, 255, 255, 0.1);
  animation: cyberPulse 4s ease-in-out infinite;
}

.card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
  z-index: 0;
}

.card > * {
  position: relative;
  z-index: 1;
}

h2 {
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 40px;
  font-size: 2rem;
  font-weight: 700;
  text-align: center;
  background: linear-gradient(135deg, #ffffff 0%, #f0f0f0 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.form-group {
  margin-bottom: 28px;
}

.form-label {
  display: block;
  margin-bottom: 12px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  font-size: 15px;
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
  transition: all 0.3s ease;
}

.form-control::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.form-control:focus {
  outline: none;
  border-color: rgba(255, 255, 255, 0.4);
  box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.15);
}

/* Hacker-style Form Styles */
.cyber-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: 'Courier New', monospace;
  font-weight: bold;
  color: var(--cyber-primary);
  text-shadow: 0 0 5px var(--cyber-primary);
}

.label-text {
  font-size: 14px;
  letter-spacing: 1px;
}

.label-indicator {
  color: var(--cyber-secondary);
  font-weight: bold;
  animation: cyberBlink 1s infinite;
}

.cyber-input {
  font-family: 'Courier New', monospace;
  background: rgba(0, 0, 0, 0.8);
  border: 1px solid var(--cyber-primary);
  color: var(--cyber-primary);
  box-shadow: 
    0 0 10px rgba(0, 255, 255, 0.2),
    inset 0 1px 0 rgba(0, 255, 255, 0.1);
}

.cyber-input:focus {
  border-color: var(--cyber-secondary);
  box-shadow: 
    0 0 20px rgba(0, 255, 255, 0.4),
    0 0 0 3px rgba(255, 0, 128, 0.2),
    inset 0 1px 0 rgba(0, 255, 255, 0.2);
  background: rgba(0, 0, 0, 0.9);
}

.cyber-input::placeholder {
  color: rgba(0, 255, 255, 0.5);
  font-style: italic;
}

.btn {
  padding: 16px 32px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 16px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
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
}

.btn:hover::before {
  left: 100%;
}

.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.6);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

.text-center {
  text-align: center;
  margin-top: 32px;
}

.text-center p {
  color: rgba(255, 255, 255, 0.7);
  font-size: 15px;
}

.text-center a {
  color: rgba(255, 255, 255, 0.9);
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s ease;
  position: relative;
}

.text-center a::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 0;
  height: 2px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  transition: width 0.3s ease;
}

.text-center a:hover::after {
  width: 100%;
}

.text-center a:hover {
  color: rgba(255, 255, 255, 1);
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
}

/* Hacker-style Button Styles */
.btn-cyber {
  font-family: 'Courier New', monospace;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  background: linear-gradient(135deg, var(--cyber-primary) 0%, var(--cyber-secondary) 100%);
  border: 1px solid var(--cyber-primary);
  color: var(--cyber-dark);
  font-weight: bold;
  letter-spacing: 1px;
  text-transform: uppercase;
  box-shadow: 
    0 0 20px rgba(0, 255, 255, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  position: relative;
  overflow: hidden;
}

.btn-cyber::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transition: left 0.6s ease;
}

.btn-cyber:hover::before {
  left: 100%;
}

.btn-cyber:hover {
  transform: translateY(-2px);
  box-shadow: 
    0 0 30px var(--cyber-primary),
    0 0 60px var(--cyber-primary),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
  animation: cyberGlow 1s ease-in-out infinite;
}

.btn-text {
  font-size: 14px;
  letter-spacing: 2px;
}

.btn-indicator {
  color: var(--cyber-dark);
  font-weight: bold;
  animation: cyberBlink 1s infinite;
}

/* Hacker-style Title Styles */
.cyber-title {
  text-align: center;
  font-size: 2.5rem;
  font-weight: 700;
  background: linear-gradient(45deg, var(--cyber-primary), var(--cyber-secondary), var(--cyber-accent));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 0 0 30px rgba(0, 255, 255, 0.5);
  margin-bottom: 2rem;
  position: relative;
  animation: cyberPulse 3s ease-in-out infinite;
}

.cyber-title::before {
  content: '';
  position: absolute;
  top: -10px;
  left: -10px;
  right: -10px;
  bottom: -10px;
  background: linear-gradient(45deg, var(--cyber-primary), var(--cyber-secondary), var(--cyber-accent));
  border-radius: 10px;
  opacity: 0.1;
  z-index: -1;
  animation: cyberGlow 2s ease-in-out infinite alternate;
}

/* Hacker-style Text Styles */
.cyber-text {
  font-family: 'Courier New', monospace;
  color: rgba(0, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 14px;
}

.text-indicator {
  color: var(--cyber-secondary);
  animation: cyberBlink 1s infinite;
}

.cyber-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--cyber-primary);
  text-decoration: none;
  font-weight: bold;
  transition: all 0.3s ease;
}

.cyber-link:hover {
  color: var(--cyber-secondary);
  text-shadow: 0 0 10px var(--cyber-secondary);
}

.link-text {
  font-size: 14px;
  letter-spacing: 1px;
}

.link-indicator {
  color: var(--cyber-secondary);
  animation: cyberBlink 1s infinite;
}

/* Hacker-style Animations */
@keyframes cyberBlink {
  0%, 50% {
    opacity: 1;
  }
  51%, 100% {
    opacity: 0;
  }
}

/* Responsive Design */
@media (max-width: 480px) {
  .login-container {
    max-width: 90%;
    padding: 0 20px;
  }
  
  .card {
    padding: 32px 24px;
    border-radius: 20px;
  }
  
  h2 {
    font-size: 1.6rem;
    margin-bottom: 32px;
  }
  
  .form-control {
    padding: 14px 16px;
    font-size: 15px;
  }
  
  .btn {
    padding: 14px 28px;
    font-size: 15px;
  }
}
</style>
