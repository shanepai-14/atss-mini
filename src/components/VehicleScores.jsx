import { Typography } from '@mui/material'

const VehicleScores = ({ vehicle, factorSettings = [] }) => {
  if (!vehicle || !vehicle.raw_score) return null

  const scores = vehicle.raw_score
  const sortedScores = [...scores].sort((a, b) => a.priority - b.priority)

  // Convert factorSettings array into a lookup map by factor_id
  const settingsMap = factorSettings.reduce((map, factor) => {
    map[factor.factor_id] = factor.show
    return map
  }, {})

  return (
    <>
      {sortedScores.map((data, index) =>
        settingsMap[data.factor_id] !== false && (
          <Typography key={data.factor_id} variant="body2">
            {parseFloat(data.score).toFixed(2)} - {data.name}
          </Typography>
        )
      )}
    </>
  )
}


export default VehicleScores