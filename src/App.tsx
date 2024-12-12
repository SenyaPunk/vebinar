import React from 'react';
import { useStore } from './store/useStore';
import { JoinForm } from './components/JoinForm';
import { WebinarRoom } from './components/WebinarRoom';

function App() {
  const user = useStore((state) => state.user);
  const roomId = useStore((state) => state.roomId);

  if (!user || !roomId) {
    return <JoinForm />;
  }

  return <WebinarRoom />;
}

export default App;