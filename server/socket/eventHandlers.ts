import { Server, Socket } from 'socket.io';
import { RoomManager } from './roomManager';

export function setupEventHandlers(io: Server, socket: Socket, roomManager: RoomManager) {
  const { userId, userName, roomId, role } = socket.handshake.query as {
    userId: string;
    userName: string;
    roomId: string;
    role: string;
  };

  socket.join(roomId);
  
  const room = roomManager.createRoom(roomId);
  
  roomManager.addParticipant(roomId, userId, {
    id: userId,
    name: userName,
    role,
    socketId: socket.id
  });
  
  socket.to(roomId).emit('user:joined', {
    id: userId,
    name: userName,
    role
  });
  
  const currentRoom = roomManager.getRoom(roomId);
  if (currentRoom) {
    socket.emit('participants:list', 
      Array.from(currentRoom.participants.values())
    );
    socket.emit('chat:history', currentRoom.messages);
  }
  
  socket.on('chat:message', (message) => {
    roomManager.addMessage(roomId, message);
    io.to(roomId).emit('chat:message', message);
  });
  
  socket.on('webrtc:signal', ({ userId: targetUserId, signal }) => {
    const room = roomManager.getRoom(roomId);
    if (room) {
      const targetUser = room.participants.get(targetUserId);
      if (targetUser) {
        io.to(targetUser.socketId).emit('webrtc:signal', {
          signal,
          userId,
          userName
        });
      }
    }
  });

  socket.on('webrtc:screen-signal', ({ userId: targetUserId, signal }) => {
    const room = roomManager.getRoom(roomId);
    if (room) {
      const targetUser = room.participants.get(targetUserId);
      if (targetUser) {
        io.to(targetUser.socketId).emit('webrtc:screen-signal', {
          signal,
          userId
        });
      }
    }
  });

  socket.on('screen:share:stop', () => {
    socket.to(roomId).emit('screen:share:stop');
  });
  
  socket.on('disconnect', () => {
    roomManager.removeParticipant(roomId, userId);
    io.to(roomId).emit('user:left', userId);
  });
}