import React from 'react'
import { Box, Stack, Typography, useTheme, useMediaQuery, TextField } from '@mui/material'
import { Search as SearchIcon } from '@mui/icons-material'

const vehicleQue = [
  {
    label: 'Immediate Attention',
    backgroundColor: '#C00000',
    textColor: 'white',
    priority: false,
  },
  {
    label: 'Recommendation',
    backgroundColor: '#3C7D21',
    textColor: 'white',
    priority: false,
  },
  {
    label: 'Priority',
    backgroundColor: '#FFFF00',
    textColor: 'black',
    priority: true,
  },
  {
    label: 'Compensate',
    backgroundColor: '#FFC000',
    textColor: 'black',
    priority: true,
  },
]

const VehicleQLabel = ({ label, boxColor, textColor, priority = false, isMobile }) => {
  return (
    <Stack spacing={1} direction={'row'} display="flex" alignItems="center">
      <Box 
        width="1rem" 
        height="1rem" 
        sx={{ 
          backgroundColor: priority ? 'none' : boxColor, 
          border: priority ? `3px solid ${boxColor}` : 'none'  
        }} 
      />
      <Typography
        variant="body2"
        component="span"
        color={textColor}
        fontWeight="bold"
        sx={{
          fontSize: isMobile ? '0.60rem' : '0.875rem',
          whiteSpace: 'nowrap',
          overflow: 'hidden'
        }}
      >
        {label == 'Immediate Attention' && isMobile ? 'Attention' : label}
      </Typography>
    </Stack>
  )
}

const VehicleLegend = ({ searchTerm, onSearchChange, settings }) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  return (
    <Box sx={{ mb: 2 }}>
      <Stack 
        direction={isMobile ? "column" : "row"}
        justifyContent="space-between"
        alignItems={isMobile ? "stretch" : "center"}
        spacing={2}
        sx={{ mb: 2 }}
      >
        <Stack direction="row" spacing={isMobile ? 1 : 2} flexWrap="wrap" alignItems="center">
          {vehicleQue
            .filter(que => settings.legend?.[que.label] !== false)
            .map(que => (
              <VehicleQLabel
                key={que.label}
                label={que.label}
                boxColor={que.backgroundColor}
                textColor={theme.palette.text.primary}
                priority={que.priority}
                isMobile={isMobile}
              />
            ))
          }
        </Stack>

        <TextField
          size="small"
          placeholder="Search vehicles..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          InputProps={{
            startAdornment: <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />,
          }}
          sx={{ minWidth: isMobile ? '100%' : 200 }}
        />
      </Stack>
    </Box>
  )
}

export default VehicleLegend