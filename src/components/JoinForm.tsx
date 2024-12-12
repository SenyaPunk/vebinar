import React, { useState } from 'react';
import { UserRole } from '../types';
import { useStore } from '../store/useStore';
import { v4 as uuidv4 } from 'uuid';
import { Users, Video } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

export function JoinForm() {
  const theme = useStore((state) => state.theme);
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('attendee');
  const [roomId, setRoomId] = useState('');
  const setUser = useStore((state) => state.setUser);
  const setStoreRoomId = useStore((state) => state.setRoomId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    const userId = uuidv4();
    setUser({ id: userId, name, role });
    
    if (role === 'attendee') {
      if (!roomId) return;
      setStoreRoomId(roomId);
    } else {
      setStoreRoomId(uuidv4());
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 ${
      theme === 'dark'
        ? 'bg-gradient-to-br from-gray-900 to-gray-800'
        : 'bg-gradient-to-br from-blue-50 to-indigo-100'
    }`}>
      <div className={`rounded-xl shadow-xl p-8 w-full max-w-md ${
        theme === 'dark' ? 'bg-gray-800' : 'bg-white'
      }`}>
        <div className="flex justify-between items-center mb-8">
          <h1 className={`text-3xl font-bold ${
            theme === 'dark' ? 'text-gray-100' : 'text-gray-800'
          }`}>
            Join Webinar
          </h1>
          <ThemeToggle />
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Your Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`w-full px-4 py-2 rounded-lg border ${
                theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-gray-100 focus:ring-blue-500'
                  : 'bg-white border-gray-300 text-gray-800 focus:ring-blue-500'
              } focus:ring-2 focus:border-transparent`}
              placeholder="Enter your name"
              required
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Select Role
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setRole('attendee')}
                className={`flex items-center justify-center gap-2 p-3 rounded-lg border ${
                  role === 'attendee'
                    ? 'bg-blue-500 text-white border-blue-600'
                    : theme === 'dark'
                    ? 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                <Users size={20} />
                Attendee
              </button>
              <button
                type="button"
                onClick={() => setRole('host')}
                className={`flex items-center justify-center gap-2 p-3 rounded-lg border ${
                  role === 'host'
                    ? 'bg-blue-500 text-white border-blue-600'
                    : theme === 'dark'
                    ? 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                <Video size={20} />
                Host
              </button>
            </div>
          </div>

          {role === 'attendee' && (
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Room ID
              </label>
              <input
                type="text"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                className={`w-full px-4 py-2 rounded-lg border ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-gray-100 focus:ring-blue-500'
                    : 'bg-white border-gray-300 text-gray-800 focus:ring-blue-500'
                } focus:ring-2 focus:border-transparent`}
                placeholder="Enter room ID"
                required
              />
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Join Webinar
          </button>
        </form>
      </div>
    </div>
  );
}