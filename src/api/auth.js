import axios from 'axios'

const AUTH_BASE_URL = import.meta.env.VITE_AUTH_BASE_URL

export const authenticateUser = async () => {
  try {
    const response = await axios.post(`${AUTH_BASE_URL}Account/Authenticate`, {
      username: "athena.icpl",
      password: "Athena2022"
    })
    
    const { ApiKey: token } = response.data
    
    // Store token in localStorage and .env for subsequent sessions
    localStorage.setItem('atss_token', token)
    localStorage.setItem('atss_account', JSON.stringify(response.data))
    
    return token
  } catch (error) {
    throw new Error(error.response?.data || 'Authentication failed')
  }
}