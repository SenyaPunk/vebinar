import { Socket } from 'socket.io-client';
import { useStore } from '../../store/useStore';
import { Message, User } from '../../types';
import { VoiceConnectionManager } from '../webrtc/voiceConnection';
import { ScreenShareManager } from '../webrtc/screenShare';

export function setupSocketListeners(
  socket: Socket,
  voiceManager: VoiceConnectionManager,
  screenManager: ScreenShareManager
) {
  socket.on('connect', () => {
    console.log('Connected to WebSocket server');
  });

  socket.on('connect_error', (error) => {
    console.error('WebSocket connection error:', error);
  });

  socket.on('user:joined', (user: User) => {
    useStore.getState().addParticipant(user);
  });

  socket.on('user:left', (userId: string) => {
    useStore.getState().removeParticipant(userId);
    useStore.getState().removeVoiceConnection(userId);
  });

  socket.on('chat:message', (message: Message) => {
    useStore.getState().addMessage(message);
  });

  socket.on('chat:history', (messages: Message[]) => {
    messages.forEach(msg => useStore.getState().addMessage(msg));
  });

  socket.on('participants:list', (participants: User[]) => {
    useStore.getState().setParticipants(participants);
  });

  socket.on('webrtc:signal', ({ signal, userId }) => {
    voiceManager.handleSignal(userId, signal);
  });

  socket.on('webrtc:screen-signal', ({ signal, userId }) => {
    screenManager.handleSignal(userId, signal);
  });

  socket.on('screen:share:stop', () => {
    const videoElement = document.querySelector('video');
    if (videoElement) {
      videoElement.srcObject = null;
    }
  });
}