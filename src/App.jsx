import React, { useEffect, useState } from 'react'
import { Container, Box, Typography, CircularProgress, Alert } from '@mui/material'
import Dashboard from './pages/Dashboard'
import { authenticateUser } from './api/auth'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [authError, setAuthError] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initAuth = async () => {
      try {
        // Check if token exists in localStorage
        // const existingToken = localStorage.getItem('atss_token')
        // if (existingToken) {
        //   setIsAuthenticated(true)
        //   setLoading(false)
        //   return
        // }

        // Authenticate silently on first load
        await authenticateUser()
        setIsAuthenticated(true)
      } catch (error) {
        console.error('Authentication failed:', error)
        setAuthError(error.message)
      } finally {
        setLoading(false)
      }
    }

    initAuth()
  }, [])

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    )
  }

  if (authError) {
    return (
      <Container maxWidth="sm" sx={{ mt: 4 }}>
        <Alert severity="error">
          Authentication failed: {authError}
        </Alert>
      </Container>
    )
  }

  if (!isAuthenticated) {
    return (
      <Container maxWidth="sm" sx={{ mt: 4 }}>
        <Alert severity="warning">
          Please wait while we authenticate...
        </Alert>
      </Container>
    )
  }

  return <Dashboard />
}

export default App