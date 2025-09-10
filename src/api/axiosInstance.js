// src/api/axiosInstance.js - Updated with new auth system
import axios from 'axios'
import { getAuthData, refreshToken, logout } from './auth'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
const FINDPLUS_BASE_URL = 'https://findplus.w-locate.com:8443/integration'

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
    const authData = getAuthData()
    
    if (authData) {
      config.headers.Key = authData.ApiKey
      config.headers.Instance = authData.userInfo?.UserIDEx?.split(':')[0] || authData.ServiceCode
    }
    
    return config
  },
  (error) => Promise.reject(error)
)

// Request interceptor for FindPlus API
axiosFindPlusInstance.interceptors.request.use(
  (config) => {
    const authData = getAuthData()
    
    if (authData) {
      config.headers.Authorization = `Bearer ${authData.JWT}`
      config.headers.Token = authData.ApiKey
      config.headers.ApiKey = authData.ApiKey
      config.headers.Instance = authData.userInfo?.UserIDEx?.split(':')[0] || authData.ServiceCode
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
      await refreshToken()
      
      // Retry the original request
      const originalRequest = error.config
      if (!originalRequest._retry) {
        originalRequest._retry = true
        
        // Update the request headers with new token
        const authData = getAuthData()
        if (authData?.JWT) {
          originalRequest.headers.Authorization = `Bearer ${authData.JWT}`
          originalRequest.headers.Token = authData.JWT
          originalRequest.headers.Key = authData.JWT
        }
        
        return axios(originalRequest)
      }
    } catch (authError) {
      // Clear auth data and redirect to login
      logout()
      window.location.href = '/login'
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