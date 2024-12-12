import { createPeer } from './peer';
import type SimplePeer from 'simple-peer';
import { socketService } from '../socket';

export class ScreenShareManager {
  private screenPeers: Map<string, SimplePeer.Instance> = new Map();
  private stream: MediaStream | null = null;

  setStream(stream: MediaStream | null) {
    this.stream = stream;
  }

  stopSharing() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
      
      // Close all screen sharing peer connections
      this.screenPeers.forEach(peer => peer.destroy());
      this.screenPeers.clear();
      
      // Notify server
      socketService.broadcastScreenShareStop();
    }
  }

  initializePeer(participantId: string, stream: MediaStream) {
    const peer = createPeer({
      stream,
      initiator: true,
      onSignal: (signal) => socketService.sendScreenSignal(participantId, signal)
    });
    
    this.screenPeers.set(participantId, peer);
    return peer;
  }

  handleSignal(userId: string, signal: any) {
    const peer = this.screenPeers.get(userId);
    if (peer) {
      peer.signal(signal);
    }
  }

  cleanup() {
    this.stopSharing();
    this.screenPeers.clear();
  }
}