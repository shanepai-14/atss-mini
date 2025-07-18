import React, { useState, useEffect, useRef } from 'react'
import {
  Container,
  AppBar,
  Toolbar,
  Box,
  Alert,
  Chip,
  useTheme,
  useMediaQuery
} from '@mui/material'
import { Refresh as RefreshIcon, Wifi as WifiIcon } from '@mui/icons-material'
import PlantSelector from '../components/PlantSelector'
import QueueTable from '../components/QueueTable'
import VehicleLegend from '../components/VehicleLegend'
import { useVehicleQueue } from '../hooks/useVehicleQueue'
import PWAInstallButton from '../components/PWAInstallButton';


const Dashboard = () => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const [selectedPlant, setSelectedPlant] = useState(null)
  const [currentDriverVehicle, setCurrentDriverVehicle] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
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
    if (!selectedPlant?.ZoneID && !selectedPlant?.ID) return

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
  }, [selectedPlant?.ZoneID, selectedPlant?.ID, refresh])

  const isRecentUpdate = lastUpdate && 
    (Date.now() - lastUpdate.getTime()) < 60000 // Within last minute

  const handlePlantChange = (plant) => {
    setSelectedPlant(plant)
  }

  const handleSearchChange = (value) => {
    setSearchTerm(value)
  }

  return (
    <Box sx={{ flexGrow: 1, bgcolor: '#f5f5f5', height: '100%' }}>
      {/* Header */}
      <AppBar 
        position="static" 
        elevation={0}
        sx={{ 
          backgroundColor: 'background.paper',
          color: 'text.primary',
          boxShadow: '0px 2px 4px -1px rgba(0,0,0,0.2), 0px 4px 5px 0px rgba(0,0,0,0.14), 0px 1px 10px 0px rgba(0,0,0,0.12)'
        }}
      >
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <PlantSelector 
            selectedPlant={selectedPlant}
            onPlantChange={handlePlantChange}
          />
          <Box>
          
           <PWAInstallButton variant="button" />
          
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
          </Box>
           
          
          {/* Manual refresh button */}
          {/* <Button
            color="inherit"
            onClick={refresh}
            disabled={loading}
            startIcon={<RefreshIcon />}
            size={isMobile ? 'small' : 'medium'}
          >
            {isMobile ? '' : 'Refresh'}
          </Button> */}
        </Toolbar>
      </AppBar>

      <Container maxWidth="xxl" sx={{ py: 2 }}>
     
        {/* Driver's Vehicle Alert */}
        {currentDriverVehicle && (
          <Alert severity="info" sx={{ mb: 2 }}>
            Your vehicle ({currentDriverVehicle}) is highlighted in the queue below.
          </Alert>
        )}

        {/* Legend and Search */}
        <VehicleLegend 
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
        />

        {/* Queue Table */}

            <QueueTable 
              vehicles={vehicles}
              loading={loading}
              currentDriverVehicle={currentDriverVehicle}
              searchTerm={searchTerm}
            />


     

        {/* Footer info */}
        {/* <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Typography variant="caption" color="textSecondary">
            Queue updates automatically every 30 seconds • Real-time updates via WebSocket
          </Typography>
        </Box> */}
      </Container>

           <PWAInstallButton 
              variant="banner"
              position="top-right"
              autoPromptDelay={2000}
            />

    </Box>
  )
}

   

export default Dashboard