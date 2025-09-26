// src/pages/Dashboard.jsx
import React, { useState, useEffect, useRef } from 'react'
import {
  Container,
  AppBar,
  Toolbar,
  Box,
  Alert,
  Chip,
  useTheme,
  useMediaQuery,
  IconButton,
  Tooltip,
  Typography,
  Button
} from '@mui/material'
import { 
  Refresh as RefreshIcon, 
  Wifi as WifiIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  Business as BusinessIcon
} from '@mui/icons-material'
import PlantSelector from '../components/PlantSelector'
import QueueTable from '../components/QueueTable'
import VehicleLegend from '../components/VehicleLegend'
import SettingsPanel from '../components/SettingsPanel'
import { useVehicleQueue } from '../hooks/useVehicleQueue'
import { settingsManager } from '../utils/settingsManager'
import { logout, getAuthData , getRole } from '../api/auth'
import { useNavigate } from 'react-router-dom'
import PWAInstallButton from '../components/PWAInstallButton';

const Dashboard = () => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const navigate = useNavigate()
  const [selectedPlant, setSelectedPlant] = useState(null)
  const [currentDriverVehicle, setCurrentDriverVehicle] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [settings, setSettings] = useState({})
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [userInfo, setUserInfo] = useState(null)
  const autoRefreshIntervalRef = useRef(null)
  
  const { 
    vehicles, 
    loading, 
    error, 
    lastUpdate, 
    retry, 
    refresh 
  } = useVehicleQueue(selectedPlant)

  // Load user info and settings on mount
  useEffect(() => {
    const authData = getAuthData()
    if (authData) {
      setUserInfo(authData.userInfo)
      setCurrentDriverVehicle(authData.userInfo?.vehicle_number || null)
    }
    
    // Load initial settings
    const initialSettings = settingsManager.getSettings()
    setSettings(initialSettings)
  }, [])

  // Initialize factor scores when vehicles load
  useEffect(() => {
    if (vehicles && vehicles.length > 0) {
      settingsManager.initializeFactorScores(vehicles)
      const updatedSettings = settingsManager.getSettings()
      setSettings(updatedSettings)
    }
  }, [vehicles])

  // Auto-refresh every 30 seconds - only start when we have a plant selected
  useEffect(() => {
    if (!selectedPlant?.ZoneID && !selectedPlant?.ID) return

    if (autoRefreshIntervalRef.current) {
      clearInterval(autoRefreshIntervalRef.current)
    }

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
    (Date.now() - lastUpdate.getTime()) < 60000

  const handlePlantChange = (plant) => {
    setSelectedPlant(plant)
  }

  const handleSearchChange = (value) => {
    setSearchTerm(value)
  }

  const handleSettingsChange = (newSettings) => {
    setSettings(newSettings)
  }

  const handleLogout = () => {
    logout()
    navigate('/vehicle-queue')
  }

  const authData = getAuthData()
  const serviceCode = authData?.ServiceCode
  const companyID = authData?.userInfo.CompanyID;
  const isOperator = getRole() == "Operator";

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
            serviceCode={serviceCode}
            companyID={companyID}
          />
          
          
           <PWAInstallButton variant="button" />
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {/* Settings */}
                     {isOperator && (
            <Tooltip title="Display Settings">
              <IconButton onClick={() => setSettingsOpen(true)} color="inherit">
                <SettingsIcon />
              </IconButton>
            </Tooltip>
          )}
           

            {/* Connection Status */}
            <Chip
              icon={<WifiIcon />}
              label={isRecentUpdate ? 'Live' : 'Connecting...'}
              color={isRecentUpdate ? 'success' : 'warning'}
              size="small"
              variant="filled"
            />
            
            {/* Manual Refresh */}
            {/* <Tooltip title="Refresh Data">
              <IconButton onClick={refresh} color="inherit" disabled={loading}>
                <RefreshIcon />
              </IconButton>
            </Tooltip> */}
            
      
            {/* Logout */}
            <Tooltip title="Logout">
              <IconButton onClick={handleLogout} color="inherit">
                <LogoutIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xxl" sx={{ py: 3 }}>
        {/* Plant Selector */}
        {/* <Box sx={{ mb: 3 }}>
          <PlantSelector 
            selectedPlant={selectedPlant}
            onPlantChange={handlePlantChange}
          />
        </Box> */}

        {/* Error Display */}
        {/* {error && (
          <Alert 
            severity="error" 
            sx={{ mb: 3 }} 
            action={
              <Button color="inherit" size="small" onClick={retry}>
                Retry
              </Button>
            }
          >
            {error}
          </Alert>
        )} */}

        {/* Vehicle Legend */}
        {selectedPlant && (
          <VehicleLegend 
            searchTerm={searchTerm}
            onSearchChange={handleSearchChange}
            settings={settings}
          />
        )}

        {/* Queue Table */}
        {selectedPlant && (
          <QueueTable
            vehicles={vehicles}
            loading={loading}
            searchTerm={searchTerm}
            currentDriverVehicle={currentDriverVehicle}
            settings={settings}
            serviceCode={serviceCode}
          />
        )}

        {/* Welcome Message when no plant selected */}
        {!selectedPlant && !loading && (
          <Box 
            sx={{ 
              textAlign: 'center', 
              py: 8,
              color: 'text.secondary'
            }}
          >
            <BusinessIcon sx={{ fontSize: 64, mb: 2, opacity: 0.5 }} />
            <Typography variant="h5" gutterBottom>
              Welcome to Vehicle Queue For Drivers
            </Typography>
            <Typography variant="body1">
              Select a plant above to view the vehicle queue
            </Typography>
          </Box>
        )}
      </Container>

      {/* Settings Panel */}
      <SettingsPanel
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onSettingsChange={handleSettingsChange}
        vehicles={vehicles}
      />

      <PWAInstallButton 
              variant="banner"
              position="top-right"
              autoPromptDelay={2000}
            />
   
    </Box>
  )
}

export default Dashboard