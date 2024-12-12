import { io, Socket } from 'socket.io-client';
import { Message, User } from '../../types';
import { setupSocketListeners } from './events';
import { VoiceConnectionManager } from '../webrtc/voiceConnection';
import { ScreenShareManager } from '../webrtc/screenShare';

const SOCKET_URL = import.meta.env.DEV 
  ? 'ws://localhost:3001'
  : 'wss://your-production-url.com';

class SocketService {
  private socket: Socket | null = null;
  private voiceManager: VoiceConnectionManager;
  private screenManager: ScreenShareManager;

  constructor() {
    this.voiceManager = new VoiceConnectionManager();
    this.screenManager = new ScreenShareManager();
  }

  connect(user: User, roomId: string) {
    this.socket = io(SOCKET_URL, {
      query: {
        userId: user.id,
        userName: user.name,
        roomId,
        role: user.role
      }
    });

    setupSocketListeners(this.socket, this.voiceManager, this.screenManager);
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
    this.voiceManager.initializePeer(userId, '');
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.voiceManager.cleanup();
    this.screenManager.cleanup();
  }

  getVoiceManager() {
    return this.voiceManager;
  }

  getScreenManager() {
    return this.screenManager;
  }
}

export const socketService = new SocketService();