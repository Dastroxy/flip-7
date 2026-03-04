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

        {/* Trophy */}
        <div style={{
          fontSize: 'clamp(3rem, 12vw, 5rem)',
          animation: 'float 2s ease-in-out infinite',
        }}>
          {isWinner ? '🏆' : '🎉'}
        </div>

        {/* Winner name + score */}
        <div style={{ width: '100%', maxWidth: '320px' }}>
          <h1 style={{
            fontSize: 'clamp(1.6rem, 6vw, 3.5rem)',
            background: 'linear-gradient(135deg,#f5c542,#ff9f43,#ff4dab)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            marginBottom: '0.5rem', lineHeight: 1.2,
          }}>
            {isWinner ? '🎊 YOU WIN! 🎊' : `${winner?.name} Wins!`}
          </h1>
          <p style={{ color: 'var(--den-muted)', fontSize: 'clamp(0.9rem, 3vw, 1.1rem)' }}>
            Final score:{' '}
            <strong style={{ color: 'var(--den-gold)', fontSize: 'clamp(1.1rem, 4vw, 1.4rem)' }}>
              {winner?.totalScore}
            </strong>{' '}
            points
          </p>
        </div>

        {/* Final scoreboard */}
        <div style={{
          background: 'rgba(255,255,255,0.04)',
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
              alignItems: 'center', padding: '0.4rem 0',
              borderBottom: i < sortedPlayers.length - 1
                ? '1px solid var(--den-border)' : 'none',
            }}>
              <span style={{ fontSize: '0.9rem', fontWeight: 700, textAlign: 'left' }}>
                {['🥇','🥈','🥉'][i] ?? `${i + 1}.`} {p.name}
                {p.uid === myUid && (
                  <span style={{
                    color: 'var(--den-muted)', fontSize: '0.75rem', marginLeft: '0.3rem',
                  }}>
                    (you)
                  </span>
                )}
              </span>
              <span style={{
                fontWeight: 900, fontSize: '1rem',
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
              style={{ width: '100%', fontSize: '1.1rem', padding: '1rem' }}
              onClick={onPlayAgain}
            >
              🔄 Play Again
            </button>
          ) : (
            <p style={{ color: 'var(--den-muted)', fontSize: '0.95rem' }}>
              ⏳ Waiting for host to start a new game...
            </p>
          )}
        </div>

      </div>
    </div>
  );
}
