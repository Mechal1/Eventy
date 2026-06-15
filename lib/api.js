import axios from 'axios'

const api = axios.create({
  baseURL: 'https://gatherevents-backend.vercel.app',
  headers: {
    'Content-Type': 'application/json',
    'gatherevents-api-key': 'gatherevents-api-key',
  },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default api