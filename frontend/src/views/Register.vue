<template>
  <div class="register-page">
    <div class="container">
      <div class="register-container">
        <div class="card">
          <h2 class="text-center mb-3">Register</h2>
          
          <div v-if="error" class="alert alert-error">
            {{ error }}
          </div>
          
          <div v-if="success" class="alert alert-success">
            Registration successful! Please login to your account.
          </div>
          
          <form @submit.prevent="handleRegister">
            <div class="form-group">
              <label for="first_name" class="form-label">First Name</label>
              <input
                id="first_name"
                v-model="form.first_name"
                type="text"
                class="form-control"
                required
                placeholder="Enter your first name"
              />
            </div>
            
            <div class="form-group">
              <label for="last_name" class="form-label">Last Name</label>
              <input
                id="last_name"
                v-model="form.last_name"
                type="text"
                class="form-control"
                required
                placeholder="Enter your last name"
              />
            </div>
            
            <div class="form-group">
              <label for="email" class="form-label">Email</label>
              <input
                id="email"
                v-model="form.email"
                type="email"
                class="form-control"
                required
                placeholder="Enter your email"
              />
            </div>
            
            <div class="form-group">
              <label for="password" class="form-label">Password</label>
              <input
                id="password"
                v-model="form.password"
                type="password"
                class="form-control"
                required
                placeholder="Enter your password"
              />
              <small class="form-text">
                Password must contain: 8-20 characters, at least one uppercase letter, one lowercase letter, one number and one special character
              </small>
            </div>
            
            <button 
              type="submit" 
              class="btn btn-primary"
              :disabled="loading"
              style="width: 100%;"
            >
              {{ loading ? 'Registering...' : 'Register' }}
            </button>
          </form>
          
          <div class="text-center mt-3">
            <p>Already have an account? <router-link to="/login">Login now</router-link></p>
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

export default {
  name: 'Register',
  setup() {
    const router = useRouter()
    const { register } = useAuth()
    
    const form = reactive({
      first_name: '',
      last_name: '',
      email: '',
      password: ''
    })
    
    const loading = ref(false)
    const error = ref('')
    const success = ref(false)
    
    const handleRegister = async () => {
      loading.value = true
      error.value = ''
      success.value = false
      
      try {
        const result = await register(form)
        
        if (result.success) {
          success.value = true
          // Redirect to login page after 3 seconds
          setTimeout(() => {
            router.push('/login')
          }, 3000)
        } else {
          error.value = result.error
        }
      } catch (err) {
        error.value = 'Registration failed, please try again'
      } finally {
        loading.value = false
      }
    }
    
    return {
      form,
      loading,
      error,
      success,
      handleRegister
    }
  }
}
</script>

<style scoped>
.register-page {
  min-height: calc(100vh - 80px);
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 40px 0;
}

.register-container {
  width: 100%;
  max-width: 450px;
}

.card {
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: 20px;
  box-shadow: var(--glass-shadow);
  padding: 40px;
  backdrop-filter: var(--glass-backdrop);
  -webkit-backdrop-filter: var(--glass-backdrop);
  transition: all 0.3s ease;
}

h2 {
  color: var(--text-primary);
  margin-bottom: 30px;
}

.form-group {
  margin-bottom: 25px;
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

.form-text {
  display: block;
  margin-top: 5px;
  font-size: 12px;
  color: var(--text-muted);
}

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

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.text-center {
  text-align: center;
}

.text-center a {
  color: var(--text-primary);
  text-decoration: none;
  transition: all 0.3s ease;
}

.text-center a:hover {
  color: var(--text-secondary);
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
}
</style>
