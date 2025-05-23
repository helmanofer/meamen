import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './assets/tailwind.css'
import { setupAPI } from './config/apiSetup'

// Initialize API configuration
setupAPI()

const app =
 createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')