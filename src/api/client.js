import axios from 'axios'

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://api.paabyonetim.com',
})

client.interceptors.request.use(config => {
  const token = localStorage.getItem('paab_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

client.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('paab_token')
      localStorage.removeItem('paab_user')
      window.location.reload()
    }
    return Promise.reject(err)
  }
)

export default client
