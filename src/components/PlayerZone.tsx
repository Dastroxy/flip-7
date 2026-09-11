import type { PlayerState } from '../types/game';
import Card from './Card';

interface Props {
  player: PlayerState;
  isActive: boolean;
  isMe: boolean;
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

export default function PlayerZone({ player, isActive, isMe }: Props) {
  const isBusted = player.status === 'busted';
  const isStayed = player.status === 'stayed' || player.status === 'frozen';
  const avatarColor = getAvatarColor(player.name);

  return (
    <div
      className={`player-zone${isActive ? ' glow-gold' : isBusted ? ' glow-red' : ''}`}
      style={{
        background: isActive
          ? 'rgba(255, 210, 63, 0.08)'
          : isMe
          ? 'rgba(43, 168, 162, 0.09)'
          : 'rgba(255,255,255,0.025)',
        border: `2px solid ${
          isActive ? 'var(--den-gold)'
          : isBusted ? 'var(--den-coral)'
          : isMe ? 'var(--den-teal)'
          : 'var(--den-border)'
        }`,
        borderRadius: '18px',
        padding: '0.9rem 1rem',
        position: 'relative',
        transition: 'border-color 0.3s, box-shadow 0.3s',
        opacity: isBusted ? 0.65 : 1,
      }}
    >
      {/* Active pulse ring */}
      {isActive && (
        <div style={{
          position: 'absolute', inset: '-4px', borderRadius: '22px',
          border: '2px solid var(--den-gold)', opacity: 0.4,
          animation: 'pulseSlow 1.5s ease-in-out infinite',
          pointerEvents: 'none',
        }} />
      )}

      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '0.5rem',
        marginBottom: '0.7rem', flexWrap: 'wrap',
      }}>
        <div style={{
          width: '32px', height: '32px', borderRadius: '50%',
          background: avatarColor,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 900, color: '#fff', fontSize: '0.9rem', flexShrink: 0,
          boxShadow: `0 2px 8px ${avatarColor}88`,
        }}>
          {player.name[0].toUpperCase()}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontWeight: 800, fontSize: '0.9rem',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            color: isMe ? '#fff' : 'var(--den-text)',
          }}>
            {player.name}
            {isMe && (
              <span style={{ color: 'var(--den-muted)', fontSize: '0.7rem', marginLeft: '0.3rem' }}>
                (you)
              </span>
            )}
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--den-muted)', fontWeight: 600 }}>
            Total: <span style={{ color: 'var(--den-gold)', fontWeight: 800 }}>{player.totalScore}</span> pts
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '3px' }}>
          {player.isDealer && (
            <span style={{
              fontSize: '0.6rem', background: 'rgba(255, 210, 63, 0.2)',
              color: 'var(--den-gold)', borderRadius: '6px',
              padding: '0.15rem 0.45rem', fontWeight: 800, letterSpacing: '0.05em',
            }}>
              DEALER
            </span>
          )}
          {player.hasSecondChance && (
            <span style={{
              fontSize: '0.62rem',
              background: 'rgba(39, 174, 96, 0.2)',
              color: '#27AE60',
              border: '1px solid rgba(39, 174, 96, 0.4)',
              borderRadius: '6px',
              padding: '0.15rem 0.45rem',
              fontWeight: 800,
              letterSpacing: '0.04em',
            }}>
              SHIELD
            </span>
          )}
        </div>
      </div>

      {/* Modifier cards */}
      {player.modifierCards.length > 0 && (
        <div style={{ display: 'flex', gap: '4px', marginBottom: '5px', flexWrap: 'wrap' }}>
          {player.modifierCards.map(c => <Card key={c.id} card={c} small />)}
        </div>
      )}

      {/* Number cards */}
      <div style={{
        display: 'flex', gap: '4px', flexWrap: 'wrap',
        minHeight: '60px', alignItems: 'center',
      }}>
        {isBusted
          ? player.numberCards.map(c => <Card key={c.id} card={c} faceDown small />)
          : player.numberCards.map(c => <Card key={c.id} card={c} small />)
        }
        {player.numberCards.length === 0 && !isBusted && (
          <span style={{ color: 'var(--den-muted)', fontSize: '0.78rem', fontStyle: 'italic' }}>
            No cards yet...
          </span>
        )}
      </div>

      {/* Status overlays */}
      {isBusted && (
        <div className="bust-shake" style={{
          position: 'absolute', inset: 0, borderRadius: '16px',
          background: 'rgba(239, 68, 68, 0.22)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          pointerEvents: 'none',
        }}>
          <span style={{
            fontSize: '1.1rem', fontFamily: 'Space Grotesk, sans-serif',
            color: '#EF4444', fontWeight: 800,
            letterSpacing: '0.12em',
            boxShadow: '0 0 24px rgba(239, 68, 68, 0.6)',
            border: '2px solid #EF4444',
            padding: '0.35rem 1rem',
            borderRadius: '9999px',
            background: 'rgba(17, 24, 39, 0.95)',
          }}>
            BUSTED
          </span>
        </div>
      )}

      {isStayed && (
        <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span style={{
            fontSize: '0.72rem', fontWeight: 800,
            fontFamily: 'Space Grotesk, sans-serif',
            color: player.status === 'frozen' ? 'var(--den-cyan-bright)' : 'var(--den-green)',
            background: player.status === 'frozen'
              ? 'rgba(6, 182, 212, 0.15)' : 'rgba(16, 185, 129, 0.15)',
            border: player.status === 'frozen'
              ? '1px solid rgba(6, 182, 212, 0.4)' : '1px solid rgba(16, 185, 129, 0.4)',
            borderRadius: '9999px', padding: '0.2rem 0.65rem',
            letterSpacing: '0.04em',
          }}>
            {player.status === 'frozen' ? 'FROZEN' : 'STAYED'} · {player.roundScore} PTS
          </span>
        </div>
      )}

      {/* Active turn indicator */}
      {isActive && (
        <div className="animate-pulse-slow" style={{
          position: 'absolute', top: '-6px', right: '-6px',
          background: 'linear-gradient(135deg, #FBBF24, #F59E0B)',
          borderRadius: '50%', width: '16px', height: '16px',
          boxShadow: '0 0 12px rgba(245, 158, 11, 0.9)',
          border: '2px solid #0A0E17',
        }} />
      )}
    </div>
  );
}
