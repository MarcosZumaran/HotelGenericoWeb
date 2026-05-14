import { useState, useEffect, useRef } from 'react';
import * as signalR from '@microsoft/signalr';

const API_BASE_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5054';

export function useSignalR(eventName, callback) {
  const [isConnected, setIsConnected] = useState(false);
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    const connection = new signalR.HubConnectionBuilder()
      .withUrl(`${API_BASE_URL}/hotelhub`, {
        accessTokenFactory: () => localStorage.getItem('token')
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
      .configureLogging(signalR.LogLevel.Warning)
      .build();

    const handler = (data) => {
      if (callbackRef.current) {
        callbackRef.current(data);
      }
    };

    connection.on(eventName, handler);

    connection.start()
      .then(() => setIsConnected(true))
      .catch(err => console.error('SignalR connection error:', err));

    connection.onreconnecting(() => setIsConnected(false));
    connection.onreconnected(() => setIsConnected(true));
    connection.onclose(() => setIsConnected(false));

    return () => {
      connection.off(eventName, handler);
      connection.stop();
    };
  }, [eventName]);

  return { isConnected };
}

export default useSignalR;