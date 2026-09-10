import type { GameCard } from '../types/game';

interface CardProps {
  card: GameCard;
  faceDown?: boolean;
  small?: boolean;
}

// Crisp, high-contrast palette for Flip 7 numbers
const numberMeta: Record<number, { color: string; bg: string; border: string }> = {
  0:  { color: '#ffffff', bg: '#475569', border: '#64748b' },
  1:  { color: '#ffffff', bg: '#e11d48', border: '#f43f5e' },
  2:  { color: '#ffffff', bg: '#ea580c', border: '#f97316' },
  3:  { color: '#06170f', bg: '#f59e0b', border: '#fbbf24' },
  4:  { color: '#ffffff', bg: '#059669', border: '#10b981' },
  5:  { color: '#ffffff', bg: '#0891b2', border: '#06b6d4' },
  6:  { color: '#ffffff', bg: '#2563eb', border: '#3b82f6' },
  7:  { color: '#ffffff', bg: '#7c3aed', border: '#e6be68' }, // Title card: signature gold accent
  8:  { color: '#ffffff', bg: '#dc2626', border: '#ef4444' },
  9:  { color: '#ffffff', bg: '#db2777', border: '#ec4899' },
  10: { color: '#ffffff', bg: '#b91c1c', border: '#dc2626' },
  11: { color: '#06170f', bg: '#eab308', border: '#facc15' },
  12: { color: '#ffffff', bg: '#4338ca', border: '#6366f1' },
};

