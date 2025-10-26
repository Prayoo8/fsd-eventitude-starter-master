<template>
  <div class="energy-flow">
    <div
      v-for="flow in energyFlows"
      :key="flow.id"
      class="energy-line"
      :style="{
        left: flow.startX + '%',
        top: flow.startY + '%',
        width: flow.length + '%',
        animationDelay: flow.delay + 's',
        animationDuration: flow.duration + 's'
      }"
    />
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'

export default {
  name: 'EnergyFlow',
  setup() {
    const energyFlows = ref([])
    
    const createEnergyFlows = () => {
      const flowCount = 8
      const newFlows = []
      
      for (let i = 0; i < flowCount; i++) {
        newFlows.push({
          id: i,
          startX: Math.random() * 80,
          startY: Math.random() * 80,
          length: 20 + Math.random() * 30,
          duration: 3 + Math.random() * 4,
          delay: Math.random() * 2
        })
      }
      
      energyFlows.value = newFlows
    }
    
    onMounted(() => {
      createEnergyFlows()
      
      // Regularly recreate energy flows
      setInterval(() => {
        createEnergyFlows()
      }, 10000)
    })
    
    return {
      energyFlows
    }
  }
}
</script>

<style scoped>
.energy-flow {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;
}

.energy-line {
  position: absolute;
  height: 2px;
  background: linear-gradient(
    90deg,
    transparent 0%,
    var(--cyber-primary) 20%,
    var(--cyber-secondary) 50%,
    var(--cyber-accent) 80%,
    transparent 100%
  );
  box-shadow: 
    0 0 10px var(--cyber-primary),
    0 0 20px var(--cyber-primary);
  transform-origin: left center;
  border-radius: 1px;
  animation: energyFlow linear infinite;
}

@keyframes energyFlow {
  0% {
    opacity: 0;
    transform: scaleX(0) rotate(0deg);
  }
  20% {
    opacity: 1;
    transform: scaleX(1) rotate(72deg);
  }
  80% {
    opacity: 1;
    transform: scaleX(1) rotate(288deg);
  }
  100% {
    opacity: 0;
    transform: scaleX(0) rotate(360deg);
  }
}

.energy-line:nth-child(odd) {
  background: linear-gradient(
    90deg,
    transparent 0%,
    var(--cyber-secondary) 20%,
    var(--cyber-warning) 50%,
    var(--cyber-secondary) 80%,
    transparent 100%
  );
  box-shadow: 
    0 0 10px var(--cyber-secondary),
    0 0 20px var(--cyber-secondary);
}

.energy-line:nth-child(3n) {
  background: linear-gradient(
    90deg,
    transparent 0%,
    var(--cyber-accent) 20%,
    var(--cyber-primary) 50%,
    var(--cyber-accent) 80%,
    transparent 100%
  );
  box-shadow: 
    0 0 10px var(--cyber-accent),
    0 0 20px var(--cyber-accent);
}

/* Responsive Adjustments */
@media (max-width: 768px) {
  .energy-line {
    height: 1px;
  }
}
</style>
