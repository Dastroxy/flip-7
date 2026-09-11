import { useState } from 'react';
import type { GameRoom, GameCard } from '../types/game';
import Card from './Card';
import FlipSevenLogo from './FlipSevenLogo';

interface Props {
  room: GameRoom;
  myUid: string;
}

const avatarColors = [
  '#ff4757','#ff9f43','#ffd32a','#0be881',
  '#00d2d3','#54a0ff','#5f27cd','#ff4dab',
];
function getAvatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return avatarColors[Math.abs(hash) % avatarColors.length];
}

const rankColors = ['#EF6C4A', '#FFD23F', '#5DADE2'];

export default function Scoreboard({ room, myUid }: Props) {
  const [showDiscard, setShowDiscard] = useState(false);

  const sorted = [...room.playerOrder]
    .map(uid => room.players[uid])
    .sort((a, b) => b.totalScore - a.totalScore);

  const discard: GameCard[] = room.discard ?? [];

  return (
    <>
      <div style={{
        background: 'rgba(13, 37, 39, 0.95)',
        border: '1px solid var(--den-border)',
        borderRadius: '16px',
        padding: '0.85rem',
        backdropFilter: 'blur(12px)',
        width: '100%',
      }}>
        {/* Header */}
        <h3 style={{
          fontSize: '0.72rem', color: 'var(--den-muted)',
          letterSpacing: '0.14em', marginBottom: '0.75rem', fontWeight: 800,
        }}>
          SCOREBOARD
        </h3>

        {/* Player rows */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '0.85rem' }}>
          {sorted.map((p, i) => {
            const color = getAvatarColor(p.name);
            const pct = Math.min((p.totalScore / 200) * 100, 100);
            return (
              <div key={p.uid} style={{
                background: p.uid === myUid
                  ? 'rgba(43, 168, 162, 0.12)' : 'rgba(255,255,255,0.03)',
                borderRadius: '10px', padding: '0.4rem 0.6rem',
                border: p.uid === myUid
                  ? '1px solid rgba(43, 168, 162, 0.35)' : '1px solid transparent',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '4px' }}>
                  <span style={{
                    fontSize: '0.68rem', width: '18px', height: '18px',
                    borderRadius: '4px', textAlign: 'center', lineHeight: '18px',
                    fontWeight: 900,
                    color: i < 3 ? rankColors[i] : 'var(--den-muted)',
                    background: i < 3 ? 'rgba(255,255,255,0.06)' : 'transparent',
                  }}>
                    {i + 1}
                  </span>
                  <div style={{
                    width: '20px', height: '20px', borderRadius: '50%',
                    background: color, flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.65rem', fontWeight: 900, color: '#fff',
                  }}>
                    {p.name[0].toUpperCase()}
                  </div>
                  <span style={{
                    flex: 1, fontSize: '0.78rem', fontWeight: 700,
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    color: p.uid === myUid ? '#fff' : 'var(--den-text)',
                  }}>
                    {p.name}
                  </span>
                  <span style={{
                    fontWeight: 900, fontSize: '0.88rem',
                    color: p.totalScore >= 180 ? 'var(--den-gold)' : 'var(--den-text)',
                  }}>
                    {p.totalScore}
                  </span>
                </div>
                <div style={{
                  height: '3px', borderRadius: '2px',
                  background: 'rgba(255,255,255,0.08)', overflow: 'hidden',
                }}>
                  <div style={{
                    height: '100%', width: `${pct}%`,
                    background: pct >= 90
                      ? 'linear-gradient(90deg, #FFD23F, #FFE082)'
                      : `linear-gradient(90deg,${color},${color}aa)`,
                    borderRadius: '2px',
                    transition: 'width 0.5s ease',
                  }} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Divider */}
        <div style={{ borderTop: '1px solid var(--den-border)', marginBottom: '0.75rem' }} />

        {/* Draw pile + Discard pile */}
        <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'stretch' }}>

          {/* Draw pile */}
          <div style={{
            flex: 1,
            background: 'rgba(39, 174, 96, 0.08)',
            border: '1px solid rgba(39, 174, 96, 0.25)',
            borderRadius: '12px',
            padding: '0.6rem 0.5rem',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', gap: '0.3rem',
          }}>
            {/* Stacked card visual */}
            <div style={{ position: 'relative', width: '38px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FlipSevenLogo size={46} style={{ filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.5))' }} />
            </div>
            <div style={{
              fontWeight: 900, fontSize: '1.1rem',
              background: 'linear-gradient(135deg, #2ECC71, #27AE60)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>
              {room.deck.length}
            </div>
            <div style={{
              fontSize: '0.6rem', color: 'var(--den-muted)',
              fontWeight: 700, letterSpacing: '0.06em', textAlign: 'center',
            }}>
              DRAW PILE
            </div>
          </div>

          {/* Discard pile — tappable */}
          <div
            onClick={() => discard.length > 0 && setShowDiscard(true)}
            style={{
              flex: 1,
              background: 'rgba(239, 108, 74, 0.08)',
              border: '1px solid rgba(239, 108, 74, 0.25)',
              borderRadius: '12px',
              padding: '0.6rem 0.5rem',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', gap: '0.3rem',
              cursor: discard.length > 0 ? 'pointer' : 'default',
              transition: 'background 0.15s, border-color 0.15s',
            }}
            onMouseEnter={e => {
              if (discard.length > 0) {
                (e.currentTarget as HTMLElement).style.background = 'rgba(255,77,109,0.12)';
                (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,77,109,0.45)';
              }
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.background = 'rgba(255,77,109,0.06)';
              (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,77,109,0.2)';
            }}
          >
            {/* Top card preview or empty state */}
            <div style={{ position: 'relative', width: '36px', height: '48px' }}>
              {discard.length > 1 && (
                <div style={{
                  position: 'absolute', top: '4px', left: '2px',
                  width: '32px', height: '44px',
                  background: 'rgba(255,77,109,0.08)',
                  border: '1px solid rgba(255,77,109,0.15)',
                  borderRadius: '6px',
                }} />
              )}
              <div style={{
                position: 'absolute', top: '0', left: '0',
                width: '32px', height: '44px',
                background: discard.length > 0
                  ? 'rgba(255,77,109,0.15)'
                  : 'rgba(255,255,255,0.03)',
                border: `1px solid ${discard.length > 0 ? 'rgba(255,77,109,0.4)' : 'rgba(255,255,255,0.08)'}`,
                borderRadius: '6px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{
                  fontSize: '0.75rem',
                  fontWeight: 900,
                  color: discard.length > 0 ? 'var(--den-red)' : 'var(--den-muted)',
                }}>
                  {discard.length > 0 ? 'OUT' : '—'}
                </span>
              </div>
            </div>
            <div style={{
              fontWeight: 900, fontSize: '1.1rem',
              color: discard.length > 0 ? 'var(--den-red)' : 'var(--den-muted)',
            }}>
              {discard.length}
            </div>
            <div style={{
              fontSize: '0.6rem', color: 'var(--den-muted)',
              fontWeight: 700, letterSpacing: '0.06em', textAlign: 'center',
            }}>
              DISCARD
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          marginTop: '0.75rem', borderTop: '1px solid var(--den-border)',
          paddingTop: '0.55rem', fontSize: '0.65rem',
          color: 'var(--den-muted)', textAlign: 'center', fontWeight: 600,
        }}>
          First to 200 points wins · Round {room.round}
        </div>
      </div>

      {/* ── Discard pile modal ─────────────────────────────────────────── */}
      {showDiscard && (
        <div
          onClick={() => setShowDiscard(false)}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.82)',
            backdropFilter: 'blur(6px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 2000, padding: '1rem',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: 'rgba(13, 37, 39, 0.99)',
              border: '2px solid rgba(239, 108, 74, 0.4)',
              borderRadius: '22px',
              padding: '1.5rem',
              width: '100%', maxWidth: '480px',
              maxHeight: '80dvh',
              display: 'flex', flexDirection: 'column',
              boxShadow: '0 0 40px rgba(239, 108, 74, 0.25)',
            }}
          >
            {/* Modal header */}
            <div style={{
              display: 'flex', alignItems: 'center',
              justifyContent: 'space-between', marginBottom: '1rem',
            }}>
              <h2 style={{
                fontSize: '1rem', color: 'var(--den-coral)',
                margin: 0, letterSpacing: '0.08em',
              }}>
                DISCARD PILE
                <span style={{
                  marginLeft: '0.6rem', fontSize: '0.75rem',
                  color: 'var(--den-muted)', fontFamily: 'Space Grotesk, sans-serif',
                  fontWeight: 700,
                }}>
                  {discard.length} card{discard.length !== 1 ? 's' : ''}
                </span>
              </h2>
              <button
                onClick={() => setShowDiscard(false)}
                style={{
                  background: 'rgba(255,255,255,0.07)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: '50%', width: '32px', height: '32px',
                  color: '#fff', fontSize: '1rem',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', flexShrink: 0,
                }}
              >
                ✕
              </button>
            </div>

            <p style={{
              fontSize: '0.72rem', color: 'var(--den-muted)',
              marginBottom: '1rem', fontWeight: 600,
            }}>
              Chronological order — oldest first (left) → newest (right)
            </p>

            {/* Scrollable card grid */}
            <div style={{
              overflowY: 'auto',
              WebkitOverflowScrolling: 'touch',
              flex: 1,
            }}>
              <div style={{
                display: 'flex', flexWrap: 'wrap',
                gap: '0.5rem', alignContent: 'flex-start',
              }}>
                {discard.map((card, idx) => (
                  <div key={`${card.id}-${idx}`} style={{ position: 'relative' }}>
                    <Card card={card} small />
                    <div style={{
                      position: 'absolute', bottom: '-6px', right: '-4px',
                      background: 'rgba(0,0,0,0.75)',
                      borderRadius: '4px', padding: '0 3px',
                      fontSize: '0.5rem', color: 'var(--den-muted)',
                      fontWeight: 700, lineHeight: '14px',
                    }}>
                      {idx + 1}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => setShowDiscard(false)}
              className="btn-secondary"
              style={{ marginTop: '1rem', width: '100%' }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
