import { useState } from 'react';
import type { GameRoom } from '../types/game';

interface Props {
  room: GameRoom;
  myUid: string;
  onResolve: (targetUid: string) => void;
}

const actionInfo: Record<string, { emoji: string; title: string; desc: string; color: string }> = {
  freeze:        { emoji: '🧊', title: 'FREEZE!',        color: '#4d9fff', desc: 'Chosen player banks their current points and exits the round.' },
  flip_three:    { emoji: '⚡', title: 'FLIP THREE!',    color: '#b44dff', desc: 'Chosen player must flip 3 more cards, one at a time.' },
  second_chance: { emoji: '🍀', title: 'SECOND CHANCE!', color: '#00d4aa', desc: 'Give this card to an active player as a one-time bust shield.' },
};

export default function ActionModal({ room, myUid, onResolve }: Props) {
  const pa = room.pendingAction!;
  const info = actionInfo[pa.action] ?? {
    emoji: '🎴', title: 'ACTION CARD', color: '#f5c542', desc: 'Resolve this card.',
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
            background: 'rgba(22,22,40,0.97)',
            border: `2px solid ${info.color}`,
            borderRadius: '50px',
            padding: '0.55rem 1.2rem',
            display: 'flex', alignItems: 'center', gap: '0.55rem',
            cursor: 'pointer',
            boxShadow: `0 0 20px ${info.color}55`,
            color: '#fff',
            fontFamily: 'Nunito, sans-serif',
            fontWeight: 800,
            fontSize: '0.9rem',
            animation: 'pulseSlow 1.8s ease-in-out infinite',
          }}
        >
          <span style={{ fontSize: '1.2rem' }}>{info.emoji}</span>
          <span style={{ color: info.color }}>{info.title}</span>
          <span style={{
            background: info.color, color: '#1a1a2e',
            borderRadius: '20px', padding: '0.1rem 0.55rem',
            fontSize: '0.72rem', fontWeight: 900,
          }}>
            TAP TO RESOLVE
          </span>
        </button>
      </div>
    );
  }

  // ── Full modal ──────────────────────────────────────────────────────────
  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(0,0,0,0.8)',
      backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: '1rem',
    }}>
      <div style={{
        background: 'rgba(22,22,40,0.98)',
        border: `2px solid ${info.color}`,
        borderRadius: '24px',
        padding: '2rem',
        maxWidth: '420px', width: '100%',
        textAlign: 'center',
        boxShadow: `0 0 40px ${info.color}44`,
        position: 'relative',
      }}>

        {/* Minimise button — all players */}
        <button
          onClick={() => setMinimised(true)}
          title="Minimise to inspect player cards"
          style={{
            position: 'absolute', top: '0.9rem', right: '0.9rem',
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: '8px',
            color: 'var(--den-muted)',
            fontSize: '0.75rem', fontWeight: 800,
            padding: '0.3rem 0.6rem',
            cursor: 'pointer',
            lineHeight: 1,
          }}
        >
          ↙ Inspect
        </button>

        <div style={{ fontSize: '4rem', marginBottom: '0.5rem' }}>{info.emoji}</div>
        <h2 style={{ fontSize: '1.6rem', color: info.color, marginBottom: '0.5rem' }}>
          {info.title}
        </h2>
        <p style={{
          color: 'var(--den-muted)', fontSize: '0.9rem',
          marginBottom: '1.75rem', lineHeight: 1.6,
        }}>
          {info.desc}
        </p>

        {canResolve ? (
          noTargets ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <p style={{ color: 'var(--den-muted)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                No valid targets available — card will be discarded.
              </p>
              <button
                onClick={() => onResolve(pa.sourcePlayerId)}
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '2px solid rgba(255,255,255,0.15)',
                  borderRadius: '14px',
                  color: '#fff',
                  padding: '0.75rem 1rem',
                  fontSize: '1rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                Discard &amp; Continue ▶
              </button>
            </div>
          ) : (
            <>
              <p style={{
                fontSize: '0.82rem', color: 'var(--den-text)',
                marginBottom: '1rem', fontWeight: 700,
                letterSpacing: '0.06em',
              }}>
                CHOOSE A TARGET
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {validTargets.map(p => (
                  <button
                    key={p.uid}
                    onClick={() => onResolve(p.uid)}
                    style={{
                      background: `${info.color}1a`,
                      border: `2px solid ${info.color}`,
                      borderRadius: '14px',
                      color: '#fff',
                      padding: '0.75rem 1rem',
                      fontSize: '1rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      transition: 'background 0.15s, transform 0.1s',
                      display: 'flex', alignItems: 'center',
                      justifyContent: 'center', gap: '0.5rem',
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLElement).style.background = `${info.color}33`;
                      (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.background = `${info.color}1a`;
                      (e.currentTarget as HTMLElement).style.transform = 'none';
                    }}
                  >
                    <span style={{
                      width: '28px', height: '28px', borderRadius: '50%',
                      background: info.color,
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.8rem', fontWeight: 900, color: '#1a1a2e',
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
            padding: '1rem', color: 'var(--den-muted)', fontSize: '0.95rem',
          }}>
            ⏳ <strong style={{ color: 'var(--den-text)' }}>
              {room.players[pa.sourcePlayerId]?.name}
            </strong> is choosing a target...
          </div>
        )}
      </div>
    </div>
  );
}
