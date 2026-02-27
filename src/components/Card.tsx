import type { GameCard } from '../types/game';

interface CardProps {
  card: GameCard;
  faceDown?: boolean;
  small?: boolean;
}

// Each number gets its own vibrant colour + emoji
const numberMeta: Record<number, { color: string; bg: string; emoji: string }> = {
  0:  { color: '#fff',    bg: '#5c5c7a',  emoji: '🌀' },
  1:  { color: '#fff',    bg: '#ff4757',  emoji: '🔥' },
  2:  { color: '#1a1a2e', bg: '#ff9f43',  emoji: '⚡' },
  3:  { color: '#1a1a2e', bg: '#ffd32a',  emoji: '⭐' },
  4:  { color: '#1a1a2e', bg: '#0be881',  emoji: '🍀' },
  5:  { color: '#1a1a2e', bg: '#00d2d3',  emoji: '💎' },
  6:  { color: '#fff',    bg: '#54a0ff',  emoji: '🌊' },
  7:  { color: '#fff',    bg: '#5f27cd',  emoji: '🎯' },
  8:  { color: '#fff',    bg: '#ee5a24',  emoji: '💥' },
  9:  { color: '#fff',    bg: '#ff4dab',  emoji: '🎀' },
  10: { color: '#fff',    bg: '#c0392b',  emoji: '🌹' },
  11: { color: '#1a1a2e', bg: '#f9ca24',  emoji: '👑' },
  12: { color: '#fff',    bg: '#6c5ce7',  emoji: '🔮' },
};

const actionMeta: Record<string, { bg: string; border: string; emoji: string; label: string }> = {
  freeze:        { bg: 'linear-gradient(135deg,#4d9fff,#0652dd)', border: '#4d9fff', emoji: '🧊', label: 'FREEZE'      },
  flip_three:    { bg: 'linear-gradient(135deg,#b44dff,#6c3483)', border: '#b44dff', emoji: '⚡', label: 'FLIP THREE'  },
  second_chance: { bg: 'linear-gradient(135deg,#00d4aa,#00877a)', border: '#00d4aa', emoji: '🍀', label: '2ND CHANCE'  },
};

export default function Card({ card, faceDown, small }: CardProps) {
  const w = small ? '44px' : '62px';
  const h = small ? '60px' : '88px';
  // Slightly smaller font for two-digit numbers
  const numFs = small
    ? (card.value !== null && card.value >= 10 ? '0.85rem' : '1.15rem')
    : (card.value !== null && card.value >= 10 ? '1.25rem' : '1.7rem');
  const emojiFs = small ? '0.7rem' : '1rem';

  /* ── Face Down ── */
  if (faceDown) {
    return (
      <div style={{
        width: w, height: h, borderRadius: '10px', flexShrink: 0,
        background: 'linear-gradient(135deg,#1a1a3a,#2a1a4a)',
        border: '2px solid #5f27cd',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
      }}>
        <span style={{ fontSize: small ? '1.1rem' : '1.5rem' }}>🂠</span>
      </div>
    );
  }

  /* ── Number Card ── */
  if (card.type === 'number') {
    const meta = numberMeta[card.value ?? 0];
    return (
      <div className="card-deal-anim" style={{
        width: w, height: h, borderRadius: '10px', flexShrink: 0,
        background: meta.bg,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: small ? '1px' : '3px',
        boxShadow: `0 4px 16px ${meta.bg}55, 0 2px 6px rgba(0,0,0,0.4)`,
        border: `2px solid ${
          meta.color === '#fff'
            ? 'rgba(255,255,255,0.25)'
            : 'rgba(0,0,0,0.15)'
        }`,
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Shine overlay */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: '45%',
          background: 'linear-gradient(180deg,rgba(255,255,255,0.18) 0%,transparent 100%)',
          borderRadius: '8px 8px 0 0', pointerEvents: 'none',
        }} />
        <span style={{ fontSize: emojiFs, lineHeight: 1 }}>{meta.emoji}</span>
        <span style={{
          fontSize: numFs, fontWeight: 900, color: meta.color,
          fontFamily: 'Nunito, sans-serif', lineHeight: 1,
          textShadow: meta.color === '#fff' ? '0 1px 4px rgba(0,0,0,0.4)' : 'none',
        }}>
          {card.value}
        </span>
      </div>
    );
  }

  /* ── Modifier Card ── */
  if (card.type === 'modifier') {
    const isDouble = card.isDouble;
    const bg = isDouble
      ? 'linear-gradient(135deg,#f5c542,#ee5a24)'
      : 'linear-gradient(135deg,#ffd32a,#f5c542)';
    const border = isDouble ? '#ee5a24' : '#f5c542';
    const textColor = '#1a1a2e';

    return (
      <div className="card-deal-anim" style={{
        width: w, height: h, borderRadius: '10px', flexShrink: 0,
        background: bg,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: '2px',
        boxShadow: `0 4px 16px ${border}66, 0 2px 6px rgba(0,0,0,0.4)`,
        border: `2px solid rgba(255,255,255,0.3)`,
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: '45%',
          background: 'linear-gradient(180deg,rgba(255,255,255,0.25) 0%,transparent 100%)',
          borderRadius: '8px 8px 0 0', pointerEvents: 'none',
        }} />
        <span style={{ fontSize: emojiFs }}>{isDouble ? '✖️' : '➕'}</span>
        <span style={{
          fontSize: small ? '0.85rem' : '1.15rem',
          fontWeight: 900, color: textColor, lineHeight: 1,
        }}>
          {card.label}
        </span>
        {!small && (
          <span style={{
            fontSize: '0.5rem', color: textColor,
            opacity: 0.7, letterSpacing: '0.04em',
          }}>
            PTS
          </span>
        )}
      </div>
    );
  }

  /* ── Action Card ── */
  const meta = actionMeta[card.action ?? ''] ?? {
    bg: 'linear-gradient(135deg,#555,#333)',
    border: '#555', emoji: '?', label: '?',
  };

  return (
    <div className="card-deal-anim" style={{
      width: w, height: h, borderRadius: '10px', flexShrink: 0,
      background: meta.bg,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      gap: '3px',
      boxShadow: `0 4px 16px ${meta.border}55, 0 2px 6px rgba(0,0,0,0.5)`,
      border: `2px solid rgba(255,255,255,0.2)`,
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '45%',
        background: 'linear-gradient(180deg,rgba(255,255,255,0.15) 0%,transparent 100%)',
        borderRadius: '8px 8px 0 0', pointerEvents: 'none',
      }} />
      <span style={{ fontSize: small ? '1.1rem' : '1.5rem' }}>{meta.emoji}</span>
      <span style={{
        fontSize: small ? '0.45rem' : '0.58rem',
        fontWeight: 900, color: '#fff',
        letterSpacing: '0.06em', textAlign: 'center',
        lineHeight: 1.2, padding: '0 4px',
      }}>
        {meta.label}
      </span>
    </div>
  );
}
