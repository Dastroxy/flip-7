import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useGameRoom } from '../hooks/useGameRoom';
import FlipSevenLogo from '../components/FlipSevenLogo';

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
      minHeight: '100dvh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5rem 1.25rem',
      boxSizing: 'border-box',
    }}>

      {/* ── Logo ── */}
      <div className="float-anim" style={{
        textAlign: 'center',
        marginBottom: '2.25rem',
        width: '100%',
      }}>
        {/* Game Logo */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.25rem' }}>
          <FlipSevenLogo
            size={116}
            style={{
              filter: 'drop-shadow(0 12px 30px rgba(245, 158, 11, 0.45)) drop-shadow(0 4px 12px rgba(59, 130, 246, 0.35))',
            }}
          />
        </div>

        <h1 style={{
          fontSize: 'clamp(2.4rem, 9vw, 3.8rem)',
          lineHeight: 1.05,
          letterSpacing: '-0.02em',
          fontWeight: 800,
          background: 'linear-gradient(180deg, #FFFFFF 0%, #E2E8F0 60%, #94A3B8 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          FLIP 7
        </h1>
        <p style={{
          color: 'var(--den-cyan-bright)',
          marginTop: '0.5rem',
          fontSize: 'clamp(0.72rem, 2.5vw, 0.88rem)',
          letterSpacing: '0.18em',
          fontWeight: 700,
          textTransform: 'uppercase',
          fontFamily: 'Space Grotesk, sans-serif',
        }}>
          Press-Your-Luck Card Game
        </p>
      </div>

      {/* ── Mode: none ── */}
      {mode === 'none' && (
        <div style={{
          width: '100%',
          maxWidth: '340px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1.25rem',
        }}>
          {/* Game summary badge */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.9rem',
            background: 'rgba(255,255,255,0.035)',
            border: '1px solid var(--den-border)',
            borderRadius: '16px',
            padding: '0.85rem 1.25rem',
            width: '100%',
            boxSizing: 'border-box',
          }}>
            <div style={{
              width: '38px',
              height: '50px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #091D1F, #0F3235)',
              border: '1px solid rgba(255, 210, 63, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 900,
              fontSize: '1.2rem',
              color: 'var(--den-gold)',
              flexShrink: 0,
            }}>
              7
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.95rem', letterSpacing: '0.04em' }}>FLIP 7 TABLE</div>
              <div style={{ fontSize: '0.74rem', color: 'var(--den-muted)', fontWeight: 600 }}>
                First to 200 · 2+ Players
              </div>
            </div>
            <span style={{
              fontSize: '0.65rem',
              background: 'rgba(39, 174, 96, 0.15)',
              color: '#27AE60',
              borderRadius: '6px',
              padding: '0.2rem 0.55rem',
              fontWeight: 800,
              marginLeft: 'auto',
              flexShrink: 0,
              letterSpacing: '0.05em',
            }}>
              READY
            </span>
          </div>

          {/* Buttons */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.85rem',
            width: '100%',
          }}>
            <button
              className="btn-primary"
              style={{ width: '100%', fontSize: '1rem', padding: '0.9rem' }}
              onClick={() => setMode('host')}
            >
              Host a Game
            </button>
            <button
              className="btn-secondary"
              style={{ width: '100%', fontSize: '1rem', padding: '0.85rem' }}
              onClick={() => setMode('join')}
            >
              Join a Game
            </button>
          </div>
        </div>
      )}

      {/* ── Mode: host / join ── */}
      {(mode === 'host' || mode === 'join') && (
        <div className="card-surface" style={{
          width: '100%',
          maxWidth: '360px',
          boxSizing: 'border-box',
        }}>
          <h2 style={{
            marginBottom: '1.5rem',
            fontSize: '1.35rem',
            textAlign: 'center',
            letterSpacing: '0.05em',
          }}>
            {mode === 'host' ? 'Host a Game' : 'Join a Game'}
          </h2>

          {error && (
            <div style={{
              background: 'rgba(239, 108, 74, 0.12)',
              border: '1px solid var(--den-coral)',
              borderRadius: '10px',
              padding: '0.65rem 1rem',
              color: 'var(--den-coral)',
              fontSize: '0.88rem',
              marginBottom: '1rem',
              fontWeight: 600,
              textAlign: 'center',
            }}>
              {error}
            </div>
          )}

          <div style={{ marginBottom: '1rem' }}>
            <label style={{
              display: 'block',
              fontSize: '0.78rem',
              color: 'var(--den-muted)',
              marginBottom: '0.4rem',
              letterSpacing: '0.1em',
              fontWeight: 700,
            }}>
              YOUR NAME
            </label>
            <input
              className="input-field"
              value={name}
              maxLength={20}
              onChange={e => { setName(e.target.value); setError(''); }}
              placeholder={mode === 'host' ? 'Host name' : 'Your name'}
              onKeyDown={e => e.key === 'Enter' && (mode === 'host' ? handleHost() : handleJoin())}
            />
          </div>

          {mode === 'join' && (
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{
                display: 'block',
                fontSize: '0.78rem',
                color: 'var(--den-muted)',
                marginBottom: '0.4rem',
                letterSpacing: '0.1em',
                fontWeight: 700,
              }}>
                ROOM CODE
              </label>
              <input
                className="input-field"
                value={code}
                maxLength={8}
                onChange={e => { setCode(e.target.value.toUpperCase()); setError(''); }}
                placeholder="XXXXX"
                style={{
                  letterSpacing: '0.25em',
                  textTransform: 'uppercase',
                  textAlign: 'center',
                }}
                onKeyDown={e => e.key === 'Enter' && handleJoin()}
              />
            </div>
          )}

          <button
            className="btn-primary"
            style={{ width: '100%', marginBottom: '0.75rem', padding: '0.85rem' }}
            onClick={mode === 'host' ? handleHost : handleJoin}
            disabled={loading}
          >
            {loading ? 'Please wait...' : mode === 'host' ? 'Create Room' : 'Join Room'}
          </button>
          <button
            className="btn-secondary"
            style={{ width: '100%' }}
            onClick={() => { setMode('none'); setError(''); }}
          >
            Back
          </button>
        </div>
      )}
    </div>
  );
}
