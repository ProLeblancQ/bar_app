// src/main.ts
import { createApp } from 'vue'
import App from './App.vue'
import router from './router' // Votre routeur existant
import { createPinia } from 'pinia' // <-- NOUVEAU : Importez createPinia

const app = createApp(App)
const pinia = createPinia() 

app.use(pinia) 
app.use(router)

app.mount('#app')