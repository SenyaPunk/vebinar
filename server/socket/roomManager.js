export class RoomManager {
  constructor() {
    this.rooms = new Map();
  }

  createRoom(roomId) {
    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, {
        participants: new Map(),
        messages: []
      });
    }
    return this.rooms.get(roomId);
  }

  getRoom(roomId) {
    return this.rooms.get(roomId);
  }

  deleteRoom(roomId) {
    this.rooms.delete(roomId);
  }

  addParticipant(roomId, userId, participant) {
    const room = this.getRoom(roomId);
    if (room) {
      room.participants.set(userId, participant);
    }
  }

  removeParticipant(roomId, userId) {
    const room = this.getRoom(roomId);
    if (room) {
      room.participants.delete(userId);
      if (room.participants.size === 0) {
        this.deleteRoom(roomId);
      }
    }
  }

  addMessage(roomId, message) {
    const room = this.getRoom(roomId);
    if (room) {
      room.messages.push(message);
    }
  }
}