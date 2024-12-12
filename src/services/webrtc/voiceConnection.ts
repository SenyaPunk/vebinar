import { createPeer } from './peer';
import type SimplePeer from 'simple-peer';
import { socketService } from '../socket';
import { useStore } from '../../store/useStore';

export class VoiceConnectionManager {
  private peers: Map<string, SimplePeer.Instance> = new Map();
  private stream: MediaStream | null = null;

  setStream(stream: MediaStream | null) {
    this.stream = stream;
  }

  initializePeer(participantId: string, userName: string) {
    if (!this.stream) return;

    const peer = createPeer({
      stream: this.stream,
      initiator: true,
      onSignal: (signal) => socketService.sendSignal(participantId, signal),
      onStream: (stream) => {
        useStore.getState().addVoiceConnection({
          peerId: participantId,
          stream,
          userName
        });
      }
    });
    
    socketService.setPeer(participantId, peer);
    return peer;
  }

  handleSignal(userId: string, signal: any) {
    const peer = this.peers.get(userId);
    if (peer) {
      peer.signal(signal);
    }
  }

  setMuted(muted: boolean) {
    if (this.stream) {
      this.stream.getAudioTracks()[0].enabled = !muted;
    }
  }

  cleanup() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
    }
    this.peers.forEach(peer => peer.destroy());
    this.peers.clear();
  }
}