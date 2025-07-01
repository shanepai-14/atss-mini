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
  Rating,
  IconButton,
  Tooltip,
  ToggleButton,
  ToggleButtonGroup
} from '@mui/material'
import {
  ViewCarousel,
  SwipeRight,
  ArrowForward
} from '@mui/icons-material'

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

// Navigation Toggle Component
const NavigationToggle = ({ navigationMode, setNavigationMode, isMobile, isTablet }) => {
  if (!isMobile && !isTablet) return null // Only show on mobile/tablet

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        mb: 1,
        position: 'relative',
        zIndex: 10
      }}
    >
      <ToggleButtonGroup
        value={navigationMode}
        exclusive
        onChange={(_, newMode) => newMode && setNavigationMode(newMode)}
        size="small"
        sx={{
          '& .MuiToggleButton-root': {
            px: isMobile ? 1 : 2,
            py: 0.5,
            fontSize: isMobile ? '0.7rem' : '0.8rem',
          }
        }}
      >

        <ToggleButton value="scroll">
          <ArrowForward sx={{ mr: 0.5, fontSize: isMobile ? '1rem' : '1.2rem' }} />
          Scroll
        </ToggleButton>
        <ToggleButton value="swiper">
          <ViewCarousel sx={{ mr: 0.5, fontSize: isMobile ? '1rem' : '1.2rem' }} />
          Pages
        </ToggleButton>
      </ToggleButtonGroup>
    </Box>
  )
}

