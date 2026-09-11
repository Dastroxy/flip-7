import type { GameCard } from '../types/game';
import FlipSevenLogo from './FlipSevenLogo';

interface CardProps {
  card: GameCard;
  faceDown?: boolean;
  small?: boolean;
}

const NUMERAL_FONT = '"Space Grotesk", sans-serif';
const MONO_FONT = '"JetBrains Mono", monospace';

// Midnight Arcade Table Neon Palette (matching screen.png reference)
const numberMeta: Record<number, { color: string; border: string; glow: string; name: string }> = {
  0:  { color: '#CBD5E1', border: 'rgba(203, 213, 225, 0.35)', glow: 'rgba(203, 213, 225, 0.18)', name: 'ZERO' },
  1:  { color: '#F43F5E', border: 'rgba(244, 63, 94, 0.45)', glow: 'rgba(244, 63, 94, 0.25)', name: 'ONE' },
  2:  { color: '#06B6D4', border: 'rgba(6, 182, 212, 0.45)', glow: 'rgba(6, 182, 212, 0.25)', name: 'TWO' },
  3:  { color: '#F59E0B', border: 'rgba(245, 158, 11, 0.45)', glow: 'rgba(245, 158, 11, 0.25)', name: 'THREE' },
  4:  { color: '#10B981', border: 'rgba(16, 185, 129, 0.45)', glow: 'rgba(16, 185, 129, 0.25)', name: 'FOUR' },
  5:  { color: '#F97316', border: 'rgba(249, 115, 22, 0.45)', glow: 'rgba(249, 115, 22, 0.25)', name: 'FIVE' },
  6:  { color: '#3B82F6', border: 'rgba(59, 130, 246, 0.5)', glow: 'rgba(59, 130, 246, 0.3)', name: 'SIX' },
  7:  { color: '#4CD7F6', border: '#FBBF24', glow: 'rgba(76, 215, 246, 0.45)', name: 'FLIP 7' },
  8:  { color: '#A855F7', border: 'rgba(168, 85, 247, 0.45)', glow: 'rgba(168, 85, 247, 0.25)', name: 'EIGHT' },
  9:  { color: '#EC4899', border: 'rgba(236, 72, 153, 0.5)', glow: 'rgba(236, 72, 153, 0.3)', name: 'NINE' },
  10: { color: '#EF4444', border: 'rgba(239, 68, 68, 0.45)', glow: 'rgba(239, 68, 68, 0.25)', name: 'TEN' },
  11: { color: '#FB7185', border: 'rgba(251, 113, 133, 0.45)', glow: 'rgba(251, 113, 133, 0.25)', name: 'ELEVEN' },
  12: { color: '#38BDF8', border: 'rgba(56, 189, 248, 0.45)', glow: 'rgba(56, 189, 248, 0.25)', name: 'TWELVE' },
};

