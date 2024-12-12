import { create } from 'zustand';
import { User, Message, Theme, VoiceConnection } from '../types';

interface Store {
  user: User | null;
  messages: Message[];
  roomId: string | null;
  theme: Theme;
  participants: User[];
  voiceConnections: VoiceConnection[];
  setUser: (user: User) => void;
  setRoomId: (roomId: string) => void;
  addMessage: (message: Message) => void;
  toggleTheme: () => void;
  addVoiceConnection: (connection: VoiceConnection) => void;
  removeVoiceConnection: (peerId: string) => void;
  setParticipants: (participants: User[]) => void;
  addParticipant: (participant: User) => void;
  removeParticipant: (userId: string) => void;
  reset: () => void;
}

export const useStore = create<Store>((set) => ({
  user: null,
  messages: [],
  roomId: null,
  theme: 'light',
  participants: [],
  voiceConnections: [],
  setUser: (user) => set({ user }),
  setRoomId: (roomId) => set({ roomId }),
  addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
  toggleTheme: () => set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
  addVoiceConnection: (connection) => 
    set((state) => ({ 
      voiceConnections: [...state.voiceConnections, connection] 
    })),
  removeVoiceConnection: (peerId) =>
    set((state) => ({
      voiceConnections: state.voiceConnections.filter((c) => c.peerId !== peerId)
    })),
  setParticipants: (participants) => set({ participants }),
  addParticipant: (participant) =>
    set((state) => ({
      participants: [...state.participants, participant]
    })),
  removeParticipant: (userId) =>
    set((state) => ({
      participants: state.participants.filter((p) => p.id !== userId)
    })),
  reset: () => set({ 
    user: null, 
    messages: [], 
    roomId: null,
    participants: [],
    voiceConnections: [] 
  }),
}));