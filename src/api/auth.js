// src/api/auth.js
import axios from 'axios'

const AUTH_BASE_URL = 'https://findplus.w-locate.com:8443/integration'


export const normalizeAccount = (account) => {
  const normalized = { ...account };

  // Handle UserIDEx
  if (normalized.UserIDEx) {
    const [prefix, rest] = normalized.UserIDEx.split(":");
    normalized.UserIDEx = `${
      prefix === "Default" ? "SGP" : prefix
    }${rest ? `:${rest}` : ""}`;
  }

  // Handle ServiceCode
  if (normalized.ServiceCode === "Default") {
    normalized.ServiceCode = "SGP";
  }

  // Handle RoleID -> Role
  const roleEnum = {
    0: "Superuser",
    1: "Operator",
    2: "CompanyAdmin",
    3: "DivisionAdmin",
    4: "GroupAdmin",
    5: "User",
    6: "Driver",
    7: "Customer",
  };

  if (normalized.RoleID !== undefined && roleEnum.hasOwnProperty(normalized.RoleID)) {
    normalized.Role = roleEnum[normalized.RoleID];
  }

  return normalized;
};



export const authenticateUser = async (credentials) => {
  try {
    const { data } = await axios.post(`${AUTH_BASE_URL}/Account/Authenticate`, credentials)

    // Normalize once
    const normalizedData = normalizeAccount(data)

    const { JwtToken, RefreshToken, ApiKey } = normalizedData

    // Store normalized data
    localStorage.setItem('atss_refresh_token', JSON.stringify(RefreshToken))
    localStorage.setItem('atss_token', JwtToken)

    return getAccountDetails(ApiKey);

  } catch (error) {
    throw new Error(error.response?.data?.message || 'Authentication failed')
  }
}

export const getAccountDetails = async (Key) => {
 try {
    const { data } = await axios.get(`${AUTH_BASE_URL}/Account`, {
      headers: {
        Token: Key,
      },
    })

    // Normalize once
    const normalizedData = normalizeAccount(data)

    const { ApiKey, ServiceCode,Role, ...userInfo } = normalizedData

    const authData = {
      ApiKey,
      ServiceCode,
      userInfo,
      loginTime: new Date().toISOString(),
    }

    // Store normalized data
    localStorage.setItem('atss_auth', JSON.stringify(authData))
    localStorage.setItem('atss_user_role', JSON.stringify(Role))
    localStorage.setItem('atss_account', JSON.stringify(normalizedData))

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
  localStorage.removeItem('atss_refresh_token')
  localStorage.removeItem('atss_account')
  localStorage.removeItem('atss_user_role')
  localStorage.removeItem('atss_settings')
}

export const getAuthData = () => {
  const authData = localStorage.getItem('atss_auth')
  return authData ? JSON.parse(authData) : null
}

export const getRole = () => {
  const role = localStorage.getItem('atss_user_role')
  return role ? JSON.parse(role) : null
}

export const isAuthenticated = () => {
  const authData = getAuthData()
  return authData 
}