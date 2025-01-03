import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const baseUrl = 'http://118.70.155.34:8000';

class StompService {
  static instances = {}; // Lưu trữ nhiều instance cho các chatGroupId
  client;
  onMessageCallback = () => {};
  connected = false;

  constructor(chatGroupId) {
    this.chatGroupId = chatGroupId;

    this.client = new Client({
      webSocketFactory: () => new SockJS(`${baseUrl}/ws`), // Đồng nhất với proxy
      debug: (str) => console.log('STOMP Debug:', str),

      onConnect: () => {
        console.log(`STOMP Connected for chatGroupId: ${this.chatGroupId}`);
        this.connected = true;

        // Subscribe to personal messages
        this.client.subscribe(`/user/${this.chatGroupId}/messages`, (message) => {
          const parsedMessage = JSON.parse(message.body);
          console.log('STOMP Message:', parsedMessage);
          this.onMessageCallback(parsedMessage);
        });

        // Subscribe to telegram messages
        this.client.subscribe('/chatroom/telegram', (message) => {
          const parsedMessage = JSON.parse(message.body);
          console.log('STOMP Telegram Message:', parsedMessage);
          this.onMessageCallback(parsedMessage);
        });
      },

      onStompError: (frame) => {
        console.error('STOMP Error:', frame.headers.message);
        console.error('STOMP Error Details:', frame.body);
        this.connected = false;
      },

      onWebSocketClose: () => {
        console.log(`STOMP Disconnected for chatGroupId: ${this.chatGroupId}`);
        this.connected = false;
      },

      reconnectDelay: 10000, // Tự động kết nối lại sau 10 giây nếu mất kết nối
    });
  }

  static getInstance(chatGroupId) {
    if (!StompService.instances[chatGroupId]) {
      StompService.instances[chatGroupId] = new StompService(chatGroupId);
    }
    return StompService.instances[chatGroupId];
  }

  connect = () => {
    if (!this.connected) {
        console.log("Attempting to connect to STOMP...");
        this.client.activate();
        this.connected = true;
        console.log("Connected to STOMP service");
    } else {
        console.log("Already connected to STOMP service");
    }
  };  

  isConnected = () => {
    return this.client && this.client.connected;
  };

  disconnect = () => {
    if (this.connected) {
      this.client.deactivate();
    }
  };

  setOnMessageCallback = (callback) => {
    this.onMessageCallback = callback;
  };

  sendMessage = (param, destination = '/app/message') => {
    if (this.isConnected()) {
      console.log('Sending message:', JSON.stringify(param));
      this.client.publish({
        destination: destination,
        body: JSON.stringify(param),
      });
    } else {
      console.error('STOMP connection not established. Message not sent:', param);
    }
  };

  onMessageReceived = (payload) => {
    console.log("Message received:", payload);
    // ...
  };
}

export default StompService;
