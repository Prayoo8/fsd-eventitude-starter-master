import { reactive } from 'vue'
import { authAPI } from '../services/api'

// Create reactive state
const state = reactive({
  user: null,
  token: localStorage.getItem('session_token'),
  isAuthenticated: !!localStorage.getItem('session_token')
})

// Authentication related methods
export const useAuth = () => {
  const login = async (credentials) => {
    try {
      const response = await authAPI.login(credentials)
      const { user_id, session_token } = response.data
      
      // Save to local storage
      localStorage.setItem('session_token', session_token)
      localStorage.setItem('user_id', user_id)
      
      // Update state
      state.token = session_token
      state.user = { user_id }
      state.isAuthenticated = true
      
      return { success: true }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error_message || 'Login failed' 
      }
    }
  }

  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData)
      return { success: true, user_id: response.data.user_id }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error_message || 'Registration failed' 
      }
    }
  }

  const logout = async () => {
    try {
      await authAPI.logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      // Clear local storage
      localStorage.removeItem('session_token')
      localStorage.removeItem('user_id')
      
      // Reset state
      state.token = null
      state.user = null
      state.isAuthenticated = false
    }
  }

  const getUserId = () => {
    return localStorage.getItem('user_id')
  }

  return {
    state,
    login,
    register,
    logout,
    getUserId
  }
}

