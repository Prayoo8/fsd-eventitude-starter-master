<template>
  <div class="hacker-typing">
    <div class="typing-text">
      <span 
        v-for="(char, index) in displayText" 
        :key="index"
        class="typing-char"
        :style="{ animationDelay: (index * 0.05) + 's' }"
      >
        {{ char }}
      </span>
      <span class="cursor" :class="{ 'blinking': showCursor }">|</span>
    </div>
    <div class="hacker-lines">
      <div class="line" v-for="n in 3" :key="n" :style="{ animationDelay: (n * 0.5) + 's' }"></div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue'

export default {
  name: 'HackerTyping',
  props: {
    text: {
      type: String,
      default: 'ACCESS GRANTED'
    },
    speed: {
      type: Number,
      default: 100
    }
  },
  setup(props) {
    const displayText = ref('')
    const showCursor = ref(true)
    let typingInterval = null
    let cursorInterval = null
    
    const startTyping = () => {
      let index = 0
      displayText.value = ''
      
      typingInterval = setInterval(() => {
        if (index < props.text.length) {
          displayText.value += props.text[index]
          index++
        } else {
          clearInterval(typingInterval)
          // Start cursor blinking
          cursorInterval = setInterval(() => {
            showCursor.value = !showCursor.value
          }, 500)
        }
      }, props.speed)
    }
    
    const resetTyping = () => {
      clearInterval(typingInterval)
      clearInterval(cursorInterval)
      displayText.value = ''
      showCursor.value = true
    }
    
    onMounted(() => {
      setTimeout(() => {
        startTyping()
      }, 1000)
    })
    
    onUnmounted(() => {
      clearInterval(typingInterval)
      clearInterval(cursorInterval)
    })
    
    return {
      displayText,
      showCursor
    }
  }
}
</script>

<style scoped>
.hacker-typing {
  position: relative;
  text-align: center;
  margin-bottom: 40px;
}

.typing-text {
  font-family: 'Courier New', monospace;
  font-size: 2rem;
  font-weight: bold;
  color: var(--cyber-primary);
  text-shadow: 0 0 10px var(--cyber-primary);
  margin-bottom: 20px;
  position: relative;
}

.typing-char {
  display: inline-block;
  animation: charGlow 0.1s ease-in-out;
}

.cursor {
  color: var(--cyber-primary);
  font-weight: bold;
  animation: cursorBlink 1s infinite;
}

.cursor.blinking {
  animation: cursorBlink 0.5s infinite;
}

.hacker-lines {
  position: relative;
  height: 2px;
  overflow: hidden;
}

.line {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background: linear-gradient(90deg, transparent, var(--cyber-primary), transparent);
  animation: lineScan 2s linear infinite;
}

.line:nth-child(2) {
  animation-delay: 0.5s;
  background: linear-gradient(90deg, transparent, var(--cyber-secondary), transparent);
}

.line:nth-child(3) {
  animation-delay: 1s;
  background: linear-gradient(90deg, transparent, var(--cyber-accent), transparent);
}

@keyframes charGlow {
  0% {
    text-shadow: 0 0 5px var(--cyber-primary);
    transform: scale(1);
  }
  50% {
    text-shadow: 0 0 20px var(--cyber-primary), 0 0 30px var(--cyber-primary);
    transform: scale(1.1);
  }
  100% {
    text-shadow: 0 0 10px var(--cyber-primary);
    transform: scale(1);
  }
}

@keyframes cursorBlink {
  0%, 50% {
    opacity: 1;
  }
  51%, 100% {
    opacity: 0;
  }
}

@keyframes lineScan {
  0% {
    transform: translateX(-100%);
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
  100% {
    transform: translateX(100%);
    opacity: 0;
  }
}

/* Responsive Design */
@media (max-width: 768px) {
  .typing-text {
    font-size: 1.5rem;
  }
}

@media (max-width: 480px) {
  .typing-text {
    font-size: 1.2rem;
  }
}
</style>
