import type { GameRoom } from '../types/game';

interface Props {
  room: GameRoom;
  myUid: string;
  onPlayAgain: () => void;
}

export default function WinOverlay({ room, myUid, onPlayAgain }: Props) {
  const winner = room.winnerUid ? room.players[room.winnerUid] : null;
  const isHost = room.hostUid === myUid;
  const isWinner = room.winnerUid === myUid;

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(0,0,0,0.92)',
      backdropFilter: 'blur(10px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 2000, flexDirection: 'column', gap: '1.25rem',
      padding: '2rem', textAlign: 'center',
    }}>
      {/* Confetti-style top */}
      <div style={{ fontSize: '5rem', animation: 'float 2s ease-in-out infinite' }}>
        {isWinner ? '🏆' : '🎉'}
      </div>

      <div>
        <h1 style={{
          fontSize: 'clamp(2rem, 6vw, 3.5rem)',
          background: 'linear-gradient(135deg,#f5c542,#ff9f43,#ff4dab)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          marginBottom: '0.5rem',
        }}>
          {isWinner ? '🎊 YOU WIN! 🎊' : `${winner?.name} Wins!`}
        </h1>
        <p style={{ color: 'var(--den-muted)', fontSize: '1.1rem' }}>
          Final score:{' '}
          <strong style={{ color: 'var(--den-gold)', fontSize: '1.4rem' }}>
            {winner?.totalScore}
          </strong>{' '}
          points
        </p>
      </div>

      {/* Final scores */}
      <div style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid var(--den-border)',
        borderRadius: '16px', padding: '1rem 1.5rem',
        minWidth: '240px',
      }}>
        {[...room.playerOrder]
          .map(uid => room.players[uid])
          .sort((a, b) => b.totalScore - a.totalScore)
          .map((p, i) => (
            <div key={p.uid} style={{
              display: 'flex', justifyContent: 'space-between',
              alignItems: 'center', padding: '0.35rem 0',
              borderBottom: i < room.playerOrder.length - 1
                ? '1px solid var(--den-border)' : 'none',
            }}>
              <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>
                {['🥇','🥈','🥉'][i] ?? `${i+1}.`} {p.name}
                {p.uid === myUid && (
                  <span style={{ color: 'var(--den-muted)', fontSize: '0.75rem', marginLeft: '0.3rem' }}>
                    (you)
                  </span>
                )}
              </span>
              <span style={{
                fontWeight: 900, fontSize: '1rem',
                color: p.uid === room.winnerUid ? 'var(--den-gold)' : 'var(--den-text)',
              }}>
                {p.totalScore}
              </span>
            </div>
          ))
        }
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%', maxWidth: '280px', marginTop: '0.5rem' }}>
        {isHost ? (
          <button className="btn-primary" style={{ fontSize: '1.1rem', padding: '1rem' }} onClick={onPlayAgain}>
            🔄 Play Again
          </button>
        ) : (
          <p style={{ color: 'var(--den-muted)', fontSize: '0.95rem' }}>
            ⏳ Waiting for host to start a new game...
          </p>
        )}
      </div>
    </div>
  );
}
