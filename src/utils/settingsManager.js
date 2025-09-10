// src/utils/settingsManager.js
import { getAuthData } from '../api/auth'

// Default settings structure for regular users
const DEFAULT_SETTINGS = {
  showQueue: true,
  showAvailableSince: true,
  showLoadQty: true,
  showScore: true,
  showJobCount: true,
  showMileage: true,
  showJobQuantity: true,
  showJobHours: true,
  showFactorScores: true,
  factorScores: [
    {
      "factor_id": 17,
      "name": "Driver Ready",
      "priority": 1,
      "show": true
    },
    {
      "factor_id": 13,
      "name": "Vehicle Breakdown",
      "priority": 2,
      "show": true
    },
    {
      "factor_id": 6,
      "name": "Trial Mix",
      "priority": 7,
      "show": true
    },
    {
      "factor_id": 18,
      "name": "Assigned Jobs",
      "priority": 9,
      "show": true
    },
    {
      "factor_id": 19,
      "name": "Load Qty (Cumulative)",
      "priority": 8,
      "show": true
    },
    {
      "factor_id": 2,
      "name": "Priority Vehicle",
      "priority": 3,
      "show": true
    },
    {
      "factor_id": 3,
      "name": "1st Ticket",
      "priority": 4,
      "show": true
    },
    {
      "factor_id": 20,
      "name": "Distance Travelled",
      "priority": 8,
      "show": true
    },
    {
      "factor_id": 21,
      "name": "Job Hours",
      "priority": 9,
      "show": true
    },
    {
      "factor_id": 22,
      "name": "Plant to Site Distance",
      "priority": 10,
      "show": true
    },
    {
      "factor_id": 16,
      "name": "Order Cancel",
      "priority": 6,
      "show": true
    }
  ],
  legend: {
    "Immediate Attention": true,
    "Recommendation": true,
    "Priority": true,
    "Compensate": true
  }
}

// Default settings for SGP service code
const DEFAULT_SETTINGS_SGP = {
  showQueue: true,
  showAvailableSince: true,
  showLoadQty: true,
  showScore: true,
  showJobCount: true,
  showMileage: true,
  showJobQuantity: true,
  showJobHours: true,
  showFactorScores: false,
  factorScores: [
    {
      "factor_id": 17,
      "name": "Driver Ready",
      "priority": 1,
      "show": false
    },
    {
      "factor_id": 13,
      "name": "Vehicle Breakdown",
      "priority": 2,
      "show": false
    },
    {
      "factor_id": 6,
      "name": "Trial Mix",
      "priority": 7,
      "show": false
    },
    {
      "factor_id": 18,
      "name": "Assigned Jobs",
      "priority": 9,
      "show": false
    },
    {
      "factor_id": 19,
      "name": "Load Qty (Cumulative)",
      "priority": 8,
      "show": false
    },
    {
      "factor_id": 2,
      "name": "Priority Vehicle",
      "priority": 3,
      "show": false
    },
    {
      "factor_id": 3,
      "name": "1st Ticket",
      "priority": 4,
      "show": false
    },
    {
      "factor_id": 20,
      "name": "Distance Travelled",
      "priority": 8,
      "show": false
    },
    {
      "factor_id": 21,
      "name": "Job Hours",
      "priority": 9,
      "show": false
    },
    {
      "factor_id": 22,
      "name": "Plant to Site Distance",
      "priority": 10,
      "show": false
    },
    {
      "factor_id": 16,
      "name": "Order Cancel",
      "priority": 6,
      "show": false
    }
  ],
  legend: {
    "Immediate Attention": false,
    "Recommendation": true,
    "Priority": false,
    "Compensate": false
  }
}

export class SettingsManager {
  constructor() {
    this.storageKey = 'atss_settings'
  }

  // Get appropriate default settings based on ServiceCode
  getDefaultSettings(serviceCode) {
    switch (serviceCode) {
      case 'SGP':
        return JSON.parse(JSON.stringify(DEFAULT_SETTINGS_SGP)) 
      case 'Default':
        return JSON.parse(JSON.stringify(DEFAULT_SETTINGS_SGP))   
      default:
        return JSON.parse(JSON.stringify(DEFAULT_SETTINGS)) // Deep copy
    }
  }

