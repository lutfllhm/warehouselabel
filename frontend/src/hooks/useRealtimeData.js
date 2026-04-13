import { useEffect, useCallback } from 'react';
import { getSocket } from '../utils/socket.js';

/**
 * Hook untuk listen realtime data updates dari server
 * @param {string[]} eventTypes - Array of event types to listen (e.g., ['material-stocks', 'label-stocks'])
 * @param {Function} onUpdate - Callback function yang dipanggil saat ada update
 */
export function useRealtimeData(eventTypes, onUpdate) {
  const handleDataUpdate = useCallback((payload) => {
    // Check if this update is relevant to our event types
    if (eventTypes.includes(payload.type)) {
      console.log('📡 Realtime update received:', payload.type, payload.data);
      onUpdate(payload);
    }
  }, [eventTypes, onUpdate]);

  useEffect(() => {
    const socket = getSocket();
    
    // Listen to data-update events
    socket.on('data-update', handleDataUpdate);

    // Cleanup
    return () => {
      socket.off('data-update', handleDataUpdate);
    };
  }, [handleDataUpdate]);
}
