<template>
  <div class="cyber-particles">
    <!-- Main Particles -->
    <div 
      v-for="particle in particles" 
      :key="particle.id"
      class="particle"
      :class="particle.type"
      :style="{
        left: particle.x + '%',
        top: particle.y + '%',
        animationDelay: particle.delay + 's',
        animationDuration: particle.duration + 's',
        '--particle-color': particle.color,
        '--particle-size': particle.size + 'px'
      }"
    >
      <div class="particle-core"></div>
      <div class="particle-aura"></div>
    </div>
    
    <!-- Connection Network -->
    <svg class="particle-network" viewBox="0 0 100 100" preserveAspectRatio="none">
      <defs>
        <linearGradient id="networkGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" :style="`stop-color:var(--cyber-primary);stop-opacity:0.6`" />
          <stop offset="50%" :style="`stop-color:var(--cyber-secondary);stop-opacity:0.4`" />
          <stop offset="100%" :style="`stop-color:var(--cyber-accent);stop-opacity:0.2`" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge> 
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      <line
        v-for="connection in connections"
        :key="`${connection.from}-${connection.to}`"
        :x1="connection.x1"
        :y1="connection.y1"
        :x2="connection.x2"
        :y2="connection.y2"
        stroke="url(#networkGradient)"
        stroke-width="0.3"
        opacity="0.4"
        class="network-line"
        filter="url(#glow)"
      />
    </svg>
    
    <!-- Energy Ripples -->
    <div v-for="n in 3" :key="`wave-${n}`" class="energy-wave" :style="getWaveStyle(n)"></div>
    
    <!-- Scan Line -->
    <div class="scan-line"></div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'

export default {
  name: 'CyberParticles',
  setup() {
    const particles = ref([])
    const connections = ref([])
    
    const colors = [
      'var(--cyber-primary)',
      'var(--cyber-secondary)', 
      'var(--cyber-accent)',
      'var(--cyber-warning)'
    ]
    
    const particleTypes = ['primary', 'secondary', 'accent', 'energy']
    
    const createParticles = () => {
      const particleCount = 25
      const newParticles = []
      
      for (let i = 0; i < particleCount; i++) {
        const type = particleTypes[Math.floor(Math.random() * particleTypes.length)]
        const color = colors[Math.floor(Math.random() * colors.length)]
        
        newParticles.push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          delay: Math.random() * 15,
          duration: 20 + Math.random() * 15,
          type: type,
          color: color,
          size: 2 + Math.random() * 4,
          speed: 0.5 + Math.random() * 1.5
        })
      }
      
      particles.value = newParticles
      createConnections()
    }
    
    const createConnections = () => {
      const newConnections = []
      const maxDistance = 30
      
      for (let i = 0; i < particles.value.length; i++) {
        for (let j = i + 1; j < particles.value.length; j++) {
          const p1 = particles.value[i]
          const p2 = particles.value[j]
          const distance = Math.sqrt(
            Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2)
          )
          
          if (distance < maxDistance && Math.random() > 0.7) {
            newConnections.push({
              from: i,
              to: j,
              x1: p1.x,
              y1: p1.y,
              x2: p2.x,
              y2: p2.y
            })
          }
        }
      }
      
      connections.value = newConnections
    }
    
    const getWaveStyle = (n) => {
      return {
        animationDelay: (n * 2) + 's',
        animationDuration: (8 + n * 2) + 's'
      }
    }
    
    onMounted(() => {
      createParticles()
      
      // Regularly update connections
      setInterval(() => {
        createConnections()
      }, 5000)
    })
    
    return {
      particles,
      connections,
      getWaveStyle
    }
  }
}
</script>

<style scoped>
.cyber-particles {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: -1;
  overflow: hidden;
}

/* Particle Main */
.particle {
  position: absolute;
  width: var(--particle-size);
  height: var(--particle-size);
  animation: particleFloat ease-in-out infinite;
}

.particle-core {
  width: 100%;
  height: 100%;
  background: var(--particle-color);
  border-radius: 50%;
  position: relative;
  z-index: 2;
  box-shadow: 
    0 0 8px var(--particle-color),
    0 0 16px var(--particle-color),
    0 0 24px var(--particle-color);
  animation: corePulse 2s ease-in-out infinite alternate;
}

.particle-aura {
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(
    circle,
    var(--particle-color) 0%,
    transparent 70%
  );
  border-radius: 50%;
  opacity: 0.3;
  animation: auraRotate 4s linear infinite;
}

