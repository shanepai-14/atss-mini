import React from 'react'
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
  useMediaQuery
} from '@mui/material'

const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'attention':
      return '#d32f2f' // Red
    case 'vehicle on err ready':
      return '#2e7d32' // Green  
    case 'priority today':
      return '#ed6c02' // Orange
    case 'priority yesterday':
      return '#f57c00' // Amber
    default:
      return '#757575' // Grey
  }
}

const getStatusBackground = (status) => {
  switch (status?.toLowerCase()) {
    case 'attention':
      return '#ffebee' // Light red
    case 'vehicle on err ready':
      return '#e8f5e8' // Light green
    case 'priority today':
      return '#fff3e0' // Light orange
    case 'priority yesterday':
      return '#fff8e1' // Light amber
    default:
      return '#f5f5f5' // Light grey
  }
}

const QueueTable = ({ vehicles, loading, currentDriverVehicle }) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'))

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <Typography>Loading queue...</Typography>
      </Box>
    )
  }

  const getRowStyle = (vehicle, index) => {
    const isOwnVehicle = currentDriverVehicle && 
      vehicle.vehicle_number === currentDriverVehicle
    
    return {
      backgroundColor: isOwnVehicle 
        ? '#e3f2fd' // Light blue highlight for driver's vehicle
        : index % 2 === 0 ? '#fafafa' : '#ffffff', // Zebra stripes
      '&:hover': {
        backgroundColor: isOwnVehicle ? '#bbdefb' : '#f0f0f0'
      },
      fontWeight: isOwnVehicle ? 'bold' : 'normal'
    }
  }

  return (
    <TableContainer 
      component={Paper} 
      sx={{ 
        maxHeight: 'calc(100vh - 200px)',
        '& .MuiTableCell-root': {
          whiteSpace: 'nowrap',
          fontSize: isMobile ? '0.75rem' : '0.875rem'
        }
      }}
    >
      <Table stickyHeader size={isMobile ? 'small' : 'medium'}>
        <TableHead>
          <TableRow>
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
                display: { xs: 'none', sm: 'table-cell' }
              }}
            >
              JOB COUNT
            </TableCell>
            <TableCell 
              sx={{ 
                fontWeight: 'bold', 
                bgcolor: '#f5f5f5',
                display: { xs: 'none', md: 'table-cell' }
              }}
            >
              MILEAGE (KM)
            </TableCell>
            <TableCell 
              sx={{ 
                fontWeight: 'bold', 
                bgcolor: '#f5f5f5',
                display: { xs: 'none', sm: 'table-cell' }
              }}
            >
              JOB QTY
            </TableCell>
            <TableCell 
              sx={{ 
                fontWeight: 'bold', 
                bgcolor: '#f5f5f5',
                display: { xs: 'none', lg: 'table-cell' }
              }}
            >
              JOB HOURS
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {vehicles.map((vehicle, index) => (
            <TableRow
              key={vehicle.id || index}
              sx={getRowStyle(vehicle, index)}
            >
              <TableCell>
                <Box display="flex" alignItems="center" gap={1}>
                  <Typography variant="body2" fontWeight="inherit">
                    {index + 1}
                  </Typography>
                  <Chip
                    label={vehicle.item || vehicle.score || `Vehicle ${index + 1}`}
                    sx={{
                      backgroundColor: getStatusBackground(vehicle.status),
                      color: getStatusColor(vehicle.status),
                      fontWeight: 'bold',
                      fontSize: '0.75rem'
                    }}
                  />
                </Box>
              </TableCell>
              <TableCell>
                <Typography variant="body2" fontWeight="inherit">
                  {vehicle.score || 'N/A'}
                </Typography>
              </TableCell>
              <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                {vehicle.job_count || 0}
              </TableCell>
              <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                {vehicle.mileage || '0'}
              </TableCell>
              <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                {vehicle.job_qty || 0}
              </TableCell>
              <TableCell sx={{ display: { xs: 'none', lg: 'table-cell' } }}>
                {vehicle.job_hours || '0'}
              </TableCell>
            </TableRow>
          ))}
          {vehicles.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                <Typography color="textSecondary">
                  No vehicles in queue
                </Typography>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

export default QueueTable