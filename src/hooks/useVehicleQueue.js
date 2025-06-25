import { useState, useEffect, useRef, useCallback } from 'react'
import { axiosATSSInstance } from '../api/axiosInstance'
import { debounce } from 'lodash'
import Pusher from 'pusher-js'

const PUSHER_KEY = import.meta.env.VITE_PUSHER_KEY
const PUSHER_CLUSTER = import.meta.env.VITE_PUSHER_CLUSTER

let pusherInstance = null

const getPusher = () => {
  if (!pusherInstance) {
    pusherInstance = new Pusher(PUSHER_KEY, { cluster: PUSHER_CLUSTER })
  }
  return pusherInstance
}

export const useVehicleQueue = (selectedPlant) => {
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastUpdate, setLastUpdate] = useState(null)
  
  const channelRef = useRef(null)
  const abortControllerRef = useRef(new AbortController())
  const lastPlantIdRef = useRef(null)

  const fetchVehicleQueue = useCallback(async (silent = false) => {
    if (!selectedPlant?.ZoneID) return

    try {
      if (!silent) {
        setLoading(true)
        setError(null)
      }

      // Cancel previous request
      abortControllerRef.current.abort()
      abortControllerRef.current = new AbortController()

      const response = await axiosATSSInstance.get(
        `/vehicle/priority?origin_id=${selectedPlant.ZoneID}&permits=false`,
        { signal: abortControllerRef.current.signal }
      )

      setVehicles(response.data || [])
      if (!silent) setLoading(false)
      setLastUpdate(new Date())
    } catch (err) {
      if (!abortControllerRef.current.signal.aborted) {
        setError(err.message || 'Failed to fetch vehicle queue')
        if (!silent) setLoading(false)
      }
    }
  }, [selectedPlant?.ZoneID])

  // Debounced refresh function for real-time updates
  const debouncedRefresh = useCallback(
    debounce(() => {
      fetchVehicleQueue(true) // Silent refresh
    }, 1000),
    [fetchVehicleQueue]
  )

  // Setup Pusher and initial fetch - only when plant changes
  useEffect(() => {
    if (!selectedPlant?.ZoneID || lastPlantIdRef.current === selectedPlant.ZoneID) return
    
    lastPlantIdRef.current = selectedPlant.ZoneID

    const account = JSON.parse(localStorage.getItem('atss_account') || '{}')
    const serviceCode = account.ServiceCode || account.UserIDEx?.split(':')[0]

    if (!serviceCode) return

    // Clean up previous channel
    if (channelRef.current) {
      channelRef.current.unbind_all()
      channelRef.current.unsubscribe()
      channelRef.current = null
    }

    const pusher = getPusher()
    const channel = pusher.subscribe(`vehicle-ranking-${selectedPlant.ZoneID}-${serviceCode}`)
    channelRef.current = channel

    // Bind to real-time updates
    channel.bind('vehicle-ranking-updated', debouncedRefresh)

    // Initial fetch only when plant changes
    fetchVehicleQueue()

    return () => {
      if (channelRef.current) {
        channelRef.current.unbind_all()
        channelRef.current.unsubscribe()
        channelRef.current = null
      }
    }
  }, [selectedPlant?.ZoneID, fetchVehicleQueue, debouncedRefresh])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      abortControllerRef.current.abort()
    }
  }, [])

  const retry = () => {
    fetchVehicleQueue()
  }

  const refresh = () => {
    console.log('refresh')
    fetchVehicleQueue(true)
  }

  return {
    vehicles,
    loading,
    error,
    lastUpdate,
    retry, 
    refresh
  }
}