export default function Card({ card, faceDown, small }: CardProps) {
  const w = small ? '48px' : '66px';
  const h = small ? '66px' : '96px';

  /* ── Face Down (Midnight Arcade card back with Flip 7 card logo) ── */
  if (faceDown) {
    return (
      <div style={{
        width: w,
        height: h,
        borderRadius: '12px',
        flexShrink: 0,
        background: 'linear-gradient(145deg, #0D121D 0%, #161F30 50%, #0A0E17 100%)',
        border: '1.5px solid rgba(245, 158, 11, 0.65)',
        boxShadow: '0 6px 18px rgba(0,0,0,0.65), 0 0 12px rgba(245, 158, 11, 0.25)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        userSelect: 'none',
      }}>
        {/* Inner geometric neon rim */}
        <div style={{
          position: 'absolute',
          inset: '2px',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '10px',
          pointerEvents: 'none',
        }} />
        <FlipSevenLogo
          size={small ? 44 : 64}
          style={{
            filter: 'drop-shadow(0 2px 10px rgba(0,0,0,0.6))',
          }}
        />
      </div>
    );
  }

  /* ── Number Card (Midnight Arcade Table dark felt face) ── */
  if (card.type === 'number') {
    const val = card.value ?? 0;
    const meta = numberMeta[val] ?? { color: '#CBD5E1', border: 'rgba(255,255,255,0.2)', glow: 'rgba(255,255,255,0.1)', name: `${val}` };
    const isSeven = val === 7;
    const isSixOrNine = val === 6 || val === 9;

    return (
      <div className="card card-deal-anim" style={{
        width: w,
        height: h,
        borderRadius: '12px',
        flexShrink: 0,
        background: isSeven
          ? 'linear-gradient(160deg, #0e1726 0%, #101c2e 50%, #0c121e 100%)'
          : 'linear-gradient(160deg, #111827 0%, #151b28 100%)',
        boxShadow: isSeven
          ? '0 6px 18px rgba(0,0,0,0.7), 0 0 20px rgba(76, 215, 246, 0.35)'
          : `0 4px 14px rgba(0,0,0,0.6), 0 0 10px ${meta.glow}`,
        border: isSeven
          ? '2px solid #FBBF24'
          : `1.5px solid ${meta.border}`,
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: small ? '4px 5px' : '6px 7px',
        boxSizing: 'border-box',
        userSelect: 'none',
      }}>
        {/* Subtle inner card border */}
        <div style={{
          position: 'absolute',
          inset: '2px',
          borderRadius: '9px',
          border: isSeven ? '1px solid rgba(76, 215, 246, 0.3)' : '1px solid rgba(255, 255, 255, 0.05)',
          pointerEvents: 'none',
        }} />

        {/* Top index: #X */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          lineHeight: 1,
          zIndex: 1,
        }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '1px',
          }}>
            <span style={{
              fontSize: small ? '0.62rem' : '0.74rem',
              fontWeight: 700,
              color: meta.color,
              fontFamily: MONO_FONT,
              lineHeight: 1,
            }}>
              #{val}
            </span>
            {isSixOrNine && (
              <span style={{
                fontSize: '0.6rem',
                color: meta.color,
                fontWeight: 900,
                lineHeight: 0.8,
              }}>
                _
              </span>
            )}
          </div>
          {isSeven && (
            <span style={{
              fontSize: small ? '0.55rem' : '0.68rem',
              color: '#FBBF24',
              lineHeight: 1,
            }}>
              ⚡
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
            {isSeven ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FlipSevenLogo
                  size={small ? 46 : 64}
                  style={{
                    filter: 'drop-shadow(0 2px 10px rgba(245, 158, 11, 0.45))',
                  }}
                />
              </div>
            ) : (
              <div style={{
                display: 'inline-flex',
                flexDirection: 'column',
                alignItems: 'center',
                lineHeight: 1,
              }}>
                <span style={{
                  fontSize: small ? (val >= 10 ? '1.35rem' : '1.65rem') : (val >= 10 ? '2.05rem' : '2.45rem'),
                  fontWeight: 700,
                  color: meta.color,
                  fontFamily: NUMERAL_FONT,
                  fontVariantNumeric: 'tabular-nums lining-nums',
                  lineHeight: 1,
                  letterSpacing: '-0.04em',
                  textShadow: `0 0 12px ${meta.glow}`,
                }}>
                  {val}
                </span>
                {isSixOrNine && (
                  <div style={{
                    width: small ? '18px' : '26px',
                    height: small ? '2px' : '3px',
                    background: meta.color,
                    borderRadius: '2px',
                    marginTop: small ? '2px' : '3px',
                    boxShadow: `0 0 6px ${meta.color}`,
                  }} />
                )}
              </div>
            )}
          </div>
        </div>

        {/* Bottom pip dot / icon */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          lineHeight: 1,
          zIndex: 1,
        }}>
          {isSeven ? (
            <span style={{
              fontSize: small ? '0.6rem' : '0.72rem',
              color: '#4CD7F6',
              lineHeight: 1,
            }}>
              ⚡
            </span>
          ) : (
            <div style={{
              width: small ? '4px' : '6px',
              height: small ? '4px' : '6px',
              borderRadius: '50%',
              background: meta.color,
              boxShadow: `0 0 6px ${meta.color}`,
              opacity: 0.9,
            }} />
          )}
        </div>
      </div>
    );
  }

  /* ── Modifier Card (Neon Cyan / Electric Blue) ── */
  if (card.type === 'modifier') {
    const isDouble = card.isDouble;
    const bg = isDouble
      ? 'linear-gradient(150deg, #13192B 0%, #1A243D 50%, #0F131F 100%)'
      : 'linear-gradient(150deg, #0C1E28 0%, #102B3A 50%, #0A1620 100%)';
    const border = isDouble ? '#8B5CF6' : '#06B6D4';
    const textColor = isDouble ? '#C4B5FD' : '#4CD7F6';

    return (
      <div className="card card-deal-anim" style={{
        width: w,
        height: h,
        borderRadius: '12px',
        flexShrink: 0,
        background: bg,
        boxShadow: `0 4px 14px rgba(0,0,0,0.6), 0 0 12px ${border}40`,
        border: `1.5px solid ${border}`,
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: small ? '4px 5px' : '6px 7px',
        boxSizing: 'border-box',
        userSelect: 'none',
      }}>
        {/* Top-left corner */}
        <span style={{
          fontSize: small ? '0.68rem' : '0.82rem',
          fontWeight: 700,
          fontFamily: MONO_FONT,
          color: textColor,
          lineHeight: 1,
        }}>
          {isDouble ? '×2' : '+'}
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
            fontSize: small ? '1.1rem' : '1.5rem',
            fontWeight: 700,
            fontFamily: NUMERAL_FONT,
            color: textColor,
            lineHeight: 1,
            textShadow: `0 0 12px ${border}80`,
          }}>
            {card.label}
          </span>
          {!small && (
            <span style={{
              fontSize: '0.45rem',
              fontWeight: 700,
              fontFamily: MONO_FONT,
              letterSpacing: '0.1em',
              color: textColor,
              opacity: 0.85,
              marginTop: '3px',
              textTransform: 'uppercase',
            }}>
              {isDouble ? 'MULTIPLIER' : 'BONUS'}
            </span>
          )}
        </div>

        {/* Bottom pip */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <div style={{
            width: small ? '4px' : '6px',
            height: small ? '4px' : '6px',
            borderRadius: '50%',
            background: border,
            boxShadow: `0 0 6px ${border}`,
          }} />
        </div>
      </div>
    );
  }

  /* ── Action Card (Arcade Neon) ── */
  interface ActionConfig {
    bg: string;
    border: string;
    glow: string;
    title: string;
    sub: string;
    icon: React.ReactNode;
  }

  const actionConfigs: Record<string, ActionConfig> = {
    freeze: {
      bg: 'linear-gradient(150deg, #0A1C28 0%, #0E293B 100%)',
      border: '#06B6D4',
      glow: 'rgba(6, 182, 212, 0.4)',
      title: 'FREEZE',
      sub: 'BANK',
      icon: (
        <svg width={small ? '14' : '20'} height={small ? '14' : '20'} viewBox="0 0 24 24" fill="none" stroke="#4CD7F6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        </svg>
      ),
    },
    flip_three: {
      bg: 'linear-gradient(150deg, #1A132B 0%, #261B3D 100%)',
      border: '#8B5CF6',
      glow: 'rgba(139, 92, 246, 0.4)',
      title: 'FLIP 3',
      sub: 'DRAW 3',
      icon: (
        <svg width={small ? '14' : '20'} height={small ? '14' : '20'} viewBox="0 0 24 24" fill="none" stroke="#C4B5FD" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="7" width="14" height="14" rx="2" />
          <path d="M6 3h14a2 2 0 0 1 2 2v12" />
        </svg>
      ),
    },
    second_chance: {
      bg: 'linear-gradient(150deg, #0B221A 0%, #0F3226 100%)',
      border: '#10B981',
      glow: 'rgba(16, 185, 129, 0.4)',
      title: 'SHIELD',
      sub: 'PROTECT',
      icon: (
        <svg width={small ? '14' : '20'} height={small ? '14' : '20'} viewBox="0 0 24 24" fill="none" stroke="#6EE7B7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        </svg>
      ),
    },
  };

  const actionDetails = (card.action ? actionConfigs[card.action] : null) ?? {
    bg: 'linear-gradient(150deg, #111827 0%, #1F2937 100%)',
    border: '#F59E0B',
    glow: 'rgba(245, 158, 11, 0.4)',
    title: 'ACTION',
    sub: 'PLAY',
    icon: null,
  };

  return (
    <div className="card card-deal-anim" style={{
      width: w,
      height: h,
      borderRadius: '12px',
      flexShrink: 0,
      background: actionDetails.bg,
      boxShadow: `0 4px 14px rgba(0,0,0,0.6), 0 0 12px ${actionDetails.glow}`,
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
        fontWeight: 700,
        fontFamily: NUMERAL_FONT,
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
          fontWeight: 700,
          fontFamily: MONO_FONT,
          letterSpacing: '0.1em',
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
