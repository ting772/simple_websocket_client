import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import handleError from './plugins/handleError'

const app = createApp(App)
app.use(router)
app.use(handleError, {})

app.mount('#app')
