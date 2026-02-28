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
          ? 'rgba(245,197,66,0.07)'
          : isMe
          ? 'rgba(255,255,255,0.05)'
          : 'rgba(255,255,255,0.025)',
        border: `2px solid ${
          isActive ? 'var(--den-gold)'
          : isBusted ? 'var(--den-red)'
          : isMe ? 'rgba(255,255,255,0.15)'
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
              fontSize: '0.6rem', background: 'rgba(245,197,66,0.2)',
              color: 'var(--den-gold)', borderRadius: '6px',
              padding: '0.15rem 0.45rem', fontWeight: 800, letterSpacing: '0.05em',
            }}>
              DEALER
            </span>
          )}
          {player.hasSecondChance && (
            <span title="Has Second Chance" style={{ fontSize: '0.9rem' }}>🍀</span>
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
          background: 'rgba(255,77,109,0.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          pointerEvents: 'none',
        }}>
          <span style={{
            fontSize: '1.1rem', fontFamily: 'Cinzel, serif',
            color: 'var(--den-red)', fontWeight: 900,
            letterSpacing: '0.1em',
            textShadow: '0 0 20px rgba(255,77,109,0.8)',
          }}>
            💥 BUSTED
          </span>
        </div>
      )}

      {isStayed && (
        <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span style={{
            fontSize: '0.72rem', fontWeight: 800,
            color: player.status === 'frozen' ? 'var(--den-blue)' : 'var(--den-green)',
            background: player.status === 'frozen'
              ? 'rgba(77,159,255,0.15)' : 'rgba(0,230,118,0.12)',
            borderRadius: '8px', padding: '0.2rem 0.6rem',
          }}>
            {player.status === 'frozen' ? '🧊 FROZEN' : '✅ STAYED'} — {player.roundScore} pts
          </span>
        </div>
      )}

      {/* Active turn indicator */}
      {isActive && (
        <div className="animate-pulse-slow" style={{
          position: 'absolute', top: '-10px', right: '-10px',
          background: 'linear-gradient(135deg,#f5c542,#ff9f43)',
          borderRadius: '50%', width: '22px', height: '22px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '0.7rem', fontWeight: 900, color: '#1a1a2e',
          boxShadow: '0 2px 8px rgba(245,197,66,0.6)',
        }}>
          ▶
        </div>
      )}
    </div>
  );
}
