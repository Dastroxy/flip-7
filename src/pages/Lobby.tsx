import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGameRoom } from '../hooks/useGameRoom';
import FlipSevenLogo from '../components/FlipSevenLogo';

const avatarColors = [
  '#ff4757','#ff9f43','#ffd32a','#0be881',
  '#00d2d3','#54a0ff','#5f27cd','#ff4dab',
];
function getAvatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return avatarColors[Math.abs(hash) % avatarColors.length];
}

export default function Lobby() {
  const { roomCode } = useParams<{ roomCode: string }>();
  const navigate = useNavigate();
  const { room, myUid, startGame } = useGameRoom(roomCode ?? null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (
      room?.phase === 'dealing' ||
      room?.phase === 'player_turn' ||
      room?.phase === 'action_resolve'
    ) {
      navigate(`/game/${roomCode}`);
    }
  }, [room?.phase]);

  if (!room) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: '1rem', color: 'var(--den-muted)',
      }}>
        <div style={{
          width: '36px', height: '36px',
          border: '3px solid rgba(230,190,104,0.25)',
          borderTopColor: 'var(--den-gold)',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
        <span>Loading room...</span>
      </div>
    );
  }

  const isHost = room.hostUid === myUid;
  const playerList = room.playerOrder.map(uid => room.players[uid]).filter(Boolean);
  const shareUrl = `${window.location.origin}/?join=${roomCode}`;

  function copyLink() {
    navigator.clipboard.writeText(shareUrl).catch(() => {
      const el = document.createElement('textarea');
      el.value = shareUrl;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    });
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  async function handleStart() {
    await startGame();
    navigate(`/game/${roomCode}`);
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', padding: '2rem',
    }}>
      <div className="card-surface" style={{ width: '100%', maxWidth: '480px' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.85rem' }}>
            <FlipSevenLogo
              size={88}
              style={{
                filter: 'drop-shadow(0 8px 24px rgba(245, 158, 11, 0.4)) drop-shadow(0 4px 10px rgba(59, 130, 246, 0.3))',
              }}
            />
          </div>
          <h1 style={{
            fontSize: '1.9rem',
            letterSpacing: '-0.02em',
            fontWeight: 800,
            fontFamily: 'Space Grotesk, sans-serif',
            background: 'linear-gradient(180deg, #FFFFFF 0%, #CBD5E1 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
            FLIP 7
          </h1>
          <p style={{ color: 'var(--den-cyan-bright)', fontSize: '0.8rem', marginTop: '0.25rem', fontWeight: 700, letterSpacing: '0.15em', fontFamily: 'Space Grotesk, sans-serif' }}>
            GAME LOBBY
          </p>
        </div>

        {/* Room code */}
        <div style={{
          background: 'rgba(245, 158, 11, 0.08)',
          border: '1.5px dashed rgba(245, 158, 11, 0.4)',
          borderRadius: '16px', padding: '1.1rem',
          textAlign: 'center', marginBottom: '1.5rem',
        }}>
          <p style={{ fontSize: '0.72rem', color: 'var(--den-muted)', letterSpacing: '0.15em', marginBottom: '0.3rem', fontWeight: 800, fontFamily: 'Space Grotesk, sans-serif' }}>
            ROOM CODE
          </p>
          <p style={{
            fontSize: '2.6rem', fontFamily: 'JetBrains Mono, monospace',
            fontWeight: 800,
            background: 'linear-gradient(180deg, #FBBF24 0%, #F59E0B 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            letterSpacing: '0.2em', lineHeight: 1.1,
          }}>
            {roomCode}
          </p>
          <button
            className="btn-secondary"
            style={{ marginTop: '0.75rem', fontSize: '0.82rem', padding: '0.45rem 1.25rem' }}
            onClick={copyLink}
          >
            {copied ? 'Copied to Clipboard!' : 'Copy Invite Link'}
          </button>
        </div>

        {/* Players */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h3 style={{
            fontSize: '0.75rem', color: 'var(--den-muted)',
            letterSpacing: '0.14em', marginBottom: '0.75rem', fontWeight: 800,
          }}>
            PLAYERS ({playerList.length})
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {playerList.map(p => {
              const color = getAvatarColor(p.name);
              return (
                <div key={p.uid} style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                  background: p.uid === myUid
                    ? 'rgba(43, 168, 162, 0.12)' : 'rgba(255,255,255,0.03)',
                  borderRadius: '12px', padding: '0.65rem 1rem',
                  border: p.uid === myUid
                    ? '1px solid rgba(43, 168, 162, 0.35)' : '1px solid var(--den-border)',
                  transition: 'border-color 0.2s',
                }}>
                  <div style={{
                    width: '38px', height: '38px', borderRadius: '50%',
                    background: color, flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 900, color: '#fff', fontSize: '1.05rem',
                    boxShadow: `0 2px 10px ${color}66`,
                  }}>
                    {p.name[0].toUpperCase()}
                  </div>
                  <span style={{ fontWeight: 700, flex: 1, fontSize: '0.95rem' }}>
                    {p.name}
                    {p.uid === myUid && (
                      <span style={{ color: 'var(--den-muted)', fontSize: '0.72rem', marginLeft: '0.4rem' }}>
                        (you)
                      </span>
                    )}
                  </span>
                  {p.uid === room.hostUid && (
                    <span style={{
                      fontSize: '0.65rem',
                      background: 'rgba(245,197,66,0.15)',
                      color: 'var(--den-gold)',
                      borderRadius: '6px', padding: '0.2rem 0.55rem',
                      fontWeight: 800, letterSpacing: '0.05em',
                    }}>
                      HOST
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Event log */}
        {room.lastEvent && (
          <p style={{
            fontSize: '0.8rem', color: 'var(--den-muted)',
            textAlign: 'center', marginBottom: '1.25rem', fontWeight: 600, minHeight: '1.2em',
          }}>
            {room.lastEvent}
          </p>
        )}

        {/* Start / waiting */}
        {isHost ? (
          <button
            className="btn-primary"
            style={{ width: '100%', padding: '0.95rem', fontSize: '1.05rem' }}
            onClick={handleStart}
            disabled={playerList.length < 2}
          >
            {playerList.length < 2
              ? 'Waiting for at least 1 more player...'
              : `Start Game (${playerList.length} players)`}
          </button>
        ) : (
          <div style={{
            textAlign: 'center', color: 'var(--den-muted)',
            fontSize: '0.95rem', padding: '0.85rem',
            background: 'rgba(255,255,255,0.03)',
            borderRadius: '12px', fontWeight: 600,
          }}>
            Waiting for host to start the game...
          </div>
        )}
      </div>
    </div>
  );
}
