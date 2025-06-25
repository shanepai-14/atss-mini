import React, { useState , useRef} from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Box,
  Typography,
  useTheme,
  useMediaQuery,
  Popover,
  Stack
} from '@mui/material'

const getVehicleStyle = (vehicle) => {
  let backgroundColor = '#808080'
  let borderStyle = {}
  
  if (vehicle.important) {
    backgroundColor = '#C00000'
  } else if (vehicle.status?.includes('Vehicle Breakdown')) {
    backgroundColor = '#404040'
  } else if (vehicle.score > 0 && vehicle.status !== "On-break") {
    backgroundColor = '#3C7D21'
  }
  
  if (vehicle.priority && vehicle?.compensated) {
    borderStyle = { 
      border: '3px solid #FFC000',
      color: '#FFC000'
    }
  } else if (vehicle.priority) {
    borderStyle = { 
      border: '3px solid #FFFF00',
      color: '#FFFF00'
    }
  } else {
    borderStyle = { 
      color: 'white'
    }
  }

  return { backgroundColor, ...borderStyle }
}

const parseDate = (date) => {
  if (!date) return 'N/A'
  const tempDate = new Date(date)
  tempDate.setHours(tempDate.getHours())
  const month = tempDate.toLocaleString('default', { month: 'short' })
  const day = tempDate.toLocaleString('default', { day: '2-digit' })
  const time = tempDate.toLocaleString('default', { timeStyle: 'short', hour12: false })
  return `${day}-${month}, ${time}`
}

const VehicleScores = ({ vehicle }) => {
  if (!vehicle || !vehicle.raw_score) return null
  
  const scores = ('permit_score' in vehicle && vehicle.permit_score)
    ? vehicle.permit_score
    : vehicle.raw_score

  const sortedScores = [...scores].sort((a, b) => a.priority - b.priority)

  return (
    <>
      {sortedScores.map((data, index) => (
        <Typography key={index} variant="body2">
          {parseFloat(data.score).toFixed(2)} - {data.name}
        </Typography>
      ))}
    </>
  )
}

const TooltipContent = ({ vehicle }) => (
  <Box p={2} maxWidth={300}>
    <Typography variant="body2">
      Queue #: {vehicle.rank || 'N/A'}
    </Typography>
    <Typography variant="body2">
      Available Since: {parseDate(vehicle.available_since)}
    </Typography>
    <Typography variant="body2">
      Load Qty: {vehicle.feedback_qty || 0}/{vehicle?.load_capacity || 0}
    </Typography>
    <Typography variant="body2" sx={{ mt: 1, mb: 1 }}>
      ---------------Factor Scores---------------
    </Typography>
    <VehicleScores vehicle={vehicle} />
  </Box>
)

