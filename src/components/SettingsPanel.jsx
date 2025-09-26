// src/components/SettingsPanel.jsx
import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControlLabel,
  Switch,
  Box,
  Typography,
  Divider,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert
} from '@mui/material'
import {
  Close as CloseIcon,
  ExpandMore as ExpandMoreIcon,
  RestoreOutlined as ResetIcon
} from '@mui/icons-material'
import { settingsManager } from '../utils/settingsManager'

const SettingsPanel = ({ open, onClose, onSettingsChange, vehicles = [] }) => {
  const [settings, setSettings] = useState({})
  const [isFactorScoresRestricted, setIsFactorScoresRestricted] = useState(false)

  useEffect(() => {
    if (open) {
      loadSettings()
    }
  }, [open, vehicles])

  const loadSettings = () => {
    // Initialize factor scores based on vehicle data
    settingsManager.initializeFactorScores(vehicles)
    
    const currentSettings = settingsManager.getSettings()
    setSettings(currentSettings)
    setIsFactorScoresRestricted(settingsManager.isFactorScoresRestricted())
  }

  const handleSettingChange = (key, value) => {
    const updatedSettings = { ...settings, [key]: value }
    setSettings(updatedSettings)
    settingsManager.updateSetting(key, value)
    onSettingsChange?.(updatedSettings)
  }

  const handleFactorScoreChange = (factorId, enabled) => {
    const updatedFactorScores = settings.factorScores.map(factor => 
  factor.factor_id === factorId 
    ? { ...factor, show: enabled }
    : factor
)
    const updatedSettings = { ...settings, factorScores: updatedFactorScores }
    setSettings(updatedSettings)
    settingsManager.updateFactorScore(factorId, enabled)
    onSettingsChange?.(updatedSettings)
  }

  const handleLegendChange = (legendLabel, enabled) => {
    const updatedLegend = { ...settings.legend, [legendLabel]: enabled }
    const updatedSettings = { ...settings, legend: updatedLegend }
    setSettings(updatedSettings)
    settingsManager.updateLegendSetting(legendLabel, enabled)
    onSettingsChange?.(updatedSettings)
  }

  const handleResetToDefaults = () => {
    const defaultSettings = settingsManager.resetToDefaults()
    setSettings(defaultSettings)
    onSettingsChange?.(defaultSettings)
  }

  const factorScoreEntries = settings.factorScores || {};
  const legendEntries = Object.entries(settings.legend || {})

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        Display Settings
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent dividers>

        {/* Tooltip Information Settings */}
        <Typography variant="h6" gutterBottom>
          Tooltip Information
        </Typography>
        <Box sx={{ ml: 2, mb: 3 }}>
          <FormControlLabel
            control={
              <Switch
                checked={settings.showQueue || false}
                onChange={(e) => handleSettingChange('showQueue', e.target.checked)}
              />
            }
            label="Queue #"
          />
          <FormControlLabel
            control={
              <Switch
                checked={settings.showAvailableSince || false}
                onChange={(e) => handleSettingChange('showAvailableSince', e.target.checked)}
              />
            }
            label="Available Since"
          />
          <FormControlLabel
            control={
              <Switch
                checked={settings.zoningTimestamp || false}
                onChange={(e) => handleSettingChange('zoningTimestamp', e.target.checked)}
              />
            }
            label="Zone Entry"
          />
          <FormControlLabel
            control={
              <Switch
                checked={settings.showLoadQty || false}
                onChange={(e) => handleSettingChange('showLoadQty', e.target.checked)}
              />
            }
            label="Load Qty"
          />
          <FormControlLabel
            control={
              <Switch
                checked={settings.showScore || false}
                onChange={(e) => handleSettingChange('showScore', e.target.checked)}
              />
            }
            label="Score"
          />
          <FormControlLabel
            control={
              <Switch
                checked={settings.showJobCount || false}
                onChange={(e) => handleSettingChange('showJobCount', e.target.checked)}
              />
            }
            label="Job Count"
          />
          <FormControlLabel
            control={
              <Switch
                checked={settings.showMileage || false}
                onChange={(e) => handleSettingChange('showMileage', e.target.checked)}
              />
            }
            label="Mileage (KM)"
          />
          <FormControlLabel
            control={
              <Switch
                checked={settings.showJobQuantity || false}
                onChange={(e) => handleSettingChange('showJobQuantity', e.target.checked)}
              />
            }
            label="Job Quantity"
          />
          <FormControlLabel
            control={
              <Switch
                checked={settings.showJobHours || false}
                onChange={(e) => handleSettingChange('showJobHours', e.target.checked)}
              />
            }
            label="Job Hours"
          />
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Factor Scores Settings */}
        <Accordion disabled={isFactorScoresRestricted}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
              <Typography variant="h6">Factor Scores</Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.showFactorScores && !isFactorScoresRestricted}
                    onChange={(e) => handleSettingChange('showFactorScores', e.target.checked)}
                    disabled={isFactorScoresRestricted}
                    onClick={(e) => e.stopPropagation()}
                  />
                }
                label="Show Section"
                onClick={(e) => e.stopPropagation()}
              />
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{ ml: 2 }}>
          {factorScoreEntries.length > 0 ? (
            factorScoreEntries.map((factor) => (
              <FormControlLabel
                key={factor.factor_id}
                control={
                  <Switch
                    checked={factor.show && !isFactorScoresRestricted}
                    onChange={(e) =>
                      handleFactorScoreChange(factor.factor_id, e.target.checked)
                    }
                    disabled={isFactorScoresRestricted}
                  />
                }
                label={factor.name}
              />
            ))
          ) : (
            <Typography variant="body2" color="textSecondary">
              No factor scores available. Load vehicle data to see options.
            </Typography>
          )}


            </Box>
          </AccordionDetails>
        </Accordion>

        <Divider sx={{ my: 2 }} />

        {/* Vehicle Legend Settings */}
        <Typography variant="h6" gutterBottom>
          Vehicle Legend
        </Typography>
        <Box sx={{ ml: 2 }}>
          {legendEntries.map(([legendLabel, enabled]) => (
            <FormControlLabel
              key={legendLabel}
              control={
                <Switch
                  checked={enabled || false}
                  onChange={(e) => handleLegendChange(legendLabel, e.target.checked)}
                />
              }
              label={legendLabel}
            />
          ))}
        </Box>
      </DialogContent>

      <DialogActions>
        <Button
          startIcon={<ResetIcon />}
          onClick={handleResetToDefaults}
          color="secondary"
        >
          Reset to Defaults
        </Button>
        <Button onClick={onClose} variant="contained">
          Done
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default SettingsPanel