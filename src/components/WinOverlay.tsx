import type { GameRoom } from '../types/game';

interface Props {
  room: GameRoom;
  myUid: string;
  onPlayAgain: () => void;
}

export default function WinOverlay({ room, myUid, onPlayAgain }: Props) {
  const sortedPlayers = [...room.playerOrder]
    .map(uid => room.players[uid])
    .sort((a, b) => b.totalScore - a.totalScore);

  const winner = sortedPlayers[0] ?? null;
  const winnerUid = winner?.uid ?? null;
  const isHost = room.hostUid === myUid;
  const isWinner = winnerUid === myUid;

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(0,0,0,0.92)',
      backdropFilter: 'blur(10px)',
      zIndex: 2000,
      overflowY: 'auto',
      WebkitOverflowScrolling: 'touch',
    }}>
      {/* Inner centering wrapper */}
      <div style={{
        minHeight: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1.25rem',
        boxSizing: 'border-box',
        textAlign: 'center',
        gap: '1.25rem',
      }}>

        {/* Trophy / Winner emblem */}
        <div style={{
          animation: 'float 2.5s ease-in-out infinite',
        }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '76px',
            height: '76px',
            borderRadius: '50%',
            background: 'rgba(255, 210, 63, 0.12)',
            border: '2px solid var(--den-gold)',
            boxShadow: '0 0 35px rgba(255, 210, 63, 0.35)',
            color: 'var(--den-gold)',
          }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/>
              <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
              <path d="M4 22h16"/>
              <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/>
              <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/>
              <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>
            </svg>
          </div>
        </div>

        {/* Winner name + score */}
        <div style={{ width: '100%', maxWidth: '340px' }}>
          <h1 style={{
            fontSize: 'clamp(1.8rem, 6vw, 3rem)',
            background: 'linear-gradient(135deg, #FFD23F, #F3BA22, #FFF8E7)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            marginBottom: '0.5rem', lineHeight: 1.2,
            letterSpacing: '0.04em',
          }}>
            {isWinner ? 'YOU WIN!' : `${winner?.name} Wins!`}
          </h1>
          <p style={{ color: 'var(--den-muted)', fontSize: 'clamp(0.9rem, 3vw, 1.05rem)', fontWeight: 600 }}>
            Final score:{' '}
            <strong style={{ color: 'var(--den-gold)', fontSize: 'clamp(1.1rem, 4vw, 1.4rem)' }}>
              {winner?.totalScore}
            </strong>{' '}
            points
          </p>
        </div>

        {/* Final scoreboard */}
        <div style={{
          background: 'rgba(13, 37, 39, 0.9)',
          border: '1px solid var(--den-border)',
          borderRadius: '16px',
          padding: '0.85rem 1.25rem',
          width: '100%',
          maxWidth: '320px',
          boxSizing: 'border-box',
        }}>
          {sortedPlayers.map((p, i) => (
            <div key={p.uid} style={{
              display: 'flex', justifyContent: 'space-between',
              alignItems: 'center', padding: '0.45rem 0',
              borderBottom: i < sortedPlayers.length - 1
                ? '1px solid var(--den-border)' : 'none',
            }}>
              <span style={{ fontSize: '0.88rem', fontWeight: 700, textAlign: 'left', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{
                  color: i === 0 ? 'var(--den-gold)' : 'var(--den-muted)',
                  fontSize: '0.75rem', fontWeight: 800, minWidth: '18px',
                }}>
                  #{i + 1}
                </span>
                {p.name}
                {p.uid === myUid && (
                  <span style={{
                    color: 'var(--den-muted)', fontSize: '0.72rem',
                  }}>
                    (you)
                  </span>
                )}
              </span>
              <span style={{
                fontWeight: 900, fontSize: '0.95rem',
                color: p.uid === winnerUid ? 'var(--den-gold)' : 'var(--den-text)',
                marginLeft: '1rem', flexShrink: 0,
              }}>
                {p.totalScore}
              </span>
            </div>
          ))}
        </div>

        {/* Action */}
        <div style={{ width: '100%', maxWidth: '280px' }}>
          {isHost ? (
            <button
              className="btn-primary"
              style={{ width: '100%', fontSize: '1.05rem', padding: '0.9rem' }}
              onClick={onPlayAgain}
            >
              Play Again
            </button>
          ) : (
            <p style={{ color: 'var(--den-muted)', fontSize: '0.9rem', fontWeight: 600 }}>
              Waiting for host to start a new game...
            </p>
          )}
        </div>

      </div>
    </div>
  );
}