export default function Card({ card, faceDown, small }: CardProps) {
  const w = small ? '46px' : '64px';
  const h = small ? '64px' : '92px';

  /* ── Face Down (Luxury tournament geometric card back) ── */
  if (faceDown) {
    return (
      <div style={{
        width: w,
        height: h,
        borderRadius: '10px',
        flexShrink: 0,
        background: 'linear-gradient(135deg, #051a11 0%, #0d2e20 50%, #06160e 100%)',
        border: '1.5px solid rgba(230, 190, 104, 0.7)',
        boxShadow: '0 4px 14px rgba(0,0,0,0.55)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Inner geometric border */}
        <div style={{
          position: 'absolute',
          inset: '3px',
          border: '1px solid rgba(230, 190, 104, 0.3)',
          borderRadius: '7px',
          pointerEvents: 'none',
        }} />
        {/* Centered geometric 7 emblem */}
        <div style={{
          width: small ? '22px' : '30px',
          height: small ? '22px' : '30px',
          border: '1.5px solid rgba(230, 190, 104, 0.85)',
          transform: 'rotate(45deg)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(230, 190, 104, 0.15)',
        }}>
          <span style={{
            transform: 'rotate(-45deg)',
            fontFamily: 'Cinzel, serif',
            fontWeight: 900,
            fontSize: small ? '0.8rem' : '1.1rem',
            color: 'var(--den-gold)',
            lineHeight: 1,
          }}>
            7
          </span>
        </div>
      </div>
    );
  }

  /* ── Number Card ── */
  if (card.type === 'number') {
    const val = card.value ?? 0;
    const meta = numberMeta[val] ?? { color: '#ffffff', bg: '#475569', border: '#64748b' };
    const isSeven = val === 7;

    return (
      <div className="card card-deal-anim" style={{
        width: w,
        height: h,
        borderRadius: '10px',
        flexShrink: 0,
        background: meta.bg,
        boxShadow: isSeven
          ? '0 4px 16px rgba(230,190,104,0.45), 0 2px 6px rgba(0,0,0,0.4)'
          : `0 4px 14px ${meta.bg}66, 0 2px 6px rgba(0,0,0,0.35)`,
        border: isSeven ? '2px solid #e6be68' : `1.5px solid ${meta.border}`,
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: small ? '3px 4px' : '5px 6px',
        boxSizing: 'border-box',
        userSelect: 'none',
      }}>
        {/* Top-left corner index */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          lineHeight: 1,
        }}>
          <span style={{
            fontSize: small ? '0.7rem' : '0.85rem',
            fontWeight: 900,
            color: meta.color,
            fontFamily: 'Nunito, sans-serif',
          }}>
            {val}
          </span>
          {!small && isSeven && (
            <span style={{
              fontSize: '0.42rem',
              fontWeight: 900,
              color: '#ffd32a',
              letterSpacing: '0.04em',
              lineHeight: 1,
              marginTop: '1px',
            }}>
              FLIP
            </span>
          )}
        </div>

        {/* Center large value */}
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
        }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <span style={{
              fontSize: small ? (val >= 10 ? '1.15rem' : '1.35rem') : (val >= 10 ? '1.75rem' : '2.1rem'),
              fontWeight: 900,
              color: meta.color,
              fontFamily: 'Nunito, sans-serif',
              lineHeight: 1,
              textShadow: meta.color === '#ffffff' ? '0 1px 3px rgba(0,0,0,0.3)' : 'none',
            }}>
              {val}
            </span>
            {!small && (
              <span style={{
                fontSize: '0.48rem',
                fontWeight: 800,
                letterSpacing: '0.12em',
                color: meta.color,
                opacity: 0.75,
                marginTop: '2px',
                textTransform: 'uppercase',
              }}>
                {val === 0 ? 'ZERO' : isSeven ? 'FLIP 7' : 'POINTS'}
              </span>
            )}
          </div>
        </div>

        {/* Bottom-right inverted corner index */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          lineHeight: 1,
          transform: 'rotate(180deg)',
        }}>
          <span style={{
            fontSize: small ? '0.7rem' : '0.85rem',
            fontWeight: 900,
            color: meta.color,
            fontFamily: 'Nunito, sans-serif',
          }}>
            {val}
          </span>
        </div>
      </div>
    );
  }

  /* ── Modifier Card ── */
  if (card.type === 'modifier') {
    const isDouble = card.isDouble;
    const bg = isDouble
      ? 'linear-gradient(135deg, #c2410c 0%, #ea580c 100%)'
      : 'linear-gradient(135deg, #b45309 0%, #d97706 100%)';
    const border = isDouble ? '#fb923c' : '#fcd34d';

    return (
      <div className="card card-deal-anim" style={{
        width: w,
        height: h,
        borderRadius: '10px',
        flexShrink: 0,
        background: bg,
        boxShadow: `0 4px 14px rgba(0,0,0,0.4)`,
        border: `1.5px solid ${border}`,
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: small ? '3px 4px' : '5px 6px',
        boxSizing: 'border-box',
        userSelect: 'none',
      }}>
        {/* Top-left corner */}
        <span style={{
          fontSize: small ? '0.65rem' : '0.8rem',
          fontWeight: 900,
          color: '#ffffff',
          lineHeight: 1,
        }}>
          {isDouble ? 'X' : '+'}
        </span>

        {/* Center label */}
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
        }}>
          <span style={{
            fontSize: small ? '0.95rem' : '1.35rem',
            fontWeight: 900,
            color: '#ffffff',
            lineHeight: 1,
            textShadow: '0 1px 3px rgba(0,0,0,0.4)',
          }}>
            {card.label}
          </span>
          {!small && (
            <span style={{
              fontSize: '0.45rem',
              fontWeight: 800,
              letterSpacing: '0.12em',
              color: '#ffffff',
              opacity: 0.85,
              marginTop: '3px',
              textTransform: 'uppercase',
            }}>
              {isDouble ? 'MULTIPLY' : 'BONUS PTS'}
            </span>
          )}
        </div>

        {/* Bottom-right corner */}
        <span style={{
          fontSize: small ? '0.65rem' : '0.8rem',
          fontWeight: 900,
          color: '#ffffff',
          lineHeight: 1,
          transform: 'rotate(180deg)',
          alignSelf: 'flex-end',
        }}>
          {isDouble ? 'X' : '+'}
        </span>
      </div>
    );
  }

  /* ── Action Card ── */
  interface ActionConfig {
    bg: string;
    border: string;
    title: string;
    sub: string;
    icon: React.ReactNode;
  }

  const actionConfigs: Record<string, ActionConfig> = {
    freeze: {
      bg: 'linear-gradient(135deg, #0369a1 0%, #0284c7 100%)',
      border: '#38bdf8',
      title: 'FREEZE',
      sub: 'BANK',
      icon: (
        <svg width={small ? '14' : '20'} height={small ? '14' : '20'} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        </svg>
      ),
    },
    flip_three: {
      bg: 'linear-gradient(135deg, #6b21a8 0%, #9333ea 100%)',
      border: '#c084fc',
      title: 'FLIP 3',
      sub: 'DRAW 3',
      icon: (
        <svg width={small ? '14' : '20'} height={small ? '14' : '20'} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="7" width="14" height="14" rx="2" />
          <path d="M6 3h14a2 2 0 0 1 2 2v12" />
        </svg>
      ),
    },
    second_chance: {
      bg: 'linear-gradient(135deg, #065f46 0%, #059669 100%)',
      border: '#34d399',
      title: '2ND CHANCE',
      sub: 'SHIELD',
      icon: (
        <svg width={small ? '14' : '20'} height={small ? '14' : '20'} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        </svg>
      ),
    },
  };

  const actionDetails = (card.action ? actionConfigs[card.action] : null) ?? {
    bg: 'linear-gradient(135deg, #374151 0%, #1f2937 100%)',
    border: '#9ca3af',
    title: 'ACTION',
    sub: 'PLAY',
    icon: null,
  };

  return (
    <div className="card card-deal-anim" style={{
      width: w,
      height: h,
      borderRadius: '10px',
      flexShrink: 0,
      background: actionDetails.bg,
      boxShadow: `0 4px 14px rgba(0,0,0,0.4)`,
      border: `1.5px solid ${actionDetails.border}`,
      position: 'relative',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: small ? '3px 4px' : '6px 4px',
      boxSizing: 'border-box',
      userSelect: 'none',
      color: '#ffffff',
    }}>
      {/* Icon */}
      <div style={{ marginBottom: small ? '1px' : '4px', opacity: 0.95 }}>
        {actionDetails.icon}
      </div>

      {/* Main Title */}
      <span style={{
        fontSize: small ? '0.52rem' : '0.72rem',
        fontWeight: 900,
        letterSpacing: '0.04em',
        textAlign: 'center',
        lineHeight: 1.15,
        color: '#ffffff',
      }}>
        {actionDetails.title}
      </span>

      {/* Subtitle */}
      {!small && (
        <span style={{
          fontSize: '0.45rem',
          fontWeight: 800,
          letterSpacing: '0.12em',
          opacity: 0.8,
          marginTop: '3px',
          textTransform: 'uppercase',
        }}>
          {actionDetails.sub}
        </span>
      )}
    </div>
  );
}