/* Special effects for different particle types */
.particle.primary .particle-core {
  background: var(--cyber-primary);
  box-shadow: 
    0 0 10px var(--cyber-primary),
    0 0 20px var(--cyber-primary),
    0 0 30px var(--cyber-primary);
}

.particle.secondary .particle-core {
  background: var(--cyber-secondary);
  box-shadow: 
    0 0 10px var(--cyber-secondary),
    0 0 20px var(--cyber-secondary),
    0 0 30px var(--cyber-secondary);
}

.particle.accent .particle-core {
  background: var(--cyber-accent);
  box-shadow: 
    0 0 10px var(--cyber-accent),
    0 0 20px var(--cyber-accent),
    0 0 30px var(--cyber-accent);
}

.particle.energy .particle-core {
  background: var(--cyber-warning);
  box-shadow: 
    0 0 15px var(--cyber-warning),
    0 0 30px var(--cyber-warning),
    0 0 45px var(--cyber-warning);
  animation: energyPulse 1.5s ease-in-out infinite alternate;
}

/* Network Connection Lines */
.particle-network {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}

.network-line {
  stroke-dasharray: 2, 2;
  animation: networkFlow 3s linear infinite;
}

/* Energy Ripples */
.energy-wave {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 100px;
  height: 100px;
  border: 2px solid var(--cyber-primary);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  opacity: 0;
  animation: waveExpand ease-out infinite;
}

.energy-wave:nth-child(2) {
  border-color: var(--cyber-secondary);
  animation-delay: 1s;
}

.energy-wave:nth-child(3) {
  border-color: var(--cyber-accent);
  animation-delay: 2s;
}

/* Scan Line */
.scan-line {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 2px;
  background: linear-gradient(
    90deg,
    transparent 0%,
    var(--cyber-primary) 50%,
    transparent 100%
  );
  box-shadow: 0 0 10px var(--cyber-primary);
  animation: scanMove 8s linear infinite;
}

/* Animation Definitions */
@keyframes particleFloat {
  0% {
    transform: translateY(100vh) translateX(0) scale(0) rotate(0deg);
    opacity: 0;
  }
  10% {
    opacity: 1;
    transform: translateY(90vh) translateX(20px) scale(1) rotate(36deg);
  }
  25% {
    transform: translateY(75vh) translateX(-15px) scale(1.2) rotate(90deg);
  }
  50% {
    transform: translateY(50vh) translateX(30px) scale(0.8) rotate(180deg);
  }
  75% {
    transform: translateY(25vh) translateX(-20px) scale(1.1) rotate(270deg);
  }
  90% {
    opacity: 1;
    transform: translateY(10vh) translateX(10px) scale(1) rotate(324deg);
  }
  100% {
    transform: translateY(-10vh) translateX(0) scale(0) rotate(360deg);
    opacity: 0;
  }
}

@keyframes corePulse {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  100% {
    transform: scale(1.3);
    opacity: 0.7;
  }
}

@keyframes energyPulse {
  0% {
    transform: scale(1);
    box-shadow: 
      0 0 15px var(--cyber-warning),
      0 0 30px var(--cyber-warning),
      0 0 45px var(--cyber-warning);
  }
  100% {
    transform: scale(1.5);
    box-shadow: 
      0 0 25px var(--cyber-warning),
      0 0 50px var(--cyber-warning),
      0 0 75px var(--cyber-warning);
  }
}

@keyframes auraRotate {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@keyframes networkFlow {
  0% {
    stroke-dashoffset: 0;
  }
  100% {
    stroke-dashoffset: 8;
  }
}

@keyframes waveExpand {
  0% {
    width: 50px;
    height: 50px;
    opacity: 0.8;
  }
  100% {
    width: 500px;
    height: 500px;
    opacity: 0;
  }
}

@keyframes scanMove {
  0% {
    left: -100%;
  }
  100% {
    left: 100%;
  }
}

/* Responsive Adjustments */
@media (max-width: 768px) {
  .particle {
    --particle-size: 1px;
  }
  
  .energy-wave {
    width: 50px;
    height: 50px;
  }
  
  @keyframes waveExpand {
    0% {
      width: 25px;
      height: 25px;
      opacity: 0.8;
    }
    100% {
      width: 250px;
      height: 250px;
      opacity: 0;
    }
  }
}
</style>
