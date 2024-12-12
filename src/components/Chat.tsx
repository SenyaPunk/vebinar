import React, { useRef, useState, useEffect } from 'react';
import { Send, MessageSquare } from 'lucide-react';
import { useStore } from '../store/useStore';
import { socketService } from '../services/socket';
import { Message } from '../types';
import { v4 as uuidv4 } from 'uuid';

export function Chat() {
  const theme = useStore((state) => state.theme);
  const user = useStore((state) => state.user);
  const messages = useStore((state) => state.messages);
  const [message, setMessage] = useState('');
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !user) return;

    const newMessage: Message = {
      id: uuidv4(),
      userId: user.id,
      userName: user.name,
      content: message,
      timestamp: Date.now(),
    };

    socketService.sendMessage(newMessage);
    setMessage('');
  };

  return (
    <div className={`w-96 flex flex-col ${
      theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
    } border-l`}>
      <div className={`p-4 border-b ${
        theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
      }`}>
        <div className="flex items-center justify-between">
          <h2 className={`text-lg font-semibold ${
            theme === 'dark' ? 'text-gray-200' : 'text-gray-800'
          }`}>Chat</h2>
          <div className="flex items-center gap-2">
            <MessageSquare size={16} />
            <span className={`text-sm ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              {messages.length} messages
            </span>
          </div>
        </div>
      </div>
      
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${
              msg.userId === user?.id ? 'items-end' : 'items-start'
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-sm font-medium ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                {msg.userName}
              </span>
              <span className={`text-xs ${
                theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
              }`}>
                {new Date(msg.timestamp).toLocaleTimeString()}
              </span>
            </div>
            <div className={`max-w-[80%] rounded-lg px-4 py-2 ${
              msg.userId === user?.id
                ? 'bg-blue-500 text-white'
                : theme === 'dark'
                ? 'bg-gray-700 text-gray-200'
                : 'bg-gray-100 text-gray-800'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSendMessage} className={`p-4 border-t ${
        theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
      }`}>
        <div className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className={`flex-1 px-4 py-2 rounded-lg ${
              theme === 'dark'
                ? 'bg-gray-700 border-gray-600 text-gray-200 focus:ring-blue-500'
                : 'bg-white border-gray-300 text-gray-800 focus:ring-blue-500'
            } border focus:ring-2 focus:border-transparent`}
            placeholder="Type a message..."
          />
          <button
            type="submit"
            className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600"
          >
            <Send size={20} />
          </button>
        </div>
      </form>
    </div>
  );
}