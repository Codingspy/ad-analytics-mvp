<template>
  <div class="container">
    <h1>📊 Ad Analytics MVP</h1>
    <button @click="sendEvent">Send Dummy Click Event</button>
    <p v-if="message">{{ message }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'

const message = ref('')

const sendEvent = async () => {
  try {
    const res = await axios.post('http://localhost:5000/event', {
      type: 'click',
      metadata: {
        adId: 'abc123',
        userId: 'user456'
      }
    })
    message.value = res.data.message
  } catch (err) {
    console.error(err)
    message.value = '❌ Error sending event'
  }
}
</script>

<style scoped>
.container {
  text-align: center;
  margin-top: 50px;
}
button {
  padding: 10px 20px;
  font-size: 16px;
}
</style>
