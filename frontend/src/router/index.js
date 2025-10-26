import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
import EventList from '../views/EventList.vue'
import EventDetail from '../views/EventDetail.vue'
import CreateEvent from '../views/CreateEvent.vue'
import EditEvent from '../views/EditEvent.vue'
import MyEvents from '../views/MyEvents.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/register',
    name: 'Register',
    component: Register
  },
  {
    path: '/events',
    name: 'EventList',
    component: EventList
  },
  {
    path: '/events/:id',
    name: 'EventDetail',
    component: EventDetail,
    props: true
  },
  {
    path: '/events/create',
    name: 'CreateEvent',
    component: CreateEvent
  },
  {
    path: '/events/:id/edit',
    name: 'EditEvent',
    component: EditEvent,
    props: true
  },
  {
    path: '/my-events',
    name: 'MyEvents',
    component: MyEvents
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Route guard - check authentication status
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('session_token')
  const isAuthenticated = !!token
  
  // Routes that require authentication
  const protectedRoutes = ['CreateEvent', 'EditEvent', 'MyEvents']
  
  if (protectedRoutes.includes(to.name) && !isAuthenticated) {
    next('/login')
  } else if ((to.name === 'Login' || to.name === 'Register') && isAuthenticated) {
    next('/')
  } else {
    next()
  }
})

export default router

