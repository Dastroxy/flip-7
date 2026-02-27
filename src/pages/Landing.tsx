import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useGameRoom } from '../hooks/useGameRoom';

export default function Landing() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { createRoom, joinRoom } = useGameRoom(null);
  const [mode, setMode] = useState<'none' | 'host' | 'join'>('none');
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const joinCode = searchParams.get('join');
    if (joinCode) { setCode(joinCode.toUpperCase()); setMode('join'); }
  }, []);

  async function handleHost() {
    if (!name.trim()) return setError('Enter your name.');
    setLoading(true);
    try {
      const roomCode = await createRoom(name.trim());
      navigate(`/lobby/${roomCode}`);
    } catch { setError('Failed to create room. Check Firebase config.'); }
    setLoading(false);
  }

  async function handleJoin() {
    if (!name.trim() || !code.trim()) return setError('Enter your name and room code.');
    setLoading(true);
    try {
      await joinRoom(code.trim().toUpperCase(), name.trim());
      navigate(`/lobby/${code.trim().toUpperCase()}`);
    } catch (e: any) { setError(e.message || 'Failed to join.'); }
    setLoading(false);
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', padding: '2rem',
    }}>
      {/* Logo */}
      <div className="float-anim" style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <div style={{ fontSize: '4rem', marginBottom: '0.5rem' }}>🃏</div>
        <h1 style={{
          fontSize: 'clamp(2.2rem, 6vw, 3.5rem)', lineHeight: 1.1,
          background: 'linear-gradient(135deg,#f5c542,#ff9f43)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        }}>
          DAX'S DEN
        </h1>
        <p style={{
          color: 'var(--den-muted)', marginTop: '0.5rem',
          fontSize: '0.95rem', letterSpacing: '0.2em', fontWeight: 700,
        }}>
          GAME NIGHT · YOUR RULES
        </p>
      </div>

      {/* Game tile */}
      {mode === 'none' && (
        <>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.75rem',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid var(--den-border)',
            borderRadius: '14px', padding: '0.75rem 1.25rem',
            marginBottom: '2rem',
          }}>
            <span style={{ fontSize: '1.5rem' }}>🃏</span>
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>FLIP 7</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--den-muted)' }}>Press-Your-Luck · 3+ Players</div>
            </div>
            <span style={{
              fontSize: '0.65rem', background: 'rgba(11,232,129,0.15)',
              color: '#0be881', borderRadius: '6px',
              padding: '0.2rem 0.5rem', fontWeight: 800, marginLeft: 'auto',
            }}>
              LIVE
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', width: '100%', maxWidth: '300px' }}>
            <button className="btn-primary" style={{ fontSize: '1.05rem', padding: '0.9rem' }} onClick={() => setMode('host')}>
              🏠 Host a Game
            </button>
            <button className="btn-secondary" style={{ fontSize: '1.05rem', padding: '0.85rem' }} onClick={() => setMode('join')}>
              🚀 Join a Game
            </button>
          </div>
        </>
      )}

      {(mode === 'host' || mode === 'join') && (
        <div className="card-surface" style={{ width: '100%', maxWidth: '360px' }}>
          <h2 style={{ marginBottom: '1.5rem', fontSize: '1.4rem' }}>
            {mode === 'host' ? '🏠 Host a Game' : '🚀 Join a Game'}
          </h2>
          {error && (
            <div style={{
              background: 'rgba(255,77,109,0.12)', border: '1px solid var(--den-red)',
              borderRadius: '10px', padding: '0.65rem 1rem',
              color: 'var(--den-red)', fontSize: '0.88rem', marginBottom: '1rem', fontWeight: 600,
            }}>
              ⚠️ {error}
            </div>
          )}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--den-muted)', marginBottom: '0.4rem', letterSpacing: '0.1em', fontWeight: 700 }}>
              YOUR NAME
            </label>
            <input
              className="input-field" value={name} maxLength={20}
              onChange={e => { setName(e.target.value); setError(''); }}
              placeholder={mode === 'host' ? 'Dax' : 'Your name'}
              onKeyDown={e => e.key === 'Enter' && (mode === 'host' ? handleHost() : handleJoin())}
            />
          </div>
          {mode === 'join' && (
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--den-muted)', marginBottom: '0.4rem', letterSpacing: '0.1em', fontWeight: 700 }}>
                ROOM CODE
              </label>
              <input
                className="input-field" value={code} maxLength={8}
                onChange={e => { setCode(e.target.value.toUpperCase()); setError(''); }}
                placeholder="XXXXX"
                style={{ letterSpacing: '0.25em', textTransform: 'uppercase' }}
                onKeyDown={e => e.key === 'Enter' && handleJoin()}
              />
            </div>
          )}
          <button
            className="btn-primary" style={{ width: '100%', marginBottom: '0.75rem', padding: '0.85rem' }}
            onClick={mode === 'host' ? handleHost : handleJoin}
            disabled={loading}
          >
            {loading ? '⏳ Please wait...' : mode === 'host' ? 'Create Room →' : 'Join Room →'}
          </button>
          <button className="btn-secondary" style={{ width: '100%' }} onClick={() => { setMode('none'); setError(''); }}>
            ← Back
          </button>
        </div>
      )}
    </div>
  );
}
