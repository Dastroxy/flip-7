import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGameRoom } from '../hooks/useGameRoom';

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
        <div style={{ fontSize: '3rem' }}>🃏</div>
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
    alert(`Copied! Share this with friends:\n\n${shareUrl}`);
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
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.4rem' }}>🃏</div>
          <h1 style={{
            fontSize: '2rem',
            background: 'linear-gradient(135deg,#f5c542,#ff9f43)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
            DAX'S DEN
          </h1>
          <p style={{ color: 'var(--den-muted)', fontSize: '0.85rem', marginTop: '0.25rem', fontWeight: 600, letterSpacing: '0.1em' }}>
            FLIP 7 · LOBBY
          </p>
        </div>

        {/* Room code */}
        <div style={{
          background: 'rgba(245,197,66,0.07)',
          border: '2px dashed rgba(245,197,66,0.4)',
          borderRadius: '16px', padding: '1.1rem',
          textAlign: 'center', marginBottom: '1.5rem',
        }}>
          <p style={{ fontSize: '0.72rem', color: 'var(--den-muted)', letterSpacing: '0.15em', marginBottom: '0.3rem', fontWeight: 700 }}>
            ROOM CODE
          </p>
          <p style={{
            fontSize: '2.8rem', fontFamily: 'Cinzel, serif',
            background: 'linear-gradient(135deg,#f5c542,#ffe88a)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            letterSpacing: '0.4em', lineHeight: 1.1,
          }}>
            {roomCode}
          </p>
          <button
            className="btn-secondary"
            style={{ marginTop: '0.75rem', fontSize: '0.78rem', padding: '0.4rem 1rem' }}
            onClick={copyLink}
          >
            📋 Copy Invite Link
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
                    ? 'rgba(245,197,66,0.07)' : 'rgba(255,255,255,0.03)',
                  borderRadius: '12px', padding: '0.65rem 1rem',
                  border: p.uid === myUid
                    ? '1px solid rgba(245,197,66,0.25)' : '1px solid var(--den-border)',
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
        <p style={{
          fontSize: '0.8rem', color: 'var(--den-muted)', fontStyle: 'italic',
          textAlign: 'center', marginBottom: '1.25rem', fontWeight: 600, minHeight: '1.2em',
        }}>
          💬 {room.lastEvent}
        </p>

        {/* Start / waiting */}
        {isHost ? (
          <button
            className="btn-primary"
            style={{ width: '100%', padding: '0.95rem', fontSize: '1.05rem' }}
            onClick={handleStart}
            disabled={playerList.length < 2}
          >
            {playerList.length < 2
              ? '⏳ Waiting for at least 1 more player...'
              : `▶ Start Game  (${playerList.length} players)`}
          </button>
        ) : (
          <div style={{
            textAlign: 'center', color: 'var(--den-muted)',
            fontSize: '0.95rem', padding: '0.85rem',
            background: 'rgba(255,255,255,0.03)',
            borderRadius: '12px', fontWeight: 600,
          }}>
            ⏳ Waiting for host to start the game...
          </div>
        )}
      </div>
    </div>
  );
}
