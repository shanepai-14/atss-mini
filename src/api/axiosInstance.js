import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
const FINDPLUS_BASE_URL = import.meta.env.VITE_AUTH_BASE_URL

// Create dedicated Axios instance for ATSS API
export const axiosATSSInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000
})

// Create dedicated Axios instance for FindPlus Integration API
export const axiosFindPlusInstance = axios.create({
  baseURL: FINDPLUS_BASE_URL,
  timeout: 10000
})

// Request interceptor for ATSS API
axiosATSSInstance.interceptors.request.use(
  (config) => {
    const account = JSON.parse(localStorage.getItem('atss_account') || '{}')
    
    if (account.ApiKey) {
      config.headers.Key = account.ApiKey
      config.headers.Instance = account.UserIDEx?.split(':')[0] || account.ServiceCode
    }
    
    return config
  },
  (error) => Promise.reject(error)
)

// Request interceptor for FindPlus API
axiosFindPlusInstance.interceptors.request.use(
  (config) => {
    const account = JSON.parse(localStorage.getItem('atss_account') || '{}')
    
    if (account.ApiKey) {
      config.headers.Token = account.ApiKey
      config.headers.Instance = account.UserIDEx?.split(':')[0] || account.ServiceCode
    }
    
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor to handle 401 and refresh token for both instances
const handleAuthError = async (error) => {
  if (error.response?.status === 401) {
    try {
      // Try to refresh token
      const { authenticateUser } = await import('./auth')
      await authenticateUser()
      
      // Retry the original request
      const originalRequest = error.config
      return error.config.__isRetryRequest ? Promise.reject(error) : axios(originalRequest)
    } catch (authError) {
      // Clear localStorage and reload page
      localStorage.removeItem('atss_token')
      localStorage.removeItem('atss_account')
      window.location.reload()
    }
  }
  
  return Promise.reject(error)
}

axiosATSSInstance.interceptors.response.use(
  (response) => response,
  handleAuthError
)

axiosFindPlusInstance.interceptors.response.use(
  (response) => response,
  handleAuthError
)
