// src/App.jsx
import React, { useEffect, useState } from 'react'
import { 
  createTheme, 
  CssBaseline, 
  ThemeProvider,
  Box,
  CircularProgress 
} from '@mui/material'
import {
  createBrowserRouter,
  RouterProvider,
  Navigate
} from "react-router-dom"
import './App.css'

import { isAuthenticated } from './api/auth'
import Login from './components/Login'
import Dashboard from './pages/Dashboard'

// Protected Route Component - Requires authentication
const ProtectedRoute = ({ children }) => {
  const [loading, setLoading] = useState(true)
  const [authenticated, setAuthenticated] = useState(false)

  useEffect(() => {
    const checkAuth = () => {
      const authStatus = isAuthenticated()
      setAuthenticated(authStatus)
      setLoading(false)

    }

    checkAuth()
  }, [])

  if (loading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    )
  }

  return authenticated ? children : <Navigate to="/vehicle-queue" replace />
}

// Public Route Component - Redirects to dashboard if already authenticated
const PublicRoute = ({ children }) => {
  const [loading, setLoading] = useState(true)
  const [authenticated, setAuthenticated] = useState(false)

  useEffect(() => {
    const checkAuth = () => {
      const authStatus = isAuthenticated()
      setAuthenticated(authStatus)
      setLoading(false)
    }

    checkAuth()
  }, [])

  if (loading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    )
  }

  return authenticated ? <Navigate to="/vehicle-queue/dashboard" replace /> : children
}

// Simple Routes Configuration
const routes = [
  // Public Routes - Redirect to dashboard if already authenticated
  {
    path: "/vehicle-queue/",
    element: (
      <PublicRoute>
        <Login />
      </PublicRoute>
    )
  },
  
  // Protected Routes - Require authentication
  {
    path: "/vehicle-queue/dashboard",
    element: (
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    )
  },
  
  // Catch all route - redirect to appropriate page
  {
    path: "*",
    element: <Navigate to="/vehicle-queue" replace />
  }
]

// Create router
const router = createBrowserRouter(routes)

// Theme configuration
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    error: {
      main: '#ff0000',
      dark: '#da0000',
      light: '#ff5436'
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff'
    }
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif'
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#1976d2'
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none'
        }
      }
    }
  }
})

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <RouterProvider router={router} />
    </ThemeProvider>
  )
}

export default App