const QueueTable = ({ vehicles, loading, currentDriverVehicle, searchTerm }) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const [anchorEl, setAnchorEl] = useState(null)
  const [selectedVehicle, setSelectedVehicle] = useState(null)
  const scrollContainerRef = useRef(null)

  const handleChipClick = (event, vehicle) => {
    setAnchorEl(event.currentTarget)
    setSelectedVehicle(vehicle)
  }

  const handlePopoverClose = () => {
    setAnchorEl(null)
    setSelectedVehicle(null)
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <Typography>Loading queue...</Typography>
      </Box>
    )
  }

  // Filter vehicles based on search term
  const filteredVehicles = vehicles.filter(vehicle => 
    !searchTerm || 
    vehicle.vehicle_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.item?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Calculate items per column based on screen height
  const maxItemsPerColumn = isMobile ? 8 : 12
  const columnWidth = isMobile ? 280 : 320
  const columns = Math.ceil(filteredVehicles.length / maxItemsPerColumn)

  const getVehicleColumns = () => {
    const columnsData = []
    for (let col = 0; col < columns; col++) {
      const startIndex = col * maxItemsPerColumn
      const endIndex = Math.min(startIndex + maxItemsPerColumn, filteredVehicles.length)
      columnsData.push(filteredVehicles.slice(startIndex, endIndex))
    }
    return columnsData
  }

  if (filteredVehicles.length === 0) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <Typography color="textSecondary">
          {searchTerm ? 'No vehicles match your search' : 'No vehicles in queue'}
        </Typography>
      </Box>
    )
  }

  const isOwnVehicle = (vehicle) => {
    return currentDriverVehicle && 
      (vehicle.vehicle_number === currentDriverVehicle || vehicle.item === currentDriverVehicle)
  }

  const columnsData = getVehicleColumns()

  return (
    <>
      <Box sx={{ width: '100%', overflow: 'hidden' }}>
        {/* Single Fixed Header */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: '60px 1fr 120px 80px',
            gap: 1,
            p: 2,
            pb: 1,
            borderBottom: '2px solid #e0e0e0',
            backgroundColor: '#f5f5f5',
            fontWeight: 'bold',
          }}
        >
          <Typography variant="subtitle2" fontWeight="bold" color="text.secondary">
            QUEUE
          </Typography>
          <Typography variant="subtitle2" fontWeight="bold" color="text.secondary">
            VEHICLE
          </Typography>
          <Typography variant="subtitle2" fontWeight="bold" color="text.secondary">
            STATUS
          </Typography>
          <Typography variant="subtitle2" fontWeight="bold" color="text.secondary" textAlign="right">
            SCORE
          </Typography>
        </Box>

        {/* Snap-to-Column Scrollable Content */}
        <Box
          ref={scrollContainerRef}
          sx={{
            display: 'flex',
            overflowX: 'auto',
            overflowY: 'hidden',
            scrollSnapType: 'x mandatory',
            scrollBehavior: 'smooth',
            maxHeight: 'calc(100vh - 350px)',
            minHeight: '400px',
            '&::-webkit-scrollbar': {
              height: 8,
            },
            '&::-webkit-scrollbar-track': {
              background: '#f1f1f1',
              borderRadius: 4,
            },
            '&::-webkit-scrollbar-thumb': {
              background: '#c1c1c1',
              borderRadius: 4,
              '&:hover': {
                background: '#a8a8a8',
              },
            },
          }}
        >
          {columnsData.map((columnVehicles, colIndex) => (
            <Box
              key={colIndex}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                minWidth: columnWidth,
                maxWidth: columnWidth,
                scrollSnapAlign: 'start',
                borderRight: colIndex < columnsData.length - 1 ? '1px solid #e0e0e0' : 'none',
              }}
            >
              {/* Queue Items */}
              {columnVehicles.map((vehicle, index) => {
                const globalIndex = colIndex * maxItemsPerColumn + index
                const isOwn = isOwnVehicle(vehicle)
                
                return (
                  <Box
                    key={vehicle.id || globalIndex}
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: '60px 1fr 120px 80px',
                      gap: 1,
                      p: 2,
                      backgroundColor: isOwn ? '#e3f2fd' : index % 2 === 0 ? '#fafafa' : '#ffffff',
                      borderBottom: '1px solid #f0f0f0',
                      border: isOwn ? '2px solid #1976d2' : 'none',
                      '&:hover': {
                        backgroundColor: isOwn ? '#bbdefb' : '#f5f5f5',
                      },
                      alignItems: 'center',
                    }}
                  >
                    {/* Queue Number */}
                    <Typography 
                      variant="body1" 
                      fontWeight="bold"
                      sx={{ 
                        fontSize: isMobile ? '0.875rem' : '1rem',
                        textAlign: 'center',
                      }}
                    >
                      {globalIndex + 1}
                    </Typography>

                    {/* Vehicle Chip */}
                    <Chip
                      label={vehicle.item || vehicle.vehicle_number || `Vehicle ${globalIndex + 1}`}
                      onClick={(e) => handleChipClick(e, vehicle)}
                      sx={{
                        ...getVehicleStyle(vehicle),
                        fontWeight: 'bold',
                        fontSize: isMobile ? '0.75rem' : '0.875rem',
                        cursor: 'pointer',
                        justifySelf: 'start',
                        maxWidth: '100%',
                      }}
                    />

                    {/* Status */}
                    <Typography 
                      variant="body2"
                      sx={{ 
                        fontSize: isMobile ? '0.75rem' : '0.875rem',
                        color: 'text.secondary',
                        textAlign: 'center',
                      }}
                    >
                      {vehicle.status || 'Ready'}
                    </Typography>

                    {/* Score */}
                    <Typography 
                      variant="body1" 
                      fontWeight="bold"
                      sx={{ 
                        fontSize: isMobile ? '0.875rem' : '1rem',
                        textAlign: 'right',
                      }}
                    >
                      {vehicle.score || 'N/A'}
                    </Typography>
                  </Box>
                )
              })}

              {/* Fill empty rows to maintain column height */}
              {Array.from({ length: maxItemsPerColumn - columnVehicles.length }).map((_, index) => (
                <Box
                  key={`empty-${index}`}
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: '60px 1fr 120px 80px',
                    gap: 1,
                    p: 2,
                    backgroundColor: '#ffffff',
                    borderBottom: '1px solid #f0f0f0',
                    opacity: 0.3,
                  }}
                >
                  <Box />
                  <Box />
                  <Box />
                  <Box />
                </Box>
              ))}
            </Box>
          ))}
        </Box>

        {/* Column Navigation Indicators */}
        {columns > 1 && (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              gap: 1,
              p: 1,
              borderTop: '1px solid #e0e0e0',
              backgroundColor: '#fafafa',
            }}
          >
            {Array.from({ length: columns }).map((_, index) => (
              <Box
                key={index}
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: index === 0 ? '#1976d2' : '#e0e0e0',
                  cursor: 'pointer',
                }}
                onClick={() => {
                  if (scrollContainerRef.current) {
                    scrollContainerRef.current.scrollTo({
                      left: index * columnWidth,
                      behavior: 'smooth'
                    })
                  }
                }}
              />
            ))}
          </Box>
        )}
      </Box>
      
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handlePopoverClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
      >
        {selectedVehicle && <TooltipContent vehicle={selectedVehicle} />}
      </Popover>
    </>
  )
}

export default QueueTable