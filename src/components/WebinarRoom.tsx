import React, { useEffect, useRef, useState } from 'react';
import { useStore } from '../store/useStore';
import { Copy, Mic, MicOff, Users } from 'lucide-react';
import { Chat } from './Chat';
import { ThemeToggle } from './ThemeToggle';
import { VoiceParticipants } from './VoiceParticipants';
import { initializeVoiceStream } from '../utils/webrtc';
import { socketService } from '../services/socket';
import SimplePeer from 'simple-peer';

export function WebinarRoom() {
  const theme = useStore((state) => state.theme);
  const user = useStore((state) => state.user);
  const roomId = useStore((state) => state.roomId);
  const participants = useStore((state) => state.participants);
  const addVoiceConnection = useStore((state) => state.addVoiceConnection);
  
  const [isMuted, setIsMuted] = useState(true);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (user && roomId) {
      socketService.connect(user, roomId);
      return () => {
        stopScreenShare();
        socketService.disconnect();
      };
    }
  }, [user, roomId]);

  useEffect(() => {
    const setupVoice = async () => {
      const stream = await initializeVoiceStream();
      if (stream) {
        setLocalStream(stream);
        stream.getAudioTracks()[0].enabled = !isMuted;

        if (user?.role === 'host') {
          participants.forEach((participant) => {
            if (participant.id !== user.id) {
              const peer = new SimplePeer({
                initiator: true,
                stream,
                trickle: false,
                config: {
                  iceServers: [
                    { urls: 'stun:stun.l.google.com:19302' },
                    { urls: 'stun:global.stun.twilio.com:3478' }
                  ]
                }
              });

              peer.on('signal', (signal) => {
                socketService.sendSignal(participant.id, signal);
              });

              peer.on('stream', (remoteStream) => {
                addVoiceConnection({
                  peerId: participant.id,
                  stream: remoteStream,
                  userName: participant.name
                });
              });

              socketService.setPeer(participant.id, peer);
            }
          });
        }
      }
    };
    setupVoice();

    return () => {
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [participants]);

  useEffect(() => {
    if (localStream) {
      localStream.getAudioTracks()[0].enabled = !isMuted;
    }
  }, [isMuted, localStream]);

  const stopScreenShare = () => {
    if (screenStream) {
      screenStream.getTracks().forEach(track => track.stop());
      setScreenStream(null);
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      socketService.broadcastScreenShareStop();
    }
  };

  const handleScreenShare = async () => {
    try {
      if (screenStream) {
        stopScreenShare();
        return;
      }

      const stream = await navigator.mediaDevices.getDisplayMedia({ 
        video: {
          cursor: "always"
        },
        audio: false
      });

      setScreenStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      // Create peer connections for each participant
      participants.forEach(participant => {
        if (participant.id !== user?.id) {
          const peer = new SimplePeer({
            initiator: true,
            stream,
            trickle: false,
            config: {
              iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:global.stun.twilio.com:3478' }
              ]
            }
          });

          peer.on('signal', (signal) => {
            socketService.sendScreenSignal(participant.id, signal);
          });

          socketService.setScreenPeer(participant.id, peer);
        }
      });

      // Handle stream stop
      stream.getVideoTracks()[0].onended = () => {
        stopScreenShare();
      };

    } catch (err) {
      console.error('Error sharing screen:', err);
    }
  };

  const copyRoomId = () => {
    if (roomId) {
      navigator.clipboard.writeText(roomId);
    }
  };

  return (
    <div className={`min-h-screen flex ${
      theme === 'dark' ? 'bg-gray-900' : 'bg-gray-100'
    }`}>
      <div className="flex-1 flex flex-col">
        <div className={`px-6 py-4 flex justify-between items-center ${
          theme === 'dark' ? 'bg-gray-800 shadow-md' : 'bg-white shadow'
        }`}>
          <div className="flex items-center gap-4">
            <h1 className={`text-xl font-semibold ${
              theme === 'dark' ? 'text-gray-200' : 'text-gray-800'
            }`}>
              Webinar Room
            </h1>
            <div className="flex items-center gap-2">
              <Users size={16} />
              <span className={`text-sm ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {participants.length} participants
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className={`text-sm ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>Room ID:</span>
              <code className={`px-3 py-1 rounded ${
                theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-800'
              }`}>{roomId}</code>
              <button
                onClick={copyRoomId}
                className={`${
                  theme === 'dark' ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Copy size={18} />
              </button>
            </div>
            <button
              onClick={() => setIsMuted(!isMuted)}
              className={`p-2 rounded-full ${
                isMuted
                  ? theme === 'dark' ? 'bg-gray-700 text-gray-400' : 'bg-gray-200 text-gray-600'
                  : 'bg-blue-500 text-white'
              }`}
            >
              {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
            </button>
            <ThemeToggle />
          </div>
        </div>

        <div className="flex-1 p-6">
          <div className={`rounded-lg aspect-video overflow-hidden ${
            theme === 'dark' ? 'bg-gray-800' : 'bg-black'
          }`}>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-full object-contain"
            />
          </div>
          {user?.role === 'host' && (
            <div className="mt-4 flex justify-center">
              <button
                onClick={handleScreenShare}
                className={`px-6 py-2 rounded-lg ${
                  screenStream
                    ? 'bg-red-500 hover:bg-red-600'
                    : 'bg-blue-500 hover:bg-blue-600'
                } text-white`}
              >
                {screenStream ? 'Stop Sharing' : 'Share Screen'}
              </button>
            </div>
          )}
          <VoiceParticipants />
        </div>
      </div>

      <Chat />
    </div>
  );
}