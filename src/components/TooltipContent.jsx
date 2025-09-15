import { Box, Typography } from '@mui/material'
import VehicleScores from './VehicleScores'

const parseDate = (date) => {
  if (!date) return 'N/A'
  const tempDate = new Date(date)
  tempDate.setHours(tempDate.getHours())
  const month = tempDate.toLocaleString('default', { month: 'short' })
  const day = tempDate.toLocaleString('default', { day: '2-digit' })
  const time = tempDate.toLocaleString('default', { timeStyle: 'short', hour12: false })
  return `${day}-${month}, ${time}`
}

const convertMinutesToHours = (minutes) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
}

const TooltipContent = ({ vehicle, settings, serviceCode }) => (
  <Box p={2} maxWidth={300}>
    {settings.showQueue && (
      <Typography variant="body2">Queue #: {vehicle.rank || 'N/A'}</Typography>
    )}
    {settings.showAvailableSince && (
      <Typography variant="body2">Available Since: {parseDate(vehicle.available_since)}</Typography>
    )}
    {settings.showLoadQty && (
      <Typography variant="body2">Load Qty: {vehicle.feedback_qty || 0}/{vehicle?.load_capacity || 0}</Typography>
    )}
    {settings.showScore && (
      <Typography variant="body2">Score: {vehicle.score || 0}</Typography>
    )}
    {settings.showJobCount && vehicle.raw_score?.[3] && (
      <Typography variant="body2">Job Count: {vehicle.raw_score[3].value || 0}</Typography>
    )}
    {settings.showMileage && vehicle.raw_score?.[7] && (
      <Typography variant="body2">Mileage (KM): {vehicle.raw_score[7].value || 0}</Typography>
    )}
    {settings.showJobQuantity && vehicle.raw_score?.[4] && (
      <Typography variant="body2">Job Quantity: {vehicle.raw_score[4].value || 0}</Typography>
    )}
    {settings.showJobHours && vehicle.raw_score?.[8] && (
      <Typography variant="body2">Job Hours: {convertMinutesToHours(vehicle.raw_score[8].value) || 0}</Typography>
    )}
    
    {settings.showFactorScores && (
      <>
        <Typography variant="body2" sx={{ mt: 1, mb: 1 }}>
          ---------------Factor Scores---------------
        </Typography>
        <VehicleScores vehicle={vehicle} factorSettings={settings.factorScores} />
      </>
    )}
  </Box>
)

export default TooltipContent