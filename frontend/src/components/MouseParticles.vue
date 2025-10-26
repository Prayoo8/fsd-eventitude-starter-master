<template>
  <div class="mouse-particles" ref="particlesContainer">
    <div 
      v-for="particle in particles" 
      :key="particle.id"
      class="particle"
      :style="{
        left: particle.x + 'px',
        top: particle.y + 'px',
        animationDelay: particle.delay + 's',
        animationDuration: particle.duration + 's',
        transform: `translate(${particle.mouseOffsetX}px, ${particle.mouseOffsetY}px)`
      }"
    ></div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue'

export default {
  name: 'MouseParticles',
  setup() {
    const particles = ref([])
    const particlesContainer = ref(null)
    const mousePosition = ref({ x: 0, y: 0 })
    let mouseMoveHandler = null
    
    const createParticles = () => {
      const particleCount = 15
      const newParticles = []
      
      for (let i = 0; i < particleCount; i++) {
        newParticles.push({
          id: i,
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          delay: Math.random() * 5,
          duration: 8 + Math.random() * 4,
          mouseOffsetX: 0,
          mouseOffsetY: 0
        })
      }
      
      particles.value = newParticles
    }
    
    const handleMouseMove = (event) => {
      mousePosition.value = {
        x: event.clientX,
        y: event.clientY
      }
      
      // Update particle mouse offset
      particles.value.forEach((particle, index) => {
        const distance = Math.sqrt(
          Math.pow(particle.x - mousePosition.value.x, 2) + 
          Math.pow(particle.y - mousePosition.value.y, 2)
        )
        
        if (distance < 200) {
          const force = (200 - distance) / 200
          const angle = Math.atan2(
            particle.y - mousePosition.value.y,
            particle.x - mousePosition.value.x
          )
          
          particle.mouseOffsetX = Math.cos(angle) * force * 20
          particle.mouseOffsetY = Math.sin(angle) * force * 20
        } else {
          particle.mouseOffsetX = 0
          particle.mouseOffsetY = 0
        }
      })
    }
    
    onMounted(() => {
      createParticles()
      mouseMoveHandler = handleMouseMove
      window.addEventListener('mousemove', mouseMoveHandler)
      
      // Regularly recreate particles
      setInterval(() => {
        createParticles()
      }, 15000)
    })
    
    onUnmounted(() => {
      if (mouseMoveHandler) {
        window.removeEventListener('mousemove', mouseMoveHandler)
      }
    })
    
    return {
      particles,
      particlesContainer
    }
  }
}
</script>

<style scoped>
.mouse-particles {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;
}

.particle {
  position: absolute;
  width: 3px;
  height: 3px;
  background: var(--cyber-primary);
  border-radius: 50%;
  box-shadow: 
    0 0 6px var(--cyber-primary),
    0 0 12px var(--cyber-primary),
    0 0 18px var(--cyber-primary);
  animation: particleFloat linear infinite;
  transition: transform 0.3s ease-out;
}

.particle:nth-child(odd) {
  background: var(--cyber-secondary);
  box-shadow: 
    0 0 6px var(--cyber-secondary),
    0 0 12px var(--cyber-secondary),
    0 0 18px var(--cyber-secondary);
}

.particle:nth-child(3n) {
  background: var(--cyber-accent);
  box-shadow: 
    0 0 6px var(--cyber-accent),
    0 0 12px var(--cyber-accent),
    0 0 18px var(--cyber-accent);
}

.particle:nth-child(4n) {
  background: var(--cyber-warning);
  box-shadow: 
    0 0 6px var(--cyber-warning),
    0 0 12px var(--cyber-warning),
    0 0 18px var(--cyber-warning);
}

@keyframes particleFloat {
  0% {
    transform: translateY(100vh) translateX(0) scale(0) rotate(0deg);
    opacity: 0;
  }
  10% {
    opacity: 1;
    transform: translateY(90vh) translateX(10px) scale(1) rotate(45deg);
  }
  50% {
    transform: translateY(50vh) translateX(-5px) scale(1.2) rotate(180deg);
  }
  90% {
    opacity: 1;
    transform: translateY(10vh) translateX(5px) scale(1) rotate(315deg);
  }
  100% {
    transform: translateY(-10vh) translateX(0) scale(0) rotate(360deg);
    opacity: 0;
  }
}

/* Responsive Adjustments */
@media (max-width: 768px) {
  .particle {
    width: 2px;
    height: 2px;
  }
}
</style>
