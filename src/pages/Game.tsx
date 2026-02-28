import { useParams } from 'react-router-dom';
import { useState } from 'react';
import { useGameRoom } from '../hooks/useGameRoom';
import PlayerZone from '../components/PlayerZone';
import Scoreboard from '../components/Scoreboard';
import ActionModal from '../components/ActionModal';
import WinOverlay from '../components/WinOverlay';
import Card from '../components/Card';

export default function Game() {
  const { roomCode } = useParams<{ roomCode: string }>();
  const {
    room, myUid, loading,
    playerHit, playerStay,
    resolveAction, startNextRound, startGame,
  } = useGameRoom(roomCode ?? null);

  const [processing, setProcessing] = useState(false);
  const [showScoreboard, setShowScoreboard] = useState(false);
  const [showDiscard, setShowDiscard] = useState(false);

  const handleHit = async () => {
    if (processing) return;
    setProcessing(true);
    try { await playerHit(); } finally { setProcessing(false); }
  };

  const handleStay = async () => {
    if (processing) return;
    setProcessing(true);
    try { await playerStay(); } finally { setProcessing(false); }
  };

  const handleResolve = async (targetUid: string) => {
    if (processing) return;
    setProcessing(true);
    try { await resolveAction(targetUid); } finally { setProcessing(false); }
  };

  if (loading || !room || !myUid) {
    return (
      <div style={{
        minHeight: '100dvh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: '1rem', color: 'var(--den-muted)',
      }}>
        <div style={{ fontSize: '3rem' }}>🃏</div>
        <span>Loading game...</span>
      </div>
    );
  }

  const order = room.playerOrder;
  const me = room.players[myUid];
  const activeUid = order[room.currentTurnIndex];
  const isMyTurn = activeUid === myUid && room.phase === 'player_turn';
  const canHit  = isMyTurn && me?.status === 'active' && !processing;
  const canStay = isMyTurn && me?.status === 'active' && !processing &&
    (me.numberCards.length > 0 || me.modifierCards.length > 0);
  const isHost = room.hostUid === myUid;
  const topDiscard = room.discard[room.discard.length - 1] ?? null;

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

      {/* ── Top bar ── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0.55rem 1rem',
        borderBottom: '1px solid var(--den-border)',
        background: 'rgba(13,13,26,0.95)',
        backdropFilter: 'blur(12px)',
        position: 'sticky', top: 0, zIndex: 100,
        flexShrink: 0, flexWrap: 'wrap', gap: '0.4rem',
      }}>
        <h1 style={{
          fontSize: '1rem', margin: 0,
          background: 'linear-gradient(135deg,#f5c542,#ff9f43)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        }}>
          🃏 DAX'S DEN
        </h1>

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', fontSize: '0.72rem', flexWrap: 'wrap' }}>
          <span style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '6px', padding: '0.25rem 0.55rem', fontWeight: 700 }}>
            🎮 R{room.round}
          </span>
          <span style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '6px', padding: '0.25rem 0.55rem', fontWeight: 700, letterSpacing: '0.1em' }}>
            🔑 {roomCode}
          </span>
          <span style={{ background: 'rgba(11,232,129,0.1)', color: 'var(--den-green)', borderRadius: '6px', padding: '0.25rem 0.55rem', fontWeight: 700 }}>
            🃏 {room.deck.length}
          </span>
          {/* Discard pill — tappable */}
          <button
            onClick={() => setShowDiscard(true)}
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid var(--den-border)',
              borderRadius: '6px',
              padding: '0.25rem 0.55rem',
              color: 'var(--den-muted)',
              fontWeight: 700, fontSize: '0.72rem',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem',
            }}
          >
            🗑️ {room.discard.length}
            {topDiscard && <span>· {topDiscard.label}</span>}
          </button>
          {/* Scoreboard button */}
          <button
            onClick={() => setShowScoreboard(true)}
            style={{
              background: 'rgba(245,197,66,0.1)',
              border: '1px solid rgba(245,197,66,0.3)',
              borderRadius: '6px',
              padding: '0.25rem 0.6rem',
              color: 'var(--den-gold)',
              fontWeight: 800, fontSize: '0.72rem',
              cursor: 'pointer',
            }}
          >
            📊
          </button>
        </div>
      </div>

      {/* ── Main content ── */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        WebkitOverflowScrolling: 'touch',
        padding: '0.75rem',
        minHeight: 0,
      }}>
        <div
          className="player-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 200px), 1fr))',
            gap: '0.75rem',
            alignContent: 'flex-start',
          }}
        >
          {order.map(uid => (
            <PlayerZone
              key={uid}
              player={room.players[uid]}
              isActive={uid === activeUid && room.phase === 'player_turn'}
              isMe={uid === myUid}
            />
          ))}
        </div>
      </div>

      {/* ── Bottom action bar ── */}
      <div style={{
        borderTop: '1px solid var(--den-border)',
        background: 'rgba(13,13,26,0.97)',
        backdropFilter: 'blur(12px)',
        padding: '0.65rem 1rem',
        paddingBottom: 'max(0.65rem, env(safe-area-inset-bottom))',
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between',
        gap: '0.75rem', flexShrink: 0, flexWrap: 'wrap',
      }}>

        {/* ── Last 6 events log ── */}
        <div style={{
          flex: 1, minWidth: 0,
          display: 'flex', flexDirection: 'column',
          gap: '2px', overflow: 'hidden',
          justifyContent: 'center',
        }}>
          {(room.recentEvents?.length ? [...room.recentEvents].reverse() : [room.lastEvent])
            .slice(0, 6)
            .map((e, i) => (
              <div key={i} style={{
                fontSize: i === 0 ? '0.78rem' : '0.68rem',
                color: i === 0 ? 'var(--den-text)' : 'var(--den-muted)',
                fontStyle: 'italic',
                fontWeight: i === 0 ? 700 : 500,
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                opacity: Math.max(0.3, 1 - i * 0.15),
                lineHeight: 1.3,
              }}>
                {i === 0 ? '💬' : '·'} {e}
              </div>
            ))
          }
        </div>

        {/* Buttons / status */}
        <div style={{ display: 'flex', gap: '0.6rem', flexShrink: 0, alignItems: 'center' }}>
          {room.phase === 'player_turn' && (
            isMyTurn ? (
              <>
                <button className="btn-hit" onClick={handleHit} disabled={!canHit}
                  style={{ minWidth: '80px', minHeight: '44px', fontSize: '0.95rem' }}>
                  {processing ? '⏳' : '🃏'} HIT
                </button>
                <button className="btn-danger" onClick={handleStay} disabled={!canStay}
                  style={{ minWidth: '80px', minHeight: '44px', fontSize: '0.95rem' }}>
                  ✋ STAY
                </button>
              </>
            ) : (
              <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '10px', padding: '0.5rem 0.9rem', fontSize: '0.82rem', color: 'var(--den-muted)', fontWeight: 600 }}>
                ⏳ {room.players[activeUid]?.name}'s turn...
              </div>
            )
          )}

          {room.phase === 'dealing' && (
            <div style={{ background: 'rgba(245,197,66,0.08)', borderRadius: '10px', padding: '0.5rem 0.9rem', color: 'var(--den-gold)', fontSize: '0.82rem', fontWeight: 700 }}>
              🃏 Dealing...
            </div>
          )}

          {room.phase === 'action_resolve' && room.pendingAction &&
            room.pendingAction.sourcePlayerId !== myUid && (
            <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '10px', padding: '0.5rem 0.9rem', fontSize: '0.82rem', color: 'var(--den-muted)', fontWeight: 600 }}>
              ⏳ {room.players[room.pendingAction.sourcePlayerId]?.name} is resolving...
            </div>
          )}

          {room.phase === 'round_end' && isHost && (
            <button className="btn-primary" onClick={startNextRound}
              style={{ minHeight: '44px', padding: '0 1.25rem', fontSize: '0.95rem' }}>
              ▶ Next Round
            </button>
          )}
          {room.phase === 'round_end' && !isHost && (
            <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '10px', padding: '0.5rem 0.9rem', color: 'var(--den-muted)', fontSize: '0.82rem', fontWeight: 600 }}>
              ⏳ Waiting for host...
            </div>
          )}

          {room.phase === 'game_over' && isHost && (
            <button className="btn-primary" onClick={startGame}
              style={{ minHeight: '44px', padding: '0 1.25rem', fontSize: '0.95rem' }}>
              🔄 Play Again
            </button>
          )}
          {room.phase === 'game_over' && !isHost && (
            <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '10px', padding: '0.5rem 0.9rem', color: 'var(--den-muted)', fontSize: '0.82rem', fontWeight: 600 }}>
              ⏳ Waiting for host...
            </div>
          )}
        </div>
      </div>

      {/* ── Scoreboard Modal ── */}
      {showScoreboard && (
        <div
          onClick={() => setShowScoreboard(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 200,
            background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(6px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '1rem',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: 'var(--den-surface)',
              border: '1px solid var(--den-border)',
              borderRadius: '20px', padding: '1.25rem',
              width: '100%', maxWidth: '360px',
              maxHeight: '80vh', overflowY: 'auto',
              WebkitOverflowScrolling: 'touch',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ fontSize: '1rem', margin: 0 }}>📊 Scoreboard</h2>
              <button onClick={() => setShowScoreboard(false)}
                style={{ background: 'none', color: 'var(--den-muted)', fontSize: '1.2rem', padding: '0.2rem 0.4rem', lineHeight: 1 }}>
                ✕
              </button>
            </div>
            <Scoreboard room={room} myUid={myUid} />
          </div>
        </div>
      )}

      {/* ── Discard Pile Modal ── */}
      {showDiscard && (
        <div
          onClick={() => setShowDiscard(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 200,
            background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(6px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '1rem',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: 'var(--den-surface)',
              border: '1px solid var(--den-border)',
              borderRadius: '20px', padding: '1.25rem',
              width: '100%', maxWidth: '420px',
              maxHeight: '80vh', overflowY: 'auto',
              WebkitOverflowScrolling: 'touch',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ fontSize: '1rem', margin: 0 }}>🗑️ Discard Pile ({room.discard.length})</h2>
              <button onClick={() => setShowDiscard(false)}
                style={{ background: 'none', color: 'var(--den-muted)', fontSize: '1.2rem', padding: '0.2rem 0.4rem', lineHeight: 1 }}>
                ✕
              </button>
            </div>
            {room.discard.length === 0 ? (
              <div style={{ color: 'var(--den-muted)', fontSize: '0.85rem', fontStyle: 'italic', textAlign: 'center', padding: '1.5rem 0' }}>
                No cards discarded yet.
              </div>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignContent: 'flex-start' }}>
                {[...room.discard].reverse().map((card, i) => (
                  <div key={`${card.id}-${i}`} style={{ position: 'relative' }}>
                    <Card card={card} small />
                    {i === 0 && (
                      <span style={{
                        position: 'absolute', top: '-5px', right: '-5px',
                        background: 'var(--den-gold)', color: '#1a1a2e',
                        borderRadius: '50%', width: '14px', height: '14px',
                        fontSize: '0.55rem', fontWeight: 900,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>★</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Game Modals ── */}
      {room.phase === 'action_resolve' && room.pendingAction && (
        <ActionModal room={room} myUid={myUid} onResolve={handleResolve} />
      )}
      {room.phase === 'game_over' && room.winnerUid && (
        <WinOverlay room={room} myUid={myUid} onPlayAgain={startGame} />
      )}
    </div>
  );
}
