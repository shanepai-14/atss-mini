import { useState, useEffect, useRef } from "react";
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
} from "@mui/material";
import { axiosATSSInstance } from "../api/axiosInstance";

const PlantSelector = ({ selectedPlant, onPlantChange, serviceCode , companyID }) => {
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    // Only fetch once on mount
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;

    const fetchPlants = async () => {
      try {
        // Use the correct FindPlus API endpoint for zones/origins
        const response = await axiosATSSInstance.get("vehicle-roster/active");
        const plantsData = response.data || [];
        const activePlants = plantsData.filter(
          (plant) => plant.is_active && plant.Name !== "PUNGGOL TIMOR"
        );

        setPlants(activePlants);

        // Auto-select first plant if none selected
        if (activePlants.length > 0 && !selectedPlant) {
          if (serviceCode === "SGP" || serviceCode === "Default") {
            onPlantChange(activePlants[4] || activePlants[0]);
          } else if (serviceCode === "ICPL" && companyID == 2) {
            onPlantChange(activePlants[6] || activePlants[0]);
          } else {
            onPlantChange(activePlants[0]);
          }
        }
      } catch (error) {
        console.error("Failed to fetch plants:", error);
        // Fallback: create a default plant if API fails
        const defaultPlant = {
          ZoneID: "1",
          Name: "SK",
          // Add other fields that might be expected
          ID: "1",
        };
        setPlants([defaultPlant]);
        if (!selectedPlant) {
          onPlantChange(defaultPlant);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPlants();
  }, []); // Remove dependencies to prevent re-fetching

  return (
    <Box sx={{ minWidth: 200 }}>
      <FormControl fullWidth disabled={loading} size="small">
        <InputLabel>Batching Plant</InputLabel>
        <Select
          size="small"
          value={selectedPlant?.ZoneID || selectedPlant?.ID || ""}
          label="Batching Plant"
          onChange={(e) => {
            const plant = plants.find(
              (p) => p.ZoneID === e.target.value || p.ID === e.target.value
            );
            onPlantChange(plant);
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
  );
};

export default PlantSelector;
