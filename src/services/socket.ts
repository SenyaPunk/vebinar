import { io, Socket } from 'socket.io-client';
import { useStore } from '../store/useStore';
import { Message, User } from '../types';
import SimplePeer from 'simple-peer';

const SOCKET_URL = import.meta.env.DEV 
  ? 'ws://localhost:3001'
  : 'wss://your-production-url.com';

class SocketService {
  private socket: Socket | null = null;
  private peers: Map<string, SimplePeer.Instance> = new Map();
  private screenPeers: Map<string, SimplePeer.Instance> = new Map();

  connect(user: User, roomId: string) {
    this.socket = io(SOCKET_URL, {
      query: {
        userId: user.id,
        userName: user.name,
        roomId,
        role: user.role
      }
    });

    this.setupSocketListeners();
  }

  private setupSocketListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('Connected to WebSocket server');
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
    });

    this.socket.on('user:joined', (user: User) => {
      useStore.getState().addParticipant(user);
    });

    this.socket.on('user:left', (userId: string) => {
      useStore.getState().removeParticipant(userId);
      useStore.getState().removeVoiceConnection(userId);
      
      // Clean up peer connections
      if (this.peers.has(userId)) {
        this.peers.get(userId)?.destroy();
        this.peers.delete(userId);
      }
      if (this.screenPeers.has(userId)) {
        this.screenPeers.get(userId)?.destroy();
        this.screenPeers.delete(userId);
      }
    });

    this.socket.on('chat:message', (message: Message) => {
      useStore.getState().addMessage(message);
    });

    this.socket.on('chat:history', (messages: Message[]) => {
      messages.forEach(msg => useStore.getState().addMessage(msg));
    });

    this.socket.on('participants:list', (participants: User[]) => {
      useStore.getState().setParticipants(participants);
    });

    this.socket.on('webrtc:signal', ({ signal, userId }) => {
      const peer = this.peers.get(userId);
      if (peer) {
        peer.signal(signal);
      }
    });

    this.socket.on('webrtc:screen-signal', ({ signal, userId }) => {
      const peer = this.screenPeers.get(userId);
      if (peer) {
        peer.signal(signal);
      }
    });

    this.socket.on('screen:share:stop', () => {
      const videoElement = document.querySelector('video');
      if (videoElement) {
        videoElement.srcObject = null;
      }
    });
  }

  sendMessage(message: Message) {
    if (!this.socket) return;
    this.socket.emit('chat:message', message);
  }

  sendSignal(userId: string, signal: any) {
    if (!this.socket) return;
    this.socket.emit('webrtc:signal', { userId, signal });
  }

  sendScreenSignal(userId: string, signal: any) {
    if (!this.socket) return;
    this.socket.emit('webrtc:screen-signal', { userId, signal });
  }

  broadcastScreenShareStop() {
    if (!this.socket) return;
    this.socket.emit('screen:share:stop');
  }

  setPeer(userId: string, peer: SimplePeer.Instance) {
    this.peers.set(userId, peer);
  }

  setScreenPeer(userId: string, peer: SimplePeer.Instance) {
    this.screenPeers.set(userId, peer);
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    // Clean up all peer connections
    this.peers.forEach(peer => peer.destroy());
    this.peers.clear();
    this.screenPeers.forEach(peer => peer.destroy());
    this.screenPeers.clear();
  }
}

export const socketService = new SocketService();