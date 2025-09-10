// src/api/auth.js
import axios from 'axios'

const AUTH_BASE_URL = 'https://findplus.w-locate.com:8443/integration'

export const authenticateUser = async (credentials) => {
  try {
    const response = await axios.post(`${AUTH_BASE_URL}/Account/Authenticate`, credentials)
    
    const { JWT, RefreshToken, ApiKey, ServiceCode, ...userInfo } = response.data
    
    // Store all required data in localStorage
    const authData = {
      JWT,
      RefreshToken,
      ApiKey,
      ServiceCode,
      userInfo,
      loginTime: new Date().toISOString()
    }
    
    localStorage.setItem('atss_auth', JSON.stringify(authData))
    localStorage.setItem('atss_token', JWT)
    localStorage.setItem('atss_account', JSON.stringify(response.data))
    
    return authData
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Authentication failed')
  }
}

export const refreshToken = async () => {
  try {
    const authData = JSON.parse(localStorage.getItem('atss_auth') || '{}')
    if (!authData.RefreshToken) {
      throw new Error('No refresh token available')
    }

    const response = await axios.post(`${AUTH_BASE_URL}/Account/RefreshToken`, {
      refreshToken: authData.RefreshToken
    })

    const { JWT, RefreshToken: newRefreshToken , ApiKey } = response.data
    
    // Update stored data
    const updatedAuthData = {
      ...authData,
      ApiKey,
      JWT,
      RefreshToken: newRefreshToken,
      refreshTime: new Date().toISOString()
    }
    
    localStorage.setItem('atss_auth', JSON.stringify(updatedAuthData))
    localStorage.setItem('atss_token', JWT)
    
    return updatedAuthData
  } catch (error) {
    // Clear auth data on refresh failure
    localStorage.removeItem('atss_auth')
    localStorage.removeItem('atss_token')
    localStorage.removeItem('atss_account')
    throw new Error('Token refresh failed')
  }
}

export const logout = () => {
  localStorage.removeItem('atss_auth')
  localStorage.removeItem('atss_token')
  localStorage.removeItem('atss_account')
  localStorage.removeItem('atss_settings')
}

export const getAuthData = () => {
  const authData = localStorage.getItem('atss_auth')
  return authData ? JSON.parse(authData) : null
}

export const isAuthenticated = () => {
  const authData = getAuthData()
  return authData 
}