export class RoomManager {
  private rooms: Map<string, Room> = new Map();

  createRoom(roomId: string) {
    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, {
        participants: new Map(),
        messages: []
      });
    }
    return this.rooms.get(roomId)!;
  }

  getRoom(roomId: string) {
    return this.rooms.get(roomId);
  }

  deleteRoom(roomId: string) {
    this.rooms.delete(roomId);
  }

  addParticipant(roomId: string, userId: string, participant: Participant) {
    const room = this.getRoom(roomId);
    if (room) {
      room.participants.set(userId, participant);
    }
  }

  removeParticipant(roomId: string, userId: string) {
    const room = this.getRoom(roomId);
    if (room) {
      room.participants.delete(userId);
      if (room.participants.size === 0) {
        this.deleteRoom(roomId);
      }
    }
  }

  addMessage(roomId: string, message: Message) {
    const room = this.getRoom(roomId);
    if (room) {
      room.messages.push(message);
    }
  }
}

interface Room {
  participants: Map<string, Participant>;
  messages: Message[];
}

interface Participant {
  id: string;
  name: string;
  role: string;
  socketId: string;
}

interface Message {
  id: string;
  userId: string;
  userName: string;
  content: string;
  timestamp: number;
}