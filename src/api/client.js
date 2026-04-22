import axios from 'axios'

function getSubdomain() {
  const hostname = window.location.hostname
  if (hostname === 'localhost' || /^\d+\.\d+\.\d+\.\d+$/.test(hostname)) {
    return import.meta.env.VITE_TENANT || null
  }
  const parts = hostname.split('.')
  if (parts.length >= 3 && !['www', 'api'].includes(parts[0])) {
    return parts[0]
  }
  return null
}

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://api.paabyonetim.com',
})

client.interceptors.request.use(config => {
  const token = localStorage.getItem('paab_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  const subdomain = getSubdomain()
  if (subdomain) config.headers['X-Tenant'] = subdomain
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

export { getSubdomain }
export default client
