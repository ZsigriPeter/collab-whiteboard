import { create } from 'zustand';

let socket = null;

export const useRealtimeStore = create((set, get) => ({
  isConnected: false,
  onlineUsers: [],

  connect: (whiteboardId, token) => {
    if (socket?.readyState === WebSocket.OPEN) return;

    const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
    const url = `${protocol}://${window.location.hostname}/ws/${whiteboardId}?token=${encodeURIComponent(token)}`;

    socket = new WebSocket(url);

    socket.onopen = () => {
      console.log('WebSocket Connected');
      set({ isConnected: true });
    };

    socket.onmessage = (event) => {
      const msg = JSON.parse(event.data);

      if (msg.type === "online_users") {
        set({ onlineUsers: msg.users });
      }

      if (get().onMessage) {
        get().onMessage(msg);
      }
    };

    socket.onclose = () => {
      console.log('WebSocket Disconnected');
      set({ isConnected: false });
      socket = null;
    };

    socket.onerror = (err) => console.error('WS Error:', err);
  },

  send: (message) => {
    if (socket?.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(message));
    }
  },

  disconnect: () => {
    socket?.close();
    socket = null;
    set({ isConnected: false });
  },

  setMessageHandler: (handler) => set({ onMessage: handler }),
  onMessage: null,
}));