import { Routes, Route } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Landing from './pages/Landing';
import Lobby from './pages/Lobby';
import Game from './pages/Game';

export default function App() {
  const { ready } = useAuth();

  if (!ready) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '1rem',
        color: 'var(--den-muted)',
        fontSize: '1.1rem',
      }}>
        <div style={{ fontSize: '3rem' }}>🃏</div>
        <span>Loading Dax's Den...</span>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/lobby/:roomCode" element={<Lobby />} />
      <Route path="/game/:roomCode" element={<Game />} />
    </Routes>
  );
}
