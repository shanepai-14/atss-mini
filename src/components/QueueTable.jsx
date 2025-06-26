import React, { useState, useEffect, useRef} from 'react'
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
  Rating 
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
    <Typography variant="body2">
      Score : {vehicle.score || 0}
    </Typography>
    <Typography variant="body2">
      Job Count : {vehicle.raw_score[3].value || 0}
    </Typography>
    <Typography variant="body2">
      Mileage (KM) : {vehicle.raw_score[7].value || 0}
    </Typography>
    <Typography variant="body2">
      Job Quantity : {vehicle.raw_score[4].value || 0}
    </Typography>
        <Typography variant="body2">
      Job Hours : {vehicle.raw_score[8].value || 0}
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
  const [itemsPerSlide, setItemsPerSlide] = useState(8) // default fallback
  const containerRef = useRef(null)

  // Calculate items per slide based on viewport
  useEffect(() => {
    const calculateItemsPerSlide = () => {
      // Use the actual available viewport height instead of container
      const viewportHeight = window.innerHeight
      const headerHeight = 60 // Approximate header height
      const paginationHeight = 40 // Approximate pagination height  
      const otherUIElements = 200 // Navigation, margins, etc.
      
      const availableHeight = viewportHeight - headerHeight - paginationHeight - otherUIElements
      
      // More accurate row height estimation based on actual CSS
      const estimatedRowHeight = isMobile ? 28 : 36 // accounting for padding and line-height
      
      const calculatedItems = Math.floor(availableHeight / estimatedRowHeight)
      
      // Set minimum and maximum bounds
      const minItems = 4
      const maxItems = isMobile ? 20 : 25 // increased to fill more space
      
      const finalItems = Math.max(minItems, Math.min(maxItems, calculatedItems))
      setItemsPerSlide(finalItems)
      
      console.log('Viewport calculation:', {
        viewportHeight,
        availableHeight,
        estimatedRowHeight,
        calculatedItems,
        finalItems
      })
    }

    // Initial calculation with a delay to ensure DOM is ready
    const timeoutId = setTimeout(calculateItemsPerSlide, 100)
    
    const handleResize = () => {
      setTimeout(calculateItemsPerSlide, 100)
    }

    window.addEventListener('resize', handleResize)
    window.addEventListener('orientationchange', () => {
      setTimeout(calculateItemsPerSlide, 300)
    })

    return () => {
      clearTimeout(timeoutId)
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('orientationchange', handleResize)
    }
  }, [isMobile, isTablet])

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
   
    return currentDriverVehicle && vehicle.item == currentDriverVehicle;
      
  }

  // Mobile/Tablet Swiper View
  if (isMobile || isTablet) {
    const slides = Math.ceil(filteredVehicles.length / itemsPerSlide)

    const getVehicleSlides = () => {
      const slidesData = []
      for (let slide = 0; slide < slides; slide++) {
        const startIndex = slide * itemsPerSlide
        const endIndex = Math.min(startIndex + itemsPerSlide, filteredVehicles.length)
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
        <Box 
          ref={containerRef}
          sx={{ 
            width: '100%', 
            minHeight: '800px' 
          }}
        >
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
                    height: '100% ', // Account for pagination
                    width: '100%',
    
                  }}
                >
                  <Table 
                    stickyHeader 
                    size="small"
                    sx={{
                      '& .MuiTableCell-root': {
                        padding: isMobile ? '3px 2px' : '5px 4px',
                        fontSize: isMobile ? '0.65rem' : '0.75rem',
                        lineHeight: 1.1,
                        height: isMobile ? '28px' : '36px' // Match our calculation
                      }
                    }}
                  >
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>
                        
                        </TableCell>
                        <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>
                          <Box textAlign="left">
                            <Typography variant="caption" fontWeight="bold" display="block">
                              QUEUE
                            </Typography>
                          </Box>
                        </TableCell>

                        <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>
                          <Box textAlign="center">
                            {/* <Typography variant="caption" fontWeight="bold" display="block">
                              JOB
                            </Typography>
                            <Typography variant="caption" fontWeight="bold" display="block">
                              COUNT
                            </Typography> */}
                              
                          </Box>
                        </TableCell>
                        <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>
                          <Box textAlign="center">
                            <Typography variant="caption" fontWeight="bold" display="block">
                              LAST WEEK
                            </Typography>
                            <Typography variant="caption" fontWeight="bold" display="block">
                              PERFORMANCE
                            </Typography>
                            <Typography variant="caption" fontWeight="bold" display="block">
                              SCORE
                            </Typography>
                          </Box>
                        </TableCell>
                        {/* <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5', minWidth: '45px' }}>
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
                        </TableCell> */}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {slideVehicles.map((vehicle, index) => {
                        const globalIndex = slideIndex * itemsPerSlide + index
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
                                {vehicle.rank || globalIndex + 1}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Box
                                onClick={(e) => handleChipClick(e, vehicle)}
                                sx={{
                                  ...getVehicleStyle(vehicle),
                                  display:"inline-block",
                                  padding:'7px 15px 5px 15px',
                                  borderRadius:'5px',
                                  fontWeight: 'bold',
                                  fontSize: isMobile ? '0.8rem' : '0.10rem',
                                  cursor: 'pointer',
                                  height: isMobile ?'auto': 24,
                                
                                }}
                              >{vehicle.item }</Box>
                            </TableCell>
                            <TableCell align="center">
                          {vehicle.message_data.length > 0 && (
                              <Box
                                onClick={(e) => handleChipClick(e, vehicle)}
                                sx={{
                                  backgroundColor: theme.palette.error.main,
                                  display: "inline-block",
                                  padding: '8px 15px 6px 15px',
                                  borderRadius: '5px',
                                  fontSize: '0.7rem',
                                  cursor: 'pointer',
                                  color: 'white'
                                }}
                              >
                                Trial mix
                              </Box>
                             )} 
                            </TableCell>
                            <TableCell align="center">
                           
                               <Rating max={3} name="size-large" defaultValue={3} size="large" />
                              
                            </TableCell>
                            {/* <TableCell align="center">
                              <Typography variant="caption">
                                {vehicle.job_qty || 0}
                              </Typography>
                            </TableCell>
                            <TableCell align="center">
                              <Typography variant="caption">
                                {vehicle.job_hours || '0'}
                              </Typography>
                            </TableCell> */}
                          </TableRow>
                        )
                      })}
                      
                      {/* Only fill empty rows if we want consistent height, otherwise let it be dynamic */}
                      {slideVehicles.length < itemsPerSlide && Array.from({ 
                        length: Math.min(3, itemsPerSlide - slideVehicles.length) 
                      }).map((_, index) => (
                        <TableRow key={`empty-${index}`} sx={{ opacity: 0.1 }}>
                          <TableCell>&nbsp;</TableCell>
                          <TableCell>&nbsp;</TableCell>
                          <TableCell>&nbsp;</TableCell>
                          <TableCell>&nbsp;</TableCell>
                          {/* <TableCell>&nbsp;</TableCell>
                          <TableCell>&nbsp;</TableCell> */}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </SwiperSlide>
            ))}
          </Swiper>
        </Box>
        
        {/* Debug info - remove in production */}
        {/* <Box sx={{ mt: 1, fontSize: '0.7rem', color: 'gray' }}>
          Items per slide: {itemsPerSlide} | Total slides: {slides}
        </Box> */}
        
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

  // Desktop Table View (unchanged)
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
               <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }} width={'10px'}>
             
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>
                QUEUE
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>
               
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>
                LAST WEEK PERFORMANCE SCORE
              </TableCell>
              {/* <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>
                MILEAGE (KM)
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>
                JOB QTY
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>
                JOB HOURS
              </TableCell> */}
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
                      {vehicle.rank ||index + 1}
                    </Typography>
                </TableCell>
                <TableCell>
                            <Box
                                onClick={(e) => handleChipClick(e, vehicle)}
                                sx={{
                                  ...getVehicleStyle(vehicle),
                                  display:"inline-block",
                                  padding:'7px 15px 5px 15px',
                                  borderRadius:'5px',
                                  fontWeight: 'bold',
                                  fontSize: '1rem',
                                  cursor: 'pointer',
                               
                                
                                }}
                              >{vehicle.item }</Box>

                    {/* <Chip
                      label={vehicle.item || vehicle.vehicle_number || `Vehicle ${index + 1}`}
                      onClick={(e) => handleChipClick(e, vehicle)}
                      sx={{
                        ...getVehicleStyle(vehicle),
                        fontWeight: 'bold',
                        fontSize: '0.75rem',
                        cursor: 'pointer'
                      }}
                    /> */}
                  
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight="inherit">
                  {vehicle.message_data.length > 0 && (
                    <Box
                      onClick={(e) => handleChipClick(e, vehicle)}
                      sx={{
                        backgroundColor: theme.palette.error.main,
                        display: "inline-block",
                        padding: '8px 15px 6px 15px',
                        borderRadius: '5px',
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        color: 'white'
                      }}
                    >
                      Trial Mix
                    </Box>
                   )}


                  </Typography>
                </TableCell>
                <TableCell>
                     <Rating max={3} name="size-large" defaultValue={3} size="large" />
                </TableCell>
                {/* <TableCell>
                  {vehicle.mileage || '0'}
                </TableCell>
                <TableCell>
                  {vehicle.job_qty || 0}
                </TableCell>
                <TableCell>
                  {vehicle.job_hours || '0'}
                </TableCell> */}
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