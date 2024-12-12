// Polyfill for simple-peer
import 'webrtc-adapter';
import SimplePeer from 'simple-peer';
import { VoiceConnection } from '../types';

export const initializeVoiceStream = async () => {
  try {
    return await navigator.mediaDevices.getUserMedia({ audio: true });
  } catch (err) {
    console.error('Error accessing microphone:', err);
    return null;
  }
};

export const createPeer = (
  stream: MediaStream,
  initiator: boolean,
  onSignal: (signal: any) => void,
  onStream: (stream: MediaStream) => void
) => {
  const peer = new SimplePeer({
    initiator,
    stream,
    trickle: false,
    config: {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:global.stun.twilio.com:3478' }
      ]
    }
  });

  peer.on('signal', onSignal);
  peer.on('stream', onStream);
  peer.on('error', (err) => console.error('Peer error:', err));

  return peer;
};