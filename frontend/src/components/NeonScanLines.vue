<template>
  <div class="neon-scan-lines">
    <div 
      v-for="n in scanLineCount" 
      :key="n"
      class="scan-line"
      :style="{
        top: (n * (100 / scanLineCount)) + '%',
        animationDelay: (n * 0.1) + 's',
        animationDuration: (2 + Math.random() * 2) + 's'
      }"
    ></div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue'

export default {
  name: 'NeonScanLines',
  setup() {
    const scanLineCount = ref(8)
    let animationInterval = null
    
    const randomizeScanLines = () => {
      scanLineCount.value = 6 + Math.floor(Math.random() * 6)
    }
    
    onMounted(() => {
      animationInterval = setInterval(randomizeScanLines, 5000)
    })
    
    onUnmounted(() => {
      if (animationInterval) {
        clearInterval(animationInterval)
      }
    })
    
    return {
      scanLineCount
    }
  }
}
</script>

<style scoped>
.neon-scan-lines {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
  overflow: hidden;
}

.scan-line {
  position: absolute;
  left: 0;
  width: 100%;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent 0%,
    var(--cyber-primary) 20%,
    var(--cyber-secondary) 50%,
    var(--cyber-primary) 80%,
    transparent 100%
  );
  box-shadow: 
    0 0 10px var(--cyber-primary),
    0 0 20px var(--cyber-primary),
    0 0 30px var(--cyber-primary);
  animation: scanLineMove linear infinite;
  opacity: 0.8;
}

.scan-line:nth-child(odd) {
  background: linear-gradient(
    90deg,
    transparent 0%,
    var(--cyber-secondary) 20%,
    var(--cyber-accent) 50%,
    var(--cyber-secondary) 80%,
    transparent 100%
  );
  box-shadow: 
    0 0 10px var(--cyber-secondary),
    0 0 20px var(--cyber-secondary),
    0 0 30px var(--cyber-secondary);
}

.scan-line:nth-child(3n) {
  background: linear-gradient(
    90deg,
    transparent 0%,
    var(--cyber-accent) 20%,
    var(--cyber-warning) 50%,
    var(--cyber-accent) 80%,
    transparent 100%
  );
  box-shadow: 
    0 0 10px var(--cyber-accent),
    0 0 20px var(--cyber-accent),
    0 0 30px var(--cyber-accent);
}

@keyframes scanLineMove {
  0% {
    transform: translateX(-100%);
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    transform: translateX(100%);
    opacity: 0;
  }
}

/* Responsive Adjustments */
@media (max-width: 768px) {
  .scan-line {
    height: 0.5px;
  }
}
</style>
