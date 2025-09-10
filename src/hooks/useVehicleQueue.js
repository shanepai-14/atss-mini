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

      // setVehicles(response.data || [])
      setVehicles([
    {
        "id": 279065,
        "instance": "ICPL",
        "roster_group_id": 5,
        "rank": 1,
        "item_type": 0,
        "item_id": 393,
        "item": "9131",
        "etc": null,
        "etc_indicator": null,
        "score": 10.4715,
        "trial_mix": null,
        "admix": null,
        "cancelled": [],
        "message_data": [],
        "in_progress": 0,
        "completed": 0,
        "delay": 0,
        "next_batching_time": null,
        "priority": false,
        "created_at": "2025-09-08T09:36:12.000000Z",
        "updated_at": "2025-09-10T05:21:51.000000Z",
        "load_capacity": 9.5,
        "home_plant_id": 1,
        "raw_score": [
            {
                "factor_id": 17,
                "name": "Driver Ready",
                "priority": 1,
                "score": 5,
                "factor_score": 5
            },
            {
                "factor_id": 13,
                "name": "Vehicle Breakdown",
                "priority": 2,
                "score": 5,
                "factor_score": 2.5
            },
            {
                "factor_id": 6,
                "name": "Trial Mix",
                "priority": 7,
                "score": 0,
                "factor_score": 0
            },
            {
                "factor_id": 18,
                "name": "Assigned Jobs",
                "priority": 9,
                "score": 5,
                "factor_score": 0.5556,
                "value": 0
            },
            {
                "factor_id": 19,
                "name": "Load Qty (Cumulative)",
                "priority": 8,
                "score": 5,
                "factor_score": 0.625,
                "value": 0
            },
            {
                "factor_id": 2,
                "name": "Priority Vehicle",
                "priority": 3,
                "score": 0,
                "factor_score": 0
            },
            {
                "factor_id": 3,
                "name": "1st Ticket",
                "priority": 4,
                "score": 0.44,
                "factor_score": 0.1103
            },
            {
                "factor_id": 20,
                "name": "Distance Travelled",
                "priority": 8,
                "score": 5,
                "factor_score": 0.625,
                "value": 0
            },
            {
                "factor_id": 21,
                "name": "Job Hours",
                "priority": 9,
                "score": 5,
                "factor_score": 0.5556,
                "value": 0
            },
            {
                "factor_id": 22,
                "name": "Plant to Site Distance",
                "priority": 10,
                "score": 5,
                "factor_score": 0.5,
                "value": 0
            },
            {
                "factor_id": 16,
                "name": "Order Cancel",
                "priority": 6,
                "score": 0,
                "factor_score": 0
            }
        ],
        "ready_timestamp": "2025-09-10 01:45:30",
        "zoning_timestamp": null,
        "available_since": "2025-09-10 01:45:30",
        "vehicle_permits": [],
        "banned_permits": [],
        "preferred_permits": []
    },
    {
        "id": 279080,
        "instance": "ICPL",
        "roster_group_id": 5,
        "rank": 2,
        "item_type": 0,
        "item_id": 443,
        "item": "1031",
        "etc": null,
        "etc_indicator": null,
        "score": 9.9166,
        "trial_mix": null,
        "admix": null,
        "cancelled": [],
        "message_data": [],
        "in_progress": 0,
        "completed": 0,
        "delay": 0,
        "next_batching_time": null,
        "priority": false,
        "created_at": "2025-09-08T10:31:03.000000Z",
        "updated_at": "2025-09-10T09:20:14.000000Z",
        "load_capacity": 12.5,
        "home_plant_id": 1,
        "raw_score": [
            {
                "factor_id": 17,
                "name": "Driver Ready",
                "priority": 1,
                "score": 5,
                "factor_score": 5
            },
            {
                "factor_id": 13,
                "name": "Vehicle Breakdown",
                "priority": 2,
                "score": 5,
                "factor_score": 2.5
            },
            {
                "factor_id": 6,
                "name": "Trial Mix",
                "priority": 7,
                "score": 0,
                "factor_score": 0
            },
            {
                "factor_id": 18,
                "name": "Assigned Jobs",
                "priority": 9,
                "score": 2,
                "factor_score": 0.2222,
                "value": 4
            },
            {
                "factor_id": 19,
                "name": "Load Qty (Cumulative)",
                "priority": 8,
                "score": 5,
                "factor_score": 0.625,
                "value": 23.5
            },
            {
                "factor_id": 2,
                "name": "Priority Vehicle",
                "priority": 3,
                "score": 0,
                "factor_score": 0
            },
            {
                "factor_id": 3,
                "name": "1st Ticket",
                "priority": 4,
                "score": 0,
                "factor_score": 0
            },
            {
                "factor_id": 20,
                "name": "Distance Travelled",
                "priority": 8,
                "score": 5,
                "factor_score": 0.625,
                "value": 40
            },
            {
                "factor_id": 21,
                "name": "Job Hours",
                "priority": 9,
                "score": 4,
                "factor_score": 0.4444,
                "value": 219
            },
            {
                "factor_id": 22,
                "name": "Plant to Site Distance",
                "priority": 10,
                "score": 5,
                "factor_score": 0.5,
                "value": 38
            },
            {
                "factor_id": 16,
                "name": "Order Cancel",
                "priority": 6,
                "score": 0,
                "factor_score": 0
            }
        ],
        "ready_timestamp": "2025-09-10 01:44:58",
        "zoning_timestamp": "2025-09-10 09:19:38",
        "available_since": "2025-09-10 09:19:38",
        "vehicle_permits": [],
        "banned_permits": [],
        "preferred_permits": []
    },
    {
        "id": 279476,
        "instance": "ICPL",
        "roster_group_id": 5,
        "rank": 3,
        "item_type": 0,
        "item_id": 456,
        "item": "2051",
        "etc": null,
        "etc_indicator": null,
        "score": 0,
        "trial_mix": null,
        "admix": null,
        "cancelled": [],
        "message_data": [],
        "in_progress": 0,
        "completed": 0,
        "delay": 0,
        "next_batching_time": null,
        "priority": false,
        "created_at": "2025-09-10T09:02:02.000000Z",
        "updated_at": "2025-09-10T09:20:14.000000Z",
        "load_capacity": 12,
        "home_plant_id": 1,
        "raw_score": [
            {
                "factor_id": 17,
                "name": "Driver Ready",
                "priority": 1,
                "score": 0,
                "factor_score": 0
            },
            {
                "factor_id": 13,
                "name": "Vehicle Breakdown",
                "priority": 2,
                "score": 5,
                "factor_score": 2.5
            },
            {
                "factor_id": 6,
                "name": "Trial Mix",
                "priority": 7,
                "score": 0,
                "factor_score": 0
            },
            {
                "factor_id": 18,
                "name": "Assigned Jobs",
                "priority": 9,
                "score": 5,
                "factor_score": 0.5556,
                "value": 0
            },
            {
                "factor_id": 19,
                "name": "Load Qty (Cumulative)",
                "priority": 8,
                "score": 5,
                "factor_score": 0.625,
                "value": 0
            },
            {
                "factor_id": 2,
                "name": "Priority Vehicle",
                "priority": 3,
                "score": 0,
                "factor_score": 0
            },
            {
                "factor_id": 3,
                "name": "1st Ticket",
                "priority": 4,
                "score": 0,
                "factor_score": 0
            },
            {
                "factor_id": 20,
                "name": "Distance Travelled",
                "priority": 8,
                "score": 5,
                "factor_score": 0.625,
                "value": 0
            },
            {
                "factor_id": 21,
                "name": "Job Hours",
                "priority": 9,
                "score": 5,
                "factor_score": 0.5556,
                "value": 0
            },
            {
                "factor_id": 22,
                "name": "Plant to Site Distance",
                "priority": 10,
                "score": 5,
                "factor_score": 0.5,
                "value": 0
            },
            {
                "factor_id": 16,
                "name": "Order Cancel",
                "priority": 6,
                "score": 0,
                "factor_score": 0
            }
        ],
        "ready_timestamp": null,
        "zoning_timestamp": "2025-09-09 11:02:08",
        "available_since": null,
        "vehicle_permits": [],
        "banned_permits": [],
        "preferred_permits": []
    },
    {
        "id": 279482,
        "instance": "ICPL",
        "roster_group_id": 5,
        "rank": 4,
        "item_type": 0,
        "item_id": 51,
        "item": "9018",
        "etc": null,
        "etc_indicator": null,
        "score": 0,
        "trial_mix": null,
        "admix": null,
        "cancelled": [],
        "message_data": [],
        "in_progress": 0,
        "compensated" : true,
        "completed": 0,
        "delay": 0,
        "next_batching_time": null,
        "priority": true,
        "created_at": "2025-09-10T09:20:14.000000Z",
        "updated_at": "2025-09-10T09:20:14.000000Z",
        "load_capacity": 9,
        "home_plant_id": 1,
        "raw_score": [
            {
                "factor_id": 17,
                "name": "Driver Ready",
                "priority": 1,
                "score": 0,
                "factor_score": 0
            },
            {
                "factor_id": 13,
                "name": "Vehicle Breakdown",
                "priority": 2,
                "score": 5,
                "factor_score": 0
            },
            {
                "factor_id": 6,
                "name": "Trial Mix",
                "priority": 7,
                "score": 5,
                "factor_score": 0.7143
            },
            {
                "factor_id": 18,
                "name": "Assigned Jobs",
                "priority": 9,
                "score": 3,
                "factor_score": 0.3333,
                "value": 2
            },
            {
                "factor_id": 19,
                "name": "Load Qty (Cumulative)",
                "priority": 8,
                "score": 5,
                "factor_score": 0.625,
                "value": 15
            },
            {
                "factor_id": 2,
                "name": "Priority Vehicle",
                "priority": 3,
                "score": 0,
                "factor_score": 0
            },
            {
                "factor_id": 3,
                "name": "1st Ticket",
                "priority": 4,
                "score": 0,
                "factor_score": 0
            },
            {
                "factor_id": 20,
                "name": "Distance Travelled",
                "priority": 8,
                "score": 5,
                "factor_score": 0.625,
                "value": 0
            },
            {
                "factor_id": 21,
                "name": "Job Hours",
                "priority": 9,
                "score": 5,
                "factor_score": 0.5556,
                "value": 0
            },
            {
                "factor_id": 22,
                "name": "Plant to Site Distance",
                "priority": 10,
                "score": 5,
                "factor_score": 0.5,
                "value": 16
            },
            {
                "factor_id": 16,
                "name": "Order Cancel",
                "priority": 6,
                "score": 0,
                "factor_score": 0
            }
        ],
        "ready_timestamp": null,
        "zoning_timestamp": "2025-09-10 09:00:59",
        "available_since": null,
        "vehicle_permits": [],
        "banned_permits": [],
        "preferred_permits": []
    }
])
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