  // Check if ServiceCode has restrictions
  isRestrictedServiceCode(serviceCode) {
    const restrictedServiceCodes = ['SGP','Default']
    return restrictedServiceCodes.includes(serviceCode)
  }

  // Get raw stored settings without any defaults applied
  getStoredSettings() {
    try {
      const stored = localStorage.getItem(this.storageKey)
      return stored ? JSON.parse(stored) : {}
    } catch (error) {
      console.error('Error loading stored settings:', error)
      return {}
    }
  }

  // Get settings with ServiceCode-specific defaults
  getSettings() {
    const authData = getAuthData()
    const serviceCode = authData?.ServiceCode
    
    // Get appropriate defaults for this service code
    const defaultSettings = this.getDefaultSettings(serviceCode)
    
    // Get stored user preferences
    const storedSettings = this.getStoredSettings()
    
    // Merge settings - stored preferences override defaults
    const mergedSettings = this.mergeSettings(defaultSettings, storedSettings)
    
    // Apply ServiceCode restrictions (always enforce for restricted codes)
    // if (this.isRestrictedServiceCode(serviceCode)) {
    //   mergedSettings.showFactorScores = false
    //   if (Array.isArray(mergedSettings.factorScores)) {
    //     mergedSettings.factorScores = mergedSettings.factorScores.map(factor => ({
    //       ...factor,
    //       show: false
    //     }))
    //   }
    // }
    
    return mergedSettings
  }

  // Smart merge function to handle arrays and objects properly
  mergeSettings(defaults, stored) {
    const merged = { ...defaults }
    
    // Handle each property carefully
    Object.keys(stored).forEach(key => {
      if (key === 'factorScores') {
        // For factorScores, merge by factor_id
        if (Array.isArray(stored.factorScores) && Array.isArray(defaults.factorScores)) {
          merged.factorScores = defaults.factorScores.map(defaultFactor => {
            const storedFactor = stored.factorScores.find(f => f.factor_id === defaultFactor.factor_id)
            return storedFactor ? { ...defaultFactor, ...storedFactor } : defaultFactor
          })
        } else if (Array.isArray(stored.factorScores)) {
          merged.factorScores = stored.factorScores
        }
      } else if (key === 'legend') {
        // For legend, merge object properties
        merged.legend = { ...defaults.legend, ...stored.legend }
      } else {
        // For simple properties, stored value wins
        merged[key] = stored[key]
      }
    })
    
    return merged
  }

  // Get user settings with current service code defaults
  getUserSettings() {
    const authData = getAuthData()
    const serviceCode = authData?.ServiceCode
    const defaultSettings = this.getDefaultSettings(serviceCode)
    const storedSettings = this.getStoredSettings()
    
    return this.mergeSettings(defaultSettings, storedSettings)
  }

  // Save user preferences to localStorage
  saveUserSettings(settings) {
    try {
      const currentSettings = this.getStoredSettings()
      const updatedSettings = { ...currentSettings, ...settings }
      localStorage.setItem(this.storageKey, JSON.stringify(updatedSettings))
      return updatedSettings
    } catch (error) {
      console.error('Error saving user settings:', error)
      return this.getStoredSettings()
    }
  }

  // Update a specific setting (user preference only)
  updateSetting(key, value) {
    // Don't allow changing restricted settings for restricted service codes
    const authData = getAuthData()
    // const serviceCode = authData?.ServiceCode
    
    // if (this.isRestrictedServiceCode(serviceCode) && key === 'showFactorScores' && value === true) {
    //   console.warn('Cannot enable Factor Scores for restricted service code:', serviceCode)
    //   return this.getSettings()
    // }
    
    const currentSettings = this.getStoredSettings()
    currentSettings[key] = value
    this.saveUserSettings(currentSettings)
    return this.getSettings()
  }

  // Update factor score settings (user preference only)
  updateFactorScore(factorId, enabled) {
    // Don't allow enabling factor scores for restricted service codes
    const authData = getAuthData()
    const serviceCode = authData?.ServiceCode
    
    // if (this.isRestrictedServiceCode(serviceCode) && enabled) {
    //   console.warn('Cannot enable factor scores for restricted service code:', serviceCode)
    //   return this.getSettings()
    // }
    
    const currentSettings = this.getStoredSettings()
    
    // Initialize factorScores if not exists
    if (!Array.isArray(currentSettings.factorScores)) {
      const defaultSettings = this.getDefaultSettings(serviceCode)
      currentSettings.factorScores = [...defaultSettings.factorScores]
    }
    
    // Find and update the factor by ID
    const factorIndex = currentSettings.factorScores.findIndex(factor => factor.factor_id === factorId)
    if (factorIndex !== -1) {
      currentSettings.factorScores[factorIndex] = {
        ...currentSettings.factorScores[factorIndex],
        show: enabled
      }
    }
    
    this.saveUserSettings(currentSettings)
    return this.getSettings()
  }

