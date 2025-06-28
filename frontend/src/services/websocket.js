class WebSocketService {
  constructor() {
    this.socket = null;
    this.listeners = [];
  }

  connect(sessionId) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      return;
    }

    const url = `ws://localhost:8000/ws/${sessionId}`;
    this.socket = new WebSocket(url);

    this.socket.onopen = () => {
      console.log('WebSocket connected');
    };

    this.socket.onmessage = (event) => {
      this.listeners.forEach(listener => listener(event.data));
    };

    this.socket.onclose = () => {
      console.log('WebSocket disconnected');
    };

    this.socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }

  disconnect() {
    if (this.socket) {
      this.socket.close();
    }
  }

  sendMessage(message) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(message);
    }
  }

  addListener(listener) {
    this.listeners.push(listener);
  }

  removeListener(listener) {
    this.listeners = this.listeners.filter(l => l !== listener);
  }
}

export default new WebSocketService();