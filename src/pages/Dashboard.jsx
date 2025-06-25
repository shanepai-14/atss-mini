import React, { useState, useEffect, useRef } from 'react'
import {
  Container,
  AppBar,
  Toolbar,
  Typography,
  Box,
  Card,
  CardContent,
  Alert,
  Button,
  Chip,
  useTheme,
  useMediaQuery
} from '@mui/material'
import { Refresh as RefreshIcon, Wifi as WifiIcon } from '@mui/icons-material'
import PlantSelector from '../components/PlantSelector'
import QueueTable from '../components/QueueTable'
import { useVehicleQueue } from '../hooks/useVehicleQueue'

const Dashboard = () => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const [selectedPlant, setSelectedPlant] = useState(1)
  const [currentDriverVehicle, setCurrentDriverVehicle] = useState(null)
  const autoRefreshIntervalRef = useRef(null)
  
  const { 
    vehicles, 
    loading, 
    error, 
    lastUpdate, 
    retry, 
    refresh 
  } = useVehicleQueue(selectedPlant)

  // Get driver's vehicle number from stored account data (only once)
  useEffect(() => {
    const account = JSON.parse(localStorage.getItem('atss_account') || '{}')
    // This would typically come from driver profile or be set via login
    setCurrentDriverVehicle(account.vehicle_number || null)
  }, [])

  // Auto-refresh every 30 seconds - only start when we have a plant selected
  useEffect(() => {
    if (!selectedPlant?.ZoneID) return

    // Clear existing interval
    if (autoRefreshIntervalRef.current) {
      clearInterval(autoRefreshIntervalRef.current)
    }

    // Set up new interval
    autoRefreshIntervalRef.current = setInterval(() => {
      refresh()
    }, 30000)

    return () => {
      if (autoRefreshIntervalRef.current) {
        clearInterval(autoRefreshIntervalRef.current)
      }
    }
  }, [selectedPlant?.ZoneID, refresh])

  const isRecentUpdate = lastUpdate && 
    (Date.now() - lastUpdate.getTime()) < 60000 // Within last minute

  const handlePlantChange = (plant) => {
    setSelectedPlant(plant)
  }

  return (
    <Box sx={{ flexGrow: 1, bgcolor: '#f5f5f5', minHeight: '100vh' }}>
      {/* Header */}
      <AppBar position="sticky" elevation={1}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            ATSS Vehicle Queue
          </Typography>
          
          {/* Live indicator */}
          {isRecentUpdate && (
            <Chip 
              icon={<WifiIcon />}
              label="LIVE"
              color="success"
              size="small"
              sx={{ mr: 1 }}
            />
          )}
          
          {/* Manual refresh button */}
          <Button
            color="inherit"
            onClick={refresh}
            disabled={loading}
            startIcon={<RefreshIcon />}
            size={isMobile ? 'small' : 'medium'}
          >
            {isMobile ? '' : 'Refresh'}
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ py: 2 }}>
        {/* Controls */}
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Box 
              display="flex" 
              flexDirection={isMobile ? 'column' : 'row'}
              alignItems={isMobile ? 'stretch' : 'center'} 
              gap={2}
            >
              <PlantSelector 
                selectedPlant={selectedPlant}
                onPlantChange={handlePlantChange}
              />
              
              <Box flexGrow={1} />
              
              {lastUpdate && (
                <Typography variant="caption" color="textSecondary">
                  Last updated: {lastUpdate.toLocaleTimeString()}
                </Typography>
              )}
            </Box>
          </CardContent>
        </Card>

        {/* Error Alert */}
        {error && (
          <Alert 
            severity="error" 
            sx={{ mb: 2 }}
            action={
              <Button color="inherit" size="small" onClick={retry}>
                Retry
              </Button>
            }
          >
            {error}
          </Alert>
        )}

        {/* Driver's Vehicle Alert */}
        {currentDriverVehicle && (
          <Alert severity="info" sx={{ mb: 2 }}>
            Your vehicle ({currentDriverVehicle}) is highlighted in the queue below.
          </Alert>
        )}

        {/* Queue Table */}
        <Card>
          <CardContent sx={{ p: 0 }}>
            <QueueTable 
              vehicles={vehicles}
              loading={loading}
              currentDriverVehicle={currentDriverVehicle}
            />
          </CardContent>
        </Card>

        {/* Footer info */}
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Typography variant="caption" color="textSecondary">
            Queue updates automatically every 30 seconds • Real-time updates via WebSocket
          </Typography>
        </Box>
      </Container>
    </Box>
  )
}

export default Dashboard