  // Update legend settings (user preference only)
  updateLegendSetting(legendLabel, enabled) {
    const currentSettings = this.getStoredSettings()
    if (!currentSettings.legend) {
      const authData = getAuthData()
      const serviceCode = authData?.ServiceCode
      const defaultSettings = this.getDefaultSettings(serviceCode)
      currentSettings.legend = { ...defaultSettings.legend }
    }
    currentSettings.legend[legendLabel] = enabled
    this.saveUserSettings(currentSettings)
    return this.getSettings()
  }

  // Reset to defaults based on current ServiceCode
  resetToDefaults() {
    localStorage.removeItem(this.storageKey)
    const authData = getAuthData()
    const serviceCode = authData?.ServiceCode
    return this.getDefaultSettings(serviceCode)
  }

  // Initialize factor scores based on service code defaults
  initializeFactorScores(vehicles) {
    if (!vehicles || vehicles.length === 0) return

    const authData = getAuthData()
    const serviceCode = authData?.ServiceCode
    
    const currentSettings = this.getStoredSettings()
    
    // If factorScores doesn't exist or is not an array, use defaults
    if (!Array.isArray(currentSettings.factorScores)) {
      const defaultSettings = this.getDefaultSettings(serviceCode)
      currentSettings.factorScores = [...defaultSettings.factorScores]
      this.saveUserSettings(currentSettings)
    }
  }

  // Check if ServiceCode restricts factor scores
  isFactorScoresRestricted() {
    // const authData = getAuthData()
    // const serviceCode = authData?.ServiceCode
    // return this.isRestrictedServiceCode(serviceCode)

    return false;
  }

  // Get current ServiceCode
  getCurrentServiceCode() {
    const authData = getAuthData()
    return authData?.ServiceCode || 'Unknown'
  }

  // Check if a specific feature is available for current user
  isFeatureAvailable(featureName) {
    const settings = this.getSettings()
    
    switch (featureName) {
      case 'factorScores':
        return settings.showFactorScores
      default:
        return settings[featureName] !== false
    }
  }

  // Get available legend options for current service code
  getAvailableLegendOptions() {
    const authData = getAuthData()
    const serviceCode = authData?.ServiceCode
    const defaultSettings = this.getDefaultSettings(serviceCode)
    
    return Object.keys(defaultSettings.legend)
  }

  // Check if user can modify a specific setting
  canModifySetting(settingKey) {
    const authData = getAuthData()
    const serviceCode = authData?.ServiceCode
    
    if (this.isRestrictedServiceCode(serviceCode)) {
      // Restricted service codes cannot enable factor scores
      if (settingKey === 'showFactorScores') {
        return false
      }
      if (settingKey.startsWith('factorScores.')) {
        return false
      }
    }
    
    return true
  }

  // Get factor score by ID
  getFactorScoreById(factorId) {
    const settings = this.getSettings()
    if (Array.isArray(settings.factorScores)) {
      return settings.factorScores.find(factor => factor.factor_id === factorId)
    }
    return null
  }

  // Get all enabled factor scores
  getEnabledFactorScores() {
    const settings = this.getSettings()
    if (Array.isArray(settings.factorScores)) {
      return settings.factorScores.filter(factor => factor.show)
    }
    return []
  }

  // Debug method to see current state
  debugSettings() {
    const authData = getAuthData()
    const serviceCode = authData?.ServiceCode
    
    console.log('=== Settings Manager Debug ===')
    console.log('ServiceCode:', serviceCode)
    console.log('Is Restricted:', this.isRestrictedServiceCode(serviceCode))
    console.log('Default Settings:', this.getDefaultSettings(serviceCode))
    console.log('Stored Settings:', this.getStoredSettings())
    console.log('Final Settings:', this.getSettings())
    console.log('=============================')
  }
}

// Create singleton instance
export const settingsManager = new SettingsManager()