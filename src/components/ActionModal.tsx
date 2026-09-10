import { useState, type ReactNode } from 'react';
import type { GameRoom } from '../types/game';

interface Props {
  room: GameRoom;
  myUid: string;
  onResolve: (targetUid: string) => void;
}

const actionInfo: Record<string, { title: string; desc: string; color: string; icon: ReactNode }> = {
  freeze: {
    title: 'FREEZE',
    color: '#38bdf8',
    desc: 'Target player banks their current round score and exits the round safely.',
    icon: (
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
      </svg>
    ),
  },
  flip_three: {
    title: 'FLIP THREE',
    color: '#c084fc',
    desc: 'Target player must flip 3 consecutive cards from the draw deck.',
    icon: (
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#c084fc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="14" height="14" rx="2" />
        <path d="M6 3h14a2 2 0 0 1 2 2v12" />
      </svg>
    ),
  },
  second_chance: {
    title: 'SECOND CHANCE',
    color: '#34d399',
    desc: 'Give this card to any active player as a one-time protection shield against busting.',
    icon: (
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    ),
  },
};

export default function ActionModal({ room, myUid, onResolve }: Props) {
  const pa = room.pendingAction!;
  const info = actionInfo[pa.action] ?? {
    title: 'ACTION CARD',
    color: '#f5c542',
    desc: 'Resolve this action card.',
    icon: null,
  };

  const [minimised, setMinimised] = useState(false);

  const canResolve = pa.sourcePlayerId === myUid;

  const validTargets = room.playerOrder
    .map(uid => room.players[uid])
    .filter(p => p && p.status === 'active');

  const noTargets = validTargets.length === 0;

  // ── Minimised pill ──────────────────────────────────────────────────────
  if (minimised) {
    return (
      <div style={{
        position: 'fixed', bottom: 'max(5rem, calc(env(safe-area-inset-bottom) + 5rem))',
        left: '50%', transform: 'translateX(-50%)',
        zIndex: 1000,
      }}>
        <button
          onClick={() => setMinimised(false)}
          style={{
            background: 'rgba(13, 35, 25, 0.98)',
            border: `2px solid ${info.color}`,
            borderRadius: '50px',
            padding: '0.55rem 1.2rem',
            display: 'flex', alignItems: 'center', gap: '0.65rem',
            cursor: 'pointer',
            boxShadow: `0 0 20px ${info.color}55`,
            color: '#fff',
            fontFamily: 'Nunito, sans-serif',
            fontWeight: 800,
            fontSize: '0.9rem',
            animation: 'pulseSlow 1.8s ease-in-out infinite',
          }}
        >
          <span style={{ color: info.color }}>{info.title}</span>
          <span style={{
            background: info.color, color: '#06170f',
            borderRadius: '20px', padding: '0.15rem 0.6rem',
            fontSize: '0.72rem', fontWeight: 900, letterSpacing: '0.04em',
          }}>
            RESOLVE ACTION
          </span>
        </button>
      </div>
    );
  }

  // ── Full modal ──────────────────────────────────────────────────────────
  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(0,0,0,0.82)',
      backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: '1rem',
    }}>
      <div style={{
        background: 'rgba(13, 35, 25, 0.98)',
        border: `2px solid ${info.color}`,
        borderRadius: '24px',
        padding: '2rem 1.75rem',
        maxWidth: '420px', width: '100%',
        textAlign: 'center',
        boxShadow: `0 0 40px ${info.color}44`,
        position: 'relative',
      }}>

        {/* Minimise button */}
        <button
          onClick={() => setMinimised(true)}
          title="Minimise to inspect player cards"
          style={{
            position: 'absolute', top: '1rem', right: '1rem',
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: '8px',
            color: 'var(--den-muted)',
            fontSize: '0.75rem', fontWeight: 800,
            padding: '0.35rem 0.7rem',
            cursor: 'pointer',
            lineHeight: 1,
          }}
        >
          Inspect Cards
        </button>

        {/* Icon circle */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '72px',
          height: '72px',
          borderRadius: '50%',
          background: `${info.color}15`,
          border: `1.5px solid ${info.color}44`,
          marginBottom: '1rem',
        }}>
          {info.icon}
        </div>

        <h2 style={{ fontSize: '1.5rem', color: info.color, marginBottom: '0.5rem', letterSpacing: '0.05em' }}>
          {info.title}
        </h2>
        <p style={{
          color: 'var(--den-muted)', fontSize: '0.88rem',
          marginBottom: '1.75rem', lineHeight: 1.6,
        }}>
          {info.desc}
        </p>

        {canResolve ? (
          noTargets ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <p style={{ color: 'var(--den-muted)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                No active targets available — card will be discarded.
              </p>
              <button
                onClick={() => onResolve(pa.sourcePlayerId)}
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '2px solid rgba(255,255,255,0.15)',
                  borderRadius: '14px',
                  color: '#fff',
                  padding: '0.75rem 1rem',
                  fontSize: '0.95rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                Discard &amp; Continue
              </button>
            </div>
          ) : (
            <>
              <p style={{
                fontSize: '0.8rem', color: 'var(--den-text)',
                marginBottom: '1rem', fontWeight: 800,
                letterSpacing: '0.08em',
              }}>
                SELECT TARGET PLAYER
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {validTargets.map(p => (
                  <button
                    key={p.uid}
                    onClick={() => onResolve(p.uid)}
                    style={{
                      background: `${info.color}18`,
                      border: `1.5px solid ${info.color}`,
                      borderRadius: '14px',
                      color: '#fff',
                      padding: '0.75rem 1rem',
                      fontSize: '0.95rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      transition: 'background 0.15s, transform 0.1s',
                      display: 'flex', alignItems: 'center',
                      justifyContent: 'center', gap: '0.55rem',
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLElement).style.background = `${info.color}33`;
                      (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.background = `${info.color}18`;
                      (e.currentTarget as HTMLElement).style.transform = 'none';
                    }}
                  >
                    <span style={{
                      width: '26px', height: '26px', borderRadius: '50%',
                      background: info.color,
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.75rem', fontWeight: 900, color: '#06170f',
                    }}>
                      {p.name[0].toUpperCase()}
                    </span>
                    {p.name}
                    {p.uid === myUid && (
                      <span style={{ fontSize: '0.75rem', color: 'var(--den-muted)' }}>(you)</span>
                    )}
                  </button>
                ))}
              </div>
            </>
          )
        ) : (
          <div style={{
            background: 'rgba(255,255,255,0.04)', borderRadius: '14px',
            padding: '1rem', color: 'var(--den-muted)', fontSize: '0.9rem', fontWeight: 600,
          }}>
            <strong style={{ color: 'var(--den-text)' }}>
              {room.players[pa.sourcePlayerId]?.name}
            </strong> is choosing a target...
          </div>
        )}
      </div>
    </div>
  );
}
