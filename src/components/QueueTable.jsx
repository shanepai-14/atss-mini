import React, { useState } from 'react'
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
  } else if (vehicle.raw_score[1].score == 0) {
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

  const getRowStyle = (vehicle, index) => {
    const isOwnVehicle = currentDriverVehicle && 
      (vehicle.vehicle_number === currentDriverVehicle || vehicle.item === currentDriverVehicle)
    
    return {
      backgroundColor: isOwnVehicle 
        ? '#e3f2fd'
        : index % 2 === 0 ? '#fafafa' : '#ffffff',
      '&:hover': {
        backgroundColor: isOwnVehicle ? '#bbdefb' : '#f0f0f0'
      },
      fontWeight: isOwnVehicle ? 'bold' : 'normal'
    }
  }

  return (
    <>
      <TableContainer 
        component={Paper} 
        sx={{ 
          maxHeight: 'calc(100vh - 100px)',
          '& .MuiTableCell-root': {
            whiteSpace: 'nowrap',
            fontSize: isMobile ? '0.75rem' : '0.875rem'
          }
        }}
      >
        <Table stickyHeader size={isMobile ? 'small' : 'medium'}>
          <TableHead>
            <TableRow>
               <TableCell width={'5px'} sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>
               
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>
                QUEUE
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>
                SCORE
              </TableCell>
              <TableCell 
                sx={{ 
                  fontWeight: 'bold', 
                  bgcolor: '#f5f5f5',
                }}
              >
                JOB COUNT
              </TableCell>
              <TableCell 
                sx={{ 
                  fontWeight: 'bold', 
                  bgcolor: '#f5f5f5',
                }}
              >
                MILEAGE (KM)
              </TableCell>
              <TableCell 
                sx={{ 
                  fontWeight: 'bold', 
                  bgcolor: '#f5f5f5',
                }}
              >
                JOB QTY
              </TableCell>
              <TableCell 
                sx={{ 
                  fontWeight: 'bold', 
                  bgcolor: '#f5f5f5',
                }}
              >
                JOB HOURS
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredVehicles.map((vehicle, index) => (
              <TableRow
                key={vehicle.id || index}
                sx={getRowStyle(vehicle, index)}
              >
                <TableCell>
                <Typography variant="body2" fontWeight="inherit">
                      {index + 1}
                    </Typography>
                </TableCell>
                <TableCell>
                  <Box display="flex" alignItems="center" gap={1}>

                    <Chip
                      label={vehicle.item || vehicle.vehicle_number || `Vehicle ${index + 1}`}
                      onClick={(e) => handleChipClick(e, vehicle)}
                      sx={{
                        ...getVehicleStyle(vehicle),
                        fontWeight: 'bold',
                        fontSize: '0.75rem',
                        cursor: 'pointer'
                      }}
                    />
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight="inherit">
                    {vehicle.score}
                  </Typography>
                </TableCell>
                <TableCell >
                  {vehicle.job_count || 0}
                </TableCell>
                <TableCell>
                  {vehicle.mileage || '0'}
                </TableCell>
                <TableCell >
                  {vehicle.job_qty || 0}
                </TableCell>
                <TableCell >
                  {vehicle.job_hours || '0'}
                </TableCell>
              </TableRow>
            ))}
            {filteredVehicles.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                  <Typography color="textSecondary">
                    {searchTerm ? 'No vehicles match your search' : 'No vehicles in queue'}
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      
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