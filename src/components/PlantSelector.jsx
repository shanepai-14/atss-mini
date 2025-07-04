import React, { useState, useEffect, useRef } from 'react'
import { 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Box,
  Typography 
} from '@mui/material'
import { axiosFindPlusInstance } from '../api/axiosInstance'

const PlantSelector = ({ selectedPlant, onPlantChange }) => {
  const [plants, setPlants] = useState([])
  const [loading, setLoading] = useState(true)
  const hasFetchedRef = useRef(false)

  useEffect(() => {
    // Only fetch once on mount
    if (hasFetchedRef.current) return
    hasFetchedRef.current = true

    const fetchPlants = async () => {
      try {
        // Use the correct FindPlus API endpoint for zones/origins
        const response = await axiosFindPlusInstance.post('/Zone/origin')
        const plantsData = response.data || []
       setPlants([plantsData[6]])
        
        // Auto-select first plant if none selected
        if (plantsData.length > 0 && !selectedPlant) {
          onPlantChange(plantsData[6])
        }
      } catch (error) {
        console.error('Failed to fetch plants:', error)
        // Fallback: create a default plant if API fails
        const defaultPlant = { 
          ZoneID: '1', 
          Name: 'SK',
          // Add other fields that might be expected
          ID: '1'
        }
        setPlants([defaultPlant])
        if (!selectedPlant) {
          onPlantChange(defaultPlant)
        }
      } finally {
        setLoading(false)
      }
    }

    fetchPlants()
  }, []) // Remove dependencies to prevent re-fetching

  return (
    <Box sx={{ minWidth: 200 }}>
      <FormControl fullWidth disabled={loading}  size="small">
        <InputLabel>Batching Plant</InputLabel>
        <Select
          size='small'
          value={selectedPlant?.ZoneID || selectedPlant?.ID || ''}
          label="Batching Plant"
          onChange={(e) => {
            const plant = plants.find(p => 
              (p.ZoneID === e.target.value) || (p.ID === e.target.value)
            )
            onPlantChange(plant)
          }}
        >
          {plants.map((plant) => (
            <MenuItem 
              key={plant.ZoneID || plant.ID} 
              value={plant.ZoneID || plant.ID}
            >
              {plant.Name || plant.name || `Plant ${plant.ZoneID || plant.ID}`}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  )
}

export default PlantSelector