const QueueTable = ({ 
  vehicles, 
  loading, 
  currentDriverVehicle, 
  searchTerm,
  showPerformanceScore = false // Keep this prop for future use
}) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'))
  const [anchorEl, setAnchorEl] = useState(null)
  const [selectedVehicle, setSelectedVehicle] = useState(null)
  const [itemsPerSlide, setItemsPerSlide] = useState(8)
  const [navigationMode, setNavigationMode] = useState('scroll') // 'swiper' or 'scroll'
  const [scrollModeItemsPerTable, setScrollModeItemsPerTable] = useState(8) // For scroll mode
  const containerRef = useRef(null)

  // Calculate items per slide/table based on viewport (for both modes)
  useEffect(() => {
    const calculateItemsPerTable = () => {
      const viewportHeight = window.innerHeight
      const headerHeight = 60
      const paginationHeight = 40
      const otherUIElements = 250 // Include toggle
      
      const availableHeight = viewportHeight - headerHeight - paginationHeight - otherUIElements
      const estimatedRowHeight = isMobile ? 28 : 36
      const calculatedItems = Math.floor(availableHeight / estimatedRowHeight)
      
      const minItems = 4
      const maxItems = isMobile ? 20 : 25
      const finalItems = Math.max(minItems, Math.min(maxItems, calculatedItems))
      
      if (navigationMode === 'swiper') {
        setItemsPerSlide(finalItems)
      } else {
        setScrollModeItemsPerTable(finalItems)
      }

      console.log('Viewport calculation:', {
        viewportHeight,
        availableHeight,
        estimatedRowHeight,
        calculatedItems,
        finalItems,
        mode: navigationMode
      })
    }

    const timeoutId = setTimeout(calculateItemsPerTable, 100)
    
    const handleResize = () => {
      setTimeout(calculateItemsPerTable, 100)
    }

    window.addEventListener('resize', handleResize)
    window.addEventListener('orientationchange', () => {
      setTimeout(calculateItemsPerTable, 300)
    })

    return () => {
      clearTimeout(timeoutId)
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('orientationchange', handleResize)
    }
  }, [isMobile, isTablet, navigationMode]) // Added navigationMode as dependency

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

  // Mobile/Tablet Views
  if (isMobile || isTablet) {
    if (filteredVehicles.length === 0) {
      return (
        <Box>
          <NavigationToggle 
            navigationMode={navigationMode}
            setNavigationMode={setNavigationMode}
            isMobile={isMobile}
            isTablet={isTablet}
          />
          <Box display="flex" justifyContent="center" p={4}>
            <Typography color="textSecondary">
              {searchTerm ? 'No vehicles match your search' : 'No vehicles in queue'}
            </Typography>
          </Box>
        </Box>
      )
    }

    // Native Horizontal Scroll Version (Table-based like Swiper)
    if (navigationMode === 'scroll') {
      // Calculate items per table (same logic as Swiper)
      const viewportHeight = window.innerHeight
      const headerHeight = 60
      const paginationHeight = 40
      const otherUIElements = 250 // Include toggle
      
      const availableHeight = viewportHeight - headerHeight - paginationHeight - otherUIElements
      const estimatedRowHeight = isMobile ? 28 : 36
      const calculatedItems = Math.floor(availableHeight / estimatedRowHeight)
      
      const minItems = 4
      const maxItems = isMobile ? 20 : 25
      const finalItemsPerTable = Math.max(minItems, Math.min(maxItems, calculatedItems))

      const tables = Math.ceil(filteredVehicles.length / finalItemsPerTable)

      const getVehicleTables = () => {
        const tablesData = []
        for (let table = 0; table < tables; table++) {
          const startIndex = table * finalItemsPerTable
          const endIndex = Math.min(startIndex + finalItemsPerTable, filteredVehicles.length)
          tablesData.push(filteredVehicles.slice(startIndex, endIndex))
        }
        return tablesData
      }

      const tablesData = getVehicleTables()

      return (
        <Box>
          <NavigationToggle 
            navigationMode={navigationMode}
            setNavigationMode={setNavigationMode}
            isMobile={isMobile}
            isTablet={isTablet}
          />
          
          <Box
            sx={{ 
              width: '100%',
              height: `calc(100vh - 150px)`, // Fixed height to prevent vertical scroll
              overflowY: 'hidden', // Prevent vertical scroll
              overflowX: tables === 1 ? 'hidden' : 'auto', // No horizontal scroll if only 1 table
              display: 'flex', // Horizontal layout
              '&::-webkit-scrollbar': {
                height: '8px',
                display: tables === 1 ? 'none' : 'block', // Hide scrollbar if only 1 table
              },
              '&::-webkit-scrollbar-track': {
                backgroundColor: '#f1f1f1',
                borderRadius: '4px',
              },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: '#c1c1c1',
                borderRadius: '4px',
                '&:hover': {
                  backgroundColor: '#a8a8a8',
                },
              },
            }}
          >
            {tablesData.map((tableVehicles, tableIndex) => (
              <TableContainer 
                key={tableIndex}
                component={Paper}
                sx={{ 
                  height: '100%',
                  minWidth: tables === 1 ? '100%' : '300px', // Full width if only 1 table
                  maxWidth: tables === 1 ? '100%' : '300px', // Full width if only 1 table
                  width: tables === 1 ? '100%' : '400px', // Explicit width for single table
                  marginRight: tableIndex < tablesData.length - 1 ? '10px' : 0, // Gap between tables
                  flexShrink: 0, // Prevent shrinking
                  overflowY: 'hidden', // No vertical scroll within table
                }}
              >
                <Table 
                  stickyHeader 
                  size="small"
                  sx={{
                    height: '100%',
                    '& .MuiTableCell-root': {
                     padding: isMobile ? '3px 2px' : '5px 4px',
                      fontSize: '1rem' ,
                      lineHeight: 1.2,
                      whiteSpace: 'nowrap',
                       height: isMobile ? '28px' : '36px'
                    }
                  }}
                >
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>
                        <Typography variant="caption" fontWeight="bold" display="block" >
                          
                        </Typography>
                      </TableCell>
                      <TableCell textAlign="left" sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5', minWidth: '15px' }}>
                        <Typography variant="caption" fontWeight="bold" display="block">
                          QUEUE
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5', minWidth: '50px' }}>
                        <Typography variant="caption" fontWeight="bold" display="block">
                          REMARKS  
                        </Typography>
                      </TableCell>
                      {/* Performance Score Column - Commented Out */}
                      {/* {showPerformanceScore && (
                        <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5', minWidth: '140px' }}>
                          <Typography variant="caption" fontWeight="bold" display="block">
                            LAST WEEK
                          </Typography>
                          <Typography variant="caption" fontWeight="bold" display="block">
                            PERFORMANCE
                          </Typography>
                          <Typography variant="caption" fontWeight="bold" display="block">
                            SCORE
                          </Typography>
                        </TableCell>
                      )} */}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {tableVehicles.map((vehicle, index) => {
                      const globalIndex = tableIndex * finalItemsPerTable + index
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
                            <Typography variant="caption" fontWeight="bold" sx={{fontSize:'1rem'}}>
                              {vehicle.rank || globalIndex + 1}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Box
                              onClick={(e) => handleChipClick(e, vehicle)}
                              sx={{
                                ...getVehicleStyle(vehicle),
                                display: "inline-block",
                                padding: '4px 8px 2px 8px',
                                borderRadius: '4px',
                                fontWeight: 'bold',
                                fontSize: '1rem' ,
                                cursor: 'pointer',
                                minWidth: '60px',
                                textAlign: 'center',
                                height: isMobile ? 'auto': 24,
                                
                              }}
                            >
                              {vehicle.item}
                            </Box>
                          </TableCell>
                          <TableCell align="left">
                        {vehicle.message_data.length > 0 && (
                        vehicle.message_data.map((msg, index) => (
                          <Box
                            key={index}
                            onClick={(e) => handleChipClick(e, vehicle)}
                            sx={{
                              backgroundColor: theme.palette.error.main,
                              display: "inline-block",
                              padding: '4px 8px 2px 8px',
                              borderRadius: '4px',
                              fontSize: '0.6rem',
                              cursor: 'pointer',
                              color: 'white',
                              marginRight: '4px', // spacing between chips
                            }}
                          >
                            {msg.message?.FeedbackType || 'No Feedback'}
                          </Box>
                        ))
                      )}

                          </TableCell>
                          {/* Performance Score Column - Commented Out */}
                          {/* {showPerformanceScore && (
                            <TableCell align="center">
                              <Rating max={3} name="size-small" defaultValue={3} size="small" />
                            </TableCell>
                          )} */}
                        </TableRow>
                      )
                    })}
                    
                    {/* Fill empty rows to maintain consistent table height */}
                    {tableVehicles.length < finalItemsPerTable && Array.from({ 
                      length: finalItemsPerTable - tableVehicles.length 
                    }).map((_, index) => (
                      <TableRow key={`empty-${tableIndex}-${index}`} sx={{ opacity: 0.1 }}>
                        <TableCell>&nbsp;</TableCell>
                        <TableCell>&nbsp;</TableCell>
                        <TableCell>&nbsp;</TableCell>
                        {/* {showPerformanceScore && <TableCell>&nbsp;</TableCell>} */}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ))}
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
        </Box>
      )
    }

    // Swiper Version (Original)
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

    const slidesData = getVehicleSlides()

    return (
      <Box>
        <NavigationToggle 
          navigationMode={navigationMode}
          setNavigationMode={setNavigationMode}
          isMobile={isMobile}
          isTablet={isTablet}
        />
        
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
                    height: '100%',
                    width: '100%',
                  }}
                >
                  <Table 
                    stickyHeader 
                    size="small"
                    sx={{
                      height: '100%',
                      '& .MuiTableCell-root': {
                        padding: isMobile ? '3px 2px' : '5px 4px',
                        fontSize: isMobile ? '0.65rem' : '0.75rem',
                        lineHeight: 1.1,
                        height: isMobile ? '36px' : '36px'
                      }
                    }}
                  >
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>
                          <Typography variant="caption" fontWeight="bold" display="block" >
                          
                        </Typography>
                        </TableCell>
                        <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>
                            <Typography variant="caption" fontWeight="bold" display="block">
                              QUEUE
                            </Typography>

                        </TableCell>

                        <TableCell  sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>
                          {/* <Box textAlign="center"> */}
                            {/* <Typography variant="caption" fontWeight="bold" display="block">
                              JOB
                            </Typography>
                            <Typography variant="caption" fontWeight="bold" display="block">
                              COUNT
                            </Typography> */}
                            
                          {/* </Box> */}
                          <Typography variant="caption" fontWeight="bold" display="block">
                          REMARKS  
                        </Typography>
                        </TableCell>
                        {/* Performance Score Column - Commented Out */}
                        {/* {showPerformanceScore && (
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
                        )} */}
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
                              <Typography variant="caption" fontWeight="bold" sx={{fontSize: '1rem',}}>
                                {vehicle.rank || globalIndex + 1}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Box
                                onClick={(e) => handleChipClick(e, vehicle)}
                                sx={{
                                  ...getVehicleStyle(vehicle),
                                  display:"inline-block",
                                  padding:'5px 15px 3px 15px',
                                  borderRadius:'5px',
                                  fontWeight: 'bold',
                                  fontSize: '1rem',
                                  cursor: 'pointer',
                                  height: isMobile ? 'auto': 24,
                                
                                }}
                              >{vehicle.item }</Box>
                            </TableCell>
                            <TableCell align="left">
                                {vehicle.message_data.length > 0 && (
                                  vehicle.message_data.map((msg, index) => (
                                    <Box
                                      key={index}
                                      onClick={(e) => handleChipClick(e, vehicle)}
                                      sx={{
                                        backgroundColor: theme.palette.error.main,
                                        display: "inline-block",
                                        padding: '4px 8px 2px 8px',
                                        borderRadius: '4px',
                                        fontSize: '0.6rem',
                                        cursor: 'pointer',
                                        color: 'white',
                                        marginRight: '4px', // spacing between chips
                                      }}
                                    >
                                      {msg.message?.FeedbackType || 'No Feedback'}
                                    </Box>
                                  ))
                                )}

                            </TableCell>
                            {/* Performance Score Column - Commented Out */}
                            {/* {showPerformanceScore && (
                              <TableCell align="center">
                                <Rating max={3} name="size-small" defaultValue={3} size="small" />
                              </TableCell>
                            )} */}
                          </TableRow>
                        )
                      })}
                      
                      {/* Fill empty rows */}
                      {slideVehicles.length < itemsPerSlide && Array.from({ 
                        length: Math.min(3, itemsPerSlide - slideVehicles.length) 
                      }).map((_, index) => (
                        <TableRow key={`empty-${index}`} sx={{ opacity: 0.1 }}>
                          <TableCell>&nbsp;</TableCell>
                          <TableCell>&nbsp;</TableCell>
                          <TableCell>&nbsp;</TableCell>
                          {/* {showPerformanceScore && <TableCell>&nbsp;</TableCell>} */}
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
      </Box>
    )
  }

  // Desktop Table View (unchanged from original)
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
          maxHeight: 'calc(100vh - 150px)',
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
               REMARKS
              </TableCell>
              {/* Performance Score Column - Commented Out */}
              {/* {showPerformanceScore && (
                <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>
                  LAST WEEK PERFORMANCE SCORE
                </TableCell>
              )} */}
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredVehicles.map((vehicle, index) => (
              <TableRow
                key={vehicle.id || index}
                sx={getRowStyle(vehicle, index)}
              >
                <TableCell sx={{py:0.5}}>
            <Typography variant="body2" fontWeight="inherit">
                      {vehicle.rank ||index + 1}
                    </Typography>
                </TableCell>
                <TableCell sx={{py:0.5}}>
                            <Box
                                onClick={(e) => handleChipClick(e, vehicle)}
                                sx={{
                                  ...getVehicleStyle(vehicle),
                                  display:"inline-block",
                                  padding:'5px 15px 3px 15px',
                                  borderRadius:'5px',
                                  fontWeight: 'bold',
                                  fontSize: '1rem',
                                  cursor: 'pointer',
                                }}
                              >{vehicle.item }</Box>
                </TableCell>
                <TableCell sx={{py:0.5}} textAlign={'left'}>
 
                {vehicle.message_data.length > 0 && (
                    vehicle.message_data.map((msg, index) => (
                      <Box
                        key={index}
                        onClick={(e) => handleChipClick(e, vehicle)}
                        sx={{
                          backgroundColor: theme.palette.error.main,
                          display: "inline-block",
                          padding: '4px 8px 2px 8px',
                          borderRadius: '4px',
                          fontSize: '0.8rem',
                          cursor: 'pointer',
                          color: 'white',
                          marginRight: '4px', // spacing between chips
                        }}
                      >
                        {msg.message?.FeedbackType || 'No Feedback'}
                      </Box>
                    ))
                  )}

                </TableCell>
                {/* Performance Score Column - Commented Out */}
                {/* {showPerformanceScore && (
                  <TableCell sx={{py:0.5}}>
                     <Rating max={3} name="size-large" defaultValue={3} size="large" />
                  </TableCell>
                )} */}
              </TableRow>
            ))}
            {filteredVehicles.length === 0 && (
              <TableRow>
                <TableCell colSpan={showPerformanceScore ? 4 : 3} align="center" sx={{ py: 4 }}>
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