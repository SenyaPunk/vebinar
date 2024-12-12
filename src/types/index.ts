export type UserRole = 'host' | 'attendee';
export type Theme = 'light' | 'dark';

export interface User {
  id: string;
  name: string;
  role: UserRole;
}

export interface Message {
  id: string;
  userId: string;
  userName: string;
  content: string;
  timestamp: number;
}

export interface VoiceConnection {
  peerId: string;
  stream: MediaStream;
  userName: string;
}