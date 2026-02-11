import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/',
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
})

api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('token')
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status
    const url    = error.config?.url || ''
    const isAuthRoute = url.includes('/auth/')

    if (status === 401 && !isAuthRoute) {
      console.warn('[api] 401 sur', url, '— pas de redirection automatique')
      // Ne pas rediriger automatiquement — laisser les composants gérer
    }

    return Promise.reject(error)
  }
)

export default api