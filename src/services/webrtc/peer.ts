import SimplePeer from 'simple-peer';

export interface PeerConfig {
  stream: MediaStream;
  initiator: boolean;
  onSignal: (signal: any) => void;
  onStream?: (stream: MediaStream) => void;
}

export function createPeer({
  stream,
  initiator,
  onSignal,
  onStream = () => {}
}: PeerConfig): SimplePeer.Instance {
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
}