import React from 'react';
import { Mic } from 'lucide-react';
import { useStore } from '../store/useStore';

export function VoiceParticipants() {
  const theme = useStore((state) => state.theme);
  const voiceConnections = useStore((state) => state.voiceConnections);

  return (
    <div className={`p-4 ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}`}>
      <h3 className={`text-sm font-medium mb-2 ${
        theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
      }`}>
        Voice Participants
      </h3>
      <div className="space-y-2">
        {voiceConnections.map((connection) => (
          <div
            key={connection.peerId}
            className={`flex items-center gap-2 p-2 rounded ${
              theme === 'dark' ? 'bg-gray-700 text-gray-200' : 'bg-white text-gray-800'
            }`}
          >
            <Mic size={16} className="text-green-500" />
            <span className="text-sm">{connection.userName}</span>
          </div>
        ))}
      </div>
    </div>
  );
}