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
  Popover
} from '@mui/material'

// Import Swiper React components
import { Swiper, SwiperSlide } from 'swiper/react'
import { Pagination } from 'swiper/modules'

// Import Swiper styles
import 'swiper/css'
import 'swiper/css/pagination'

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
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'))
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

  const isOwnVehicle = (vehicle) => {
    return currentDriverVehicle && 
      (vehicle.vehicle_number === currentDriverVehicle || vehicle.item === currentDriverVehicle)
  }

  // Mobile/Tablet Swiper View
  if (isMobile || isTablet) {
    const maxItemsPerSlide = isMobile ? 8 : 10
    const slides = Math.ceil(filteredVehicles.length / maxItemsPerSlide)

    const getVehicleSlides = () => {
      const slidesData = []
      for (let slide = 0; slide < slides; slide++) {
        const startIndex = slide * maxItemsPerSlide
        const endIndex = Math.min(startIndex + maxItemsPerSlide, filteredVehicles.length)
        slidesData.push(filteredVehicles.slice(startIndex, endIndex))
      }
      return slidesData
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

    const slidesData = getVehicleSlides()

    return (
      <>
        <Box sx={{ width: '100%', height: '500px' }}>
          <Swiper
            modules={[Pagination]}
            spaceBetween={0}
            slidesPerView={1}
            pagination={{
              clickable: true,
              bulletClass: 'swiper-pagination-bullet',
              bulletActiveClass: 'swiper-pagination-bullet-active'
            }}
            style={{
              width: '100%',
              height: '100%',
              '--swiper-pagination-color': '#1976d2',
              '--swiper-pagination-bullet-size': '8px',
            }}
          >
            {slidesData.map((slideVehicles, slideIndex) => (
              <SwiperSlide key={slideIndex}>
                <TableContainer 
                  component={Paper}
                  sx={{ 
                    height: '100%',
                    width: '100%',
                    overflow: 'auto'
                  }}
                >
                  <Table 
                    stickyHeader 
                    size="small"
                    sx={{
                      '& .MuiTableCell-root': {
                        padding: isMobile ? '4px 2px' : '6px 4px',
                        fontSize: isMobile ? '0.65rem' : '0.75rem',
                        lineHeight: 1.2
                      }
                    }}
                  >
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5', minWidth: '5px' }}>
                        
                        </TableCell>
                        <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5', minWidth: '40px' }}>
                          <Box textAlign="center">
                            <Typography variant="caption" fontWeight="bold" display="block">
                              QUEUE
                            </Typography>
                          </Box>
                        </TableCell>

                        <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5', minWidth: '45px' }}>
                          <Box textAlign="center">
                            <Typography variant="caption" fontWeight="bold" display="block">
                              JOB
                            </Typography>
                            <Typography variant="caption" fontWeight="bold" display="block">
                              COUNT
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5', minWidth: '50px' }}>
                          <Box textAlign="center">
                            <Typography variant="caption" fontWeight="bold" display="block">
                              MILE
                            </Typography>
                            <Typography variant="caption" fontWeight="bold" display="block">
                              (KM)
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5', minWidth: '45px' }}>
                          <Box textAlign="center">
                            <Typography variant="caption" fontWeight="bold" display="block">
                              JOB
                            </Typography>
                            <Typography variant="caption" fontWeight="bold" display="block">
                              QTY
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5', minWidth: '50px' }}>
                          <Box textAlign="center">
                            <Typography variant="caption" fontWeight="bold" display="block">
                              JOB
                            </Typography>
                            <Typography variant="caption" fontWeight="bold" display="block">
                              HRS
                            </Typography>
                          </Box>
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {slideVehicles.map((vehicle, index) => {
                        const globalIndex = slideIndex * maxItemsPerSlide + index
                        const isOwn = isOwnVehicle(vehicle)
                        
                        return (
                          <TableRow
                            key={vehicle.id || globalIndex}
                            sx={{
                              backgroundColor: isOwn ? '#e3f2fd' : index % 2 === 0 ? '#fafafa' : '#ffffff',
                              border: isOwn ? '2px solid #1976d2' : 'none',
                              '&:hover': {
                                backgroundColor: isOwn ? '#bbdefb' : '#f5f5f5',
                              },
                            }}
                          >
                            <TableCell align="center">
                              <Typography variant="caption" fontWeight="bold">
                                {globalIndex + 1}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={vehicle.item || vehicle.vehicle_number || `Vehicle ${globalIndex + 1}`}
                                onClick={(e) => handleChipClick(e, vehicle)}
                                sx={{
                                  ...getVehicleStyle(vehicle),
                                  fontWeight: 'bold',
                                  fontSize: isMobile ? '0.6rem' : '0.7rem',
                                  cursor: 'pointer',
                                  height: isMobile ? 20 : 24,
                                  maxWidth: '100%',
                                  '& .MuiChip-label': {
                                    px: isMobile ? 0.5 : 1
                                  }
                                }}
                              />
                            </TableCell>
                            <TableCell align="center">
                              <Typography variant="caption">
                                {vehicle.job_count || 0}
                              </Typography>
                            </TableCell>
                            <TableCell align="center">
                              <Typography variant="caption">
                                {vehicle.mileage || '0'}
                              </Typography>
                            </TableCell>
                            <TableCell align="center">
                              <Typography variant="caption">
                                {vehicle.job_qty || 0}
                              </Typography>
                            </TableCell>
                            <TableCell align="center">
                              <Typography variant="caption">
                                {vehicle.job_hours || '0'}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                      
                      {/* Fill empty rows to maintain consistent table height */}
                      {Array.from({ length: maxItemsPerSlide - slideVehicles.length }).map((_, index) => (
                        <TableRow key={`empty-${index}`} sx={{ opacity: 0.3 }}>
                          <TableCell>&nbsp;</TableCell>
                          <TableCell>&nbsp;</TableCell>
                          <TableCell>&nbsp;</TableCell>
                          <TableCell>&nbsp;</TableCell>
                          <TableCell>&nbsp;</TableCell>
                          <TableCell>&nbsp;</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </SwiperSlide>
            ))}
          </Swiper>
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

  // Desktop Table View
  const getRowStyle = (vehicle, index) => {
    const isOwn = isOwnVehicle(vehicle)
    
    return {
      backgroundColor: isOwn 
        ? '#e3f2fd'
        : index % 2 === 0 ? '#fafafa' : '#ffffff',
      '&:hover': {
        backgroundColor: isOwn ? '#bbdefb' : '#f0f0f0'
      },
      fontWeight: isOwn ? 'bold' : 'normal'
    }
  }

  return (
    <>
      <TableContainer 
        component={Paper} 
        sx={{ 
          maxHeight: 'calc(100vh - 300px)',
          '& .MuiTableCell-root': {
            whiteSpace: 'nowrap',
            fontSize: '0.875rem'
          }
        }}
      >
        <Table stickyHeader size="medium">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>
                QUEUE
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>
                SCORE
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>
                JOB COUNT
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>
                MILEAGE (KM)
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>
                JOB QTY
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>
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
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography variant="body2" fontWeight="inherit">
                      {index + 1}
                    </Typography>
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
                    {vehicle.score || 'N/A'}
                  </Typography>
                </TableCell>
                <TableCell>
                  {vehicle.job_count || 0}
                </TableCell>
                <TableCell>
                  {vehicle.mileage || '0'}
                </TableCell>
                <TableCell>
                  {vehicle.job_qty || 0}
                </TableCell>
                <TableCell>
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