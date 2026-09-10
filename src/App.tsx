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
        fontSize: '1.05rem',
        fontWeight: 600,
        letterSpacing: '0.05em',
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '3px solid rgba(245,197,66,0.2)',
          borderTopColor: 'var(--den-gold)',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
        <span>Loading Flip 7...</span>
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
