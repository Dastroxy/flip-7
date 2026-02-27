import { useEffect, useState, useCallback, useRef } from 'react';
import {
  doc,
  onSnapshot,
  setDoc,
  runTransaction,
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import type { GameRoom, PlayerState } from '../types/game';
import { buildDeck, shuffle } from '../lib/deck';
import { calculateHandScore, hasFlip7 } from '../lib/scoring';

function generateRoomCode(): string {
  return Math.random().toString(36).substring(2, 7).toUpperCase();
}

function dealIntoTransaction(r: GameRoom): {
  deck: any[];
  discard: any[];
  players: Record<string, PlayerState>;
  phase: string;
  pendingAction: any;
  currentTurnIndex: number;
  lastEvent: string;
} | null {
  let deck = [...r.deck];
  let discard = [...r.discard];
  const players = JSON.parse(JSON.stringify(r.players)) as Record<string, PlayerState>;
  const order = r.playerOrder;
  const dealerIdx = r.dealerIndex;
  let lastEvent = '';

  for (let i = 0; i < order.length; i++) {
    const uidIndex = (dealerIdx + i) % order.length;
    const uid = order[uidIndex];

    if (deck.length === 0) {
      if (discard.length > 0) {
        deck = shuffle([...discard]);
        discard = [];
      } else break;
    }
    const card = deck.shift()!;

    if (card.type === 'number') {
      const p = players[uid];
      const hasDup = p.numberCards.some((c: any) => c.value === card.value);
      if (hasDup && p.hasSecondChance) {
        players[uid].hasSecondChance = false;
        players[uid].actionCards = [];
        lastEvent = `${p.name} used Second Chance on deal!`;
      } else if (hasDup) {
        const bustedCards = [
          ...p.numberCards,
          ...p.modifierCards,
          ...(p.actionCards ?? []),
          card,
        ];
        players[uid].status = 'busted';
        players[uid].numberCards = [];
        players[uid].modifierCards = [];
        players[uid].actionCards = [];
        discard = [...discard, ...bustedCards];
        lastEvent = `${p.name} busted on the deal with a ${card.label}!`;
      } else {
        players[uid].numberCards = [...p.numberCards, card];
        lastEvent = `${p.name} received ${card.label}.`;
      }
    } else if (card.type === 'modifier') {
      players[uid].modifierCards = [...players[uid].modifierCards, card];
      lastEvent = `${players[uid].name} received modifier ${card.label}.`;
    } else if (card.type === 'action') {
      players[uid].actionCards = [...(players[uid].actionCards ?? []), card];
      const pendingAction = {
        action: card.action!,
        sourcePlayerId: uid,
        targetPlayerId: null,
        cardsRemaining: card.action === 'flip_three' ? 3 : null,
      };
      lastEvent = `Action card ${card.label} dealt to ${players[uid].name}! Choose a target.`;
      return {
        deck, discard, players,
        phase: 'action_resolve',
        pendingAction,
        currentTurnIndex: uidIndex,
        lastEvent,
      };
    }
  }

  let currentTurnIndex = (dealerIdx + 1) % order.length;
  let tries = 0;
  while (
    players[order[currentTurnIndex]]?.status !== 'active' &&
    tries < order.length
  ) {
    currentTurnIndex = (currentTurnIndex + 1) % order.length;
    tries++;
  }

  return {
    deck, discard, players,
    phase: 'player_turn',
    pendingAction: null,
    currentTurnIndex,
    lastEvent: lastEvent || 'Cards dealt! Player turns begin.',
  };
}

export function useGameRoom(roomCode: string | null) {
  const { uid: myUid } = useAuth();
  const [room, setRoom] = useState<GameRoom | null>(null);
  const [loading, setLoading] = useState(true);
  const isProcessing = useRef(false);

  useEffect(() => {
    if (!roomCode) { setLoading(false); return; }
    const ref = doc(db, 'rooms', roomCode);
    const unsub = onSnapshot(ref, (snap) => {
      if (snap.exists()) setRoom(snap.data() as GameRoom);
      setLoading(false);
    });
    return unsub;
  }, [roomCode]);

  // ── Create Room ───────────────────────────────────────────────────────────
  const createRoom = useCallback(async (hostName: string): Promise<string> => {
    if (!myUid) throw new Error('Not authenticated');
    const code = generateRoomCode();
    const hostPlayer: PlayerState = {
      uid: myUid,
      name: hostName,
      numberCards: [],
      modifierCards: [],
      actionCards: [],
      hasSecondChance: false,
      status: 'active',
      roundScore: 0,
      totalScore: 0,
      isDealer: true,
    };
    const newRoom: GameRoom = {
      roomCode: code,
      hostUid: myUid,
      phase: 'lobby',
      players: { [myUid]: hostPlayer },
      playerOrder: [myUid],
      dealerIndex: 0,
      currentTurnIndex: 0,
      deck: [],
      discard: [],
      pendingAction: null,
      round: 0,
      winnerUid: null,
      lastEvent: `${hostName} created the room.`,
      createdAt: Date.now(),
    };
    await setDoc(doc(db, 'rooms', code), newRoom);
    return code;
  }, [myUid]);

  // ── Join Room ─────────────────────────────────────────────────────────────
  const joinRoom = useCallback(async (code: string, playerName: string) => {
    if (!myUid) throw new Error('Not authenticated');
    const ref = doc(db, 'rooms', code);
    await runTransaction(db, async (tx) => {
      const snap = await tx.get(ref);
      if (!snap.exists()) throw new Error('Room not found');
      const r = snap.data() as GameRoom;
      if (r.playerOrder.includes(myUid)) {
        tx.update(ref, {
          [`players.${myUid}.name`]: playerName,
          lastEvent: `${playerName} reconnected.`,
        });
        return;
      }
      const newPlayer: PlayerState = {
        uid: myUid,
        name: playerName,
        numberCards: [],
        modifierCards: [],
        actionCards: [],
        hasSecondChance: false,
        status: 'active',
        roundScore: 0,
        totalScore: 0,
        isDealer: false,
      };
      tx.update(ref, {
        [`players.${myUid}`]: newPlayer,
        playerOrder: [...r.playerOrder, myUid],
        lastEvent: `${playerName} joined the room.`,
      });
    });
  }, [myUid]);

  // ── Start Game ────────────────────────────────────────────────────────────
  const startGame = useCallback(async () => {
    if (!room || !myUid) return;
    const ref = doc(db, 'rooms', room.roomCode);
    await runTransaction(db, async (tx) => {
      const snap = await tx.get(ref);
      const r = snap.data() as GameRoom;
      const deck = buildDeck();
      const players = { ...r.players };
      r.playerOrder.forEach((uid, i) => {
        players[uid] = {
          ...players[uid],
          numberCards: [],
          modifierCards: [],
          actionCards: [],
          hasSecondChance: false,
          status: 'active',
          roundScore: 0,
          totalScore: 0,
          isDealer: i === 0,
        };
      });
      const dealingState: GameRoom = {
        ...r, phase: 'dealing', deck, discard: [], players,
        dealerIndex: 0, currentTurnIndex: 0, pendingAction: null,
        round: 1, winnerUid: null, lastEvent: 'Game started! Dealing cards...',
      };
      const dealt = dealIntoTransaction(dealingState);
      if (!dealt) return;
      tx.update(ref, {
        deck: dealt.deck, discard: dealt.discard, players: dealt.players,
        dealerIndex: 0, currentTurnIndex: dealt.currentTurnIndex,
        pendingAction: dealt.pendingAction, phase: dealt.phase,
        round: 1, winnerUid: null, lastEvent: dealt.lastEvent,
      });
    });
  }, [room, myUid]);

  // ── Next Round ────────────────────────────────────────────────────────────
  const startNextRound = useCallback(async () => {
    if (!room || !myUid || room.hostUid !== myUid) return;
    const ref = doc(db, 'rooms', room.roomCode);
    await runTransaction(db, async (tx) => {
      const snap = await tx.get(ref);
      const r = snap.data() as GameRoom;
      const order = r.playerOrder;
      const newDealerIndex = (r.dealerIndex + 1) % order.length;
      const newDeck = [...r.deck];

      // ✅ Collect all remaining hand cards (stayed/frozen players) into discard
      const handCards = order.flatMap((uid) => [
        ...(r.players[uid].numberCards ?? []),
        ...(r.players[uid].modifierCards ?? []),
        ...(r.players[uid].actionCards ?? []),
      ]);
      const newDiscard = [...r.discard, ...handCards];

      const players = { ...r.players };
      order.forEach((uid, i) => {
        players[uid] = {
          ...players[uid],
          numberCards: [], modifierCards: [], actionCards: [],
          hasSecondChance: false, status: 'active', roundScore: 0,
          isDealer: i === newDealerIndex,
        };
      });
      const dealingState: GameRoom = {
        ...r, phase: 'dealing', deck: newDeck, discard: newDiscard, players,
        dealerIndex: newDealerIndex,
        currentTurnIndex: (newDealerIndex + 1) % order.length,
        pendingAction: null, round: r.round + 1,
        lastEvent: `Round ${r.round + 1} — ${players[order[newDealerIndex]].name} is dealer.`,
      };
      const dealt = dealIntoTransaction(dealingState);
      if (!dealt) return;
      tx.update(ref, {
        deck: dealt.deck, discard: dealt.discard, players: dealt.players,
        dealerIndex: newDealerIndex,
        currentTurnIndex: dealt.currentTurnIndex,
        pendingAction: dealt.pendingAction, phase: dealt.phase,
        round: r.round + 1, winnerUid: null, lastEvent: dealt.lastEvent,
      });
    });
  }, [room, myUid]);

  // ── Hit ───────────────────────────────────────────────────────────────────
  const playerHit = useCallback(async () => {
    if (!room || !myUid) return;
    if (isProcessing.current) return;
    isProcessing.current = true;
    try {
      const ref = doc(db, 'rooms', room.roomCode);
      await runTransaction(db, async (tx) => {
        const snap = await tx.get(ref);
        const r = snap.data() as GameRoom;
        const order = r.playerOrder;
        if (order[r.currentTurnIndex] !== myUid) return;
        if (r.players[myUid].status !== 'active') return;
        if (r.phase !== 'player_turn') return;
        let deck = [...r.deck];
        let discard = [...r.discard];
        const players = JSON.parse(JSON.stringify(r.players)) as Record<string, PlayerState>;
        const originalTotals: Record<string, number> = {};
        order.forEach(uid => { originalTotals[uid] = r.players[uid].totalScore; });
        const scoredThisTx = new Set<string>();
        const player = players[myUid];
        let phase = r.phase;
        let pendingAction = r.pendingAction;
        let lastEvent = '';
        let winnerUid = r.winnerUid;
        let currentTurnIndex = r.currentTurnIndex;

        // Guard: empty deck — reshuffle discard or force stay
        if (deck.length === 0) {
          if (discard.length > 0) {
            deck = shuffle([...discard]);
            discard = [];
          } else {
            const rs = calculateHandScore(players[myUid]);
            players[myUid].status = 'stayed';
            players[myUid].roundScore = rs;
            players[myUid].totalScore = originalTotals[myUid] + rs;
            scoredThisTx.add(myUid);
            currentTurnIndex = advanceTurn(order, players, r.currentTurnIndex);
            const allDone = order.every(uid => players[uid].status !== 'active');
            if (allDone) {
              order.forEach(uid => {
                if (
                  (players[uid].status === 'stayed' || players[uid].status === 'frozen') &&
                  !scoredThisTx.has(uid) &&
                  players[uid].roundScore === 0
                ) {
                  const urs = calculateHandScore(players[uid]);
                  players[uid].roundScore = urs;
                  players[uid].totalScore = originalTotals[uid] + urs;
                  scoredThisTx.add(uid);
                }
              });
              const winner = order.find(uid => players[uid].totalScore >= 200);
              phase = winner ? 'game_over' : 'round_end';
              winnerUid = winner ?? null;
            }
            tx.update(ref, {
              deck, discard, players, phase, pendingAction: null,
              lastEvent: `Deck empty — ${player.name} forced to stay with ${rs} pts.`,
              currentTurnIndex, winnerUid,
            });
            return;
          }
        }

        const card = deck.shift()!;
        if (card.type === 'number') {
          const hasDup = player.numberCards.some((c) => c.value === card.value);
          if (hasDup) {
            if (player.hasSecondChance) {
              players[myUid].hasSecondChance = false;
              players[myUid].actionCards = [];
              lastEvent = `${player.name} used Second Chance to avoid busting!`;
            } else {
              const bustedCards = [
                ...players[myUid].numberCards,
                ...players[myUid].modifierCards,
                ...(players[myUid].actionCards ?? []),
                card,
              ];
              players[myUid].status = 'busted';
              players[myUid].roundScore = 0;
              players[myUid].totalScore = originalTotals[myUid];
              players[myUid].numberCards = [];
              players[myUid].modifierCards = [];
              players[myUid].actionCards = [];
              discard = [...discard, ...bustedCards];
              lastEvent = `${player.name} BUSTED with a duplicate ${card.label}!`;
            }
          } else {
            players[myUid].numberCards = [...player.numberCards, card];
            lastEvent = `${player.name} hit and got ${card.label}.`;
            if (hasFlip7(players[myUid])) {
              const rs = calculateHandScore(players[myUid]) + 15;
              players[myUid].roundScore = rs;
              players[myUid].totalScore = originalTotals[myUid] + rs;
              players[myUid].status = 'stayed';
              scoredThisTx.add(myUid);
              lastEvent = `🎉 ${player.name} flipped 7! +15 bonus! Round over!`;
              order.forEach((uid) => {
                if (uid !== myUid && players[uid].status === 'active') {
                  const urs = calculateHandScore(players[uid]);
                  players[uid].roundScore = urs;
                  players[uid].totalScore = originalTotals[uid] + urs;
                  players[uid].status = 'stayed';
                  scoredThisTx.add(uid);
                }
              });
              const winner = order.find((uid) => players[uid].totalScore >= 200);
              winnerUid = winner ?? null;
              phase = winner ? 'game_over' : 'round_end';
              tx.update(ref, {
                deck, discard, players, phase, pendingAction: null,
                lastEvent, winnerUid, currentTurnIndex,
              });
              return;
            }
          }
          currentTurnIndex = advanceTurn(order, players, r.currentTurnIndex);
          const allDone = order.every((uid) => players[uid].status !== 'active');
          if (allDone) {
            order.forEach((uid) => {
              if (
                (players[uid].status === 'stayed' || players[uid].status === 'frozen') &&
                !scoredThisTx.has(uid) &&
                players[uid].roundScore === 0
              ) {
                const urs = calculateHandScore(players[uid]);
                players[uid].roundScore = urs;
                players[uid].totalScore = originalTotals[uid] + urs;
                scoredThisTx.add(uid);
              }
            });
            const winner = order.find((uid) => players[uid].totalScore >= 200);
            phase = winner ? 'game_over' : 'round_end';
            winnerUid = winner ?? null;
          }
        } else if (card.type === 'modifier') {
          players[myUid].modifierCards = [...player.modifierCards, card];
          lastEvent = `${player.name} got modifier ${card.label}.`;
          currentTurnIndex = advanceTurn(order, players, r.currentTurnIndex);
        } else if (card.type === 'action') {
          players[myUid].actionCards = [...(player.actionCards ?? []), card];
          pendingAction = {
            action: card.action!,
            sourcePlayerId: myUid,
            targetPlayerId: null,
            cardsRemaining: card.action === 'flip_three' ? 3 : null,
          };
          phase = 'action_resolve';
          lastEvent = `${player.name} drew ${card.label}! Choose a target.`;
        }

        tx.update(ref, {
          deck, discard, players, phase, pendingAction,
          lastEvent, currentTurnIndex, winnerUid,
        });
      });
    } finally {
      isProcessing.current = false;
    }
  }, [room, myUid]);

  // ── Stay ──────────────────────────────────────────────────────────────────
  const playerStay = useCallback(async () => {
    if (!room || !myUid) return;
    if (isProcessing.current) return;
    isProcessing.current = true;
    try {
      const ref = doc(db, 'rooms', room.roomCode);
      await runTransaction(db, async (tx) => {
        const snap = await tx.get(ref);
        const r = snap.data() as GameRoom;
        const order = r.playerOrder;
        if (order[r.currentTurnIndex] !== myUid) return;
        if (r.players[myUid].status !== 'active') return;
        if (r.phase !== 'player_turn') return;
        const players = JSON.parse(JSON.stringify(r.players)) as Record<string, PlayerState>;
        const originalTotals: Record<string, number> = {};
        order.forEach(uid => { originalTotals[uid] = r.players[uid].totalScore; });
        const scoredThisTx = new Set<string>();
        const rs = calculateHandScore(players[myUid]);
        players[myUid].status = 'stayed';
        players[myUid].roundScore = rs;
        players[myUid].totalScore = originalTotals[myUid] + rs;
        scoredThisTx.add(myUid);
        let phase = r.phase;
        let winnerUid = r.winnerUid;
        const currentTurnIndex = advanceTurn(order, players, r.currentTurnIndex);
        const allDone = order.every((uid) => players[uid].status !== 'active');
        if (allDone) {
          order.forEach((uid) => {
            if (
              (players[uid].status === 'stayed' || players[uid].status === 'frozen') &&
              !scoredThisTx.has(uid) &&
              players[uid].roundScore === 0
            ) {
              const urs = calculateHandScore(players[uid]);
              players[uid].roundScore = urs;
              players[uid].totalScore = originalTotals[uid] + urs;
              scoredThisTx.add(uid);
            }
          });
          const winner = order.find((uid) => players[uid].totalScore >= 200);
          phase = winner ? 'game_over' : 'round_end';
          winnerUid = winner ?? null;
        }
        tx.update(ref, {
          players, phase, currentTurnIndex, winnerUid,
          lastEvent: `${players[myUid].name} stayed with ${rs} pts this round.`,
        });
      });
    } finally {
      isProcessing.current = false;
    }
  }, [room, myUid]);

  // ── Resolve Action ────────────────────────────────────────────────────────
  const resolveAction = useCallback(async (targetUid: string) => {
    if (!room || !myUid || !room.pendingAction) return;
    if (isProcessing.current) return;
    isProcessing.current = true;
    try {
      const ref = doc(db, 'rooms', room.roomCode);
      await runTransaction(db, async (tx) => {
        const snap = await tx.get(ref);
        const r = snap.data() as GameRoom;
        if (!r.pendingAction) return;
        const sourceUid = r.pendingAction.sourcePlayerId;
        if (sourceUid !== myUid) return;
        const order = r.playerOrder;
        let deck = [...r.deck];
        let discard = [...r.discard];
        const players = JSON.parse(JSON.stringify(r.players)) as Record<string, PlayerState>;
        const originalTotals: Record<string, number> = {};
        order.forEach(uid => { originalTotals[uid] = r.players[uid].totalScore; });
        const scoredThisTx = new Set<string>();
        const pa = r.pendingAction;
        let phase: string = 'player_turn';
        let lastEvent = '';
        let winnerUid = r.winnerUid;
        let currentTurnIndex = r.currentTurnIndex;

        if (pa.action === 'freeze') {
          if (players[targetUid]?.status === 'active') {
            const rs = calculateHandScore(players[targetUid]);
            players[targetUid].status = 'frozen';
            players[targetUid].roundScore = rs;
            players[targetUid].totalScore = originalTotals[targetUid] + rs;
            scoredThisTx.add(targetUid);
            lastEvent = `🧊 ${players[targetUid].name} was FROZEN — banks ${rs} pts.`;
          } else {
            lastEvent = `Freeze card discarded — target is no longer active.`;
          }
        } else if (pa.action === 'second_chance') {
          if (players[targetUid]?.status === 'active' && !players[targetUid].hasSecondChance) {
            players[targetUid].hasSecondChance = true;
            lastEvent = `🍀 ${players[targetUid].name} received a SECOND CHANCE card.`;
          } else if (players[targetUid]?.hasSecondChance) {
            lastEvent = `Second Chance discarded — ${players[targetUid].name} already has one.`;
          } else {
            lastEvent = `Second Chance discarded — target is no longer active.`;
          }
        } else if (pa.action === 'flip_three') {
          if (players[targetUid]?.status !== 'active') {
            lastEvent = `Flip Three discarded — target is no longer active.`;
          } else {
            let remaining = pa.cardsRemaining ?? 3;
            while (remaining > 0 && players[targetUid].status === 'active') {
              if (deck.length === 0) {
                if (discard.length > 0) {
                  deck = shuffle([...discard]);
                  discard = [];
                } else break;
              }
              const card = deck.shift()!;
              remaining--;
              if (card.type === 'number') {
                const hasDup = players[targetUid].numberCards.some(
                  (c) => c.value === card.value
                );
                if (hasDup) {
                  if (players[targetUid].hasSecondChance) {
                    players[targetUid].hasSecondChance = false;
                    players[targetUid].actionCards = [];
                    lastEvent = `${players[targetUid].name} used Second Chance during Flip Three!`;
                  } else {
                    const bustedCards = [
                      ...players[targetUid].numberCards,
                      ...players[targetUid].modifierCards,
                      ...(players[targetUid].actionCards ?? []),
                      card,
                    ];
                    players[targetUid].status = 'busted';
                    players[targetUid].roundScore = 0;
                    players[targetUid].totalScore = originalTotals[targetUid];
                    players[targetUid].numberCards = [];
                    players[targetUid].modifierCards = [];
                    players[targetUid].actionCards = [];
                    discard = [...discard, ...bustedCards];
                    lastEvent = `💥 ${players[targetUid].name} BUSTED during Flip Three!`;
                    remaining = 0;
                  }
                } else {
                  players[targetUid].numberCards = [
                    ...players[targetUid].numberCards, card,
                  ];
                  lastEvent = `${players[targetUid].name} flipped ${card.label} (Flip Three).`;
                  if (hasFlip7(players[targetUid])) {
                    const rs = calculateHandScore(players[targetUid]) + 15;
                    players[targetUid].roundScore = rs;
                    players[targetUid].totalScore = originalTotals[targetUid] + rs;
                    players[targetUid].status = 'stayed';
                    scoredThisTx.add(targetUid);
                    lastEvent = `🎉 ${players[targetUid].name} FLIP 7 during Flip Three! Round over!`;
                    order.forEach((uid) => {
                      if (uid !== targetUid && players[uid].status === 'active') {
                        const urs = calculateHandScore(players[uid]);
                        players[uid].roundScore = urs;
                        players[uid].totalScore = originalTotals[uid] + urs;
                        players[uid].status = 'stayed';
                        scoredThisTx.add(uid);
                      }
                    });
                    const winner = order.find((uid) => players[uid].totalScore >= 200);
                    phase = winner ? 'game_over' : 'round_end';
                    winnerUid = winner ?? null;
                    remaining = 0;
                  }
                }
              } else if (card.type === 'modifier') {
                players[targetUid].modifierCards = [
                  ...players[targetUid].modifierCards, card,
                ];
                lastEvent = `${players[targetUid].name} got modifier ${card.label} (Flip Three).`;
              } else if (card.type === 'action' && card.action === 'second_chance') {
                players[targetUid].hasSecondChance = true;
                lastEvent = `${players[targetUid].name} got Second Chance during Flip Three!`;
              }
            }
          }
        } else {
          lastEvent = `Action card discarded.`;
        }

        const allDone = order.every((uid) => players[uid].status !== 'active');
        if (allDone && phase === 'player_turn') {
          order.forEach((uid) => {
            if (
              (players[uid].status === 'stayed' || players[uid].status === 'frozen') &&
              !scoredThisTx.has(uid) &&
              players[uid].roundScore === 0
            ) {
              const urs = calculateHandScore(players[uid]);
              players[uid].roundScore = urs;
              players[uid].totalScore = originalTotals[uid] + urs;
              scoredThisTx.add(uid);
            }
          });
          const winner = order.find((uid) => players[uid].totalScore >= 200);
          phase = winner ? 'game_over' : 'round_end';
          winnerUid = winner ?? null;
        }

        if (phase === 'player_turn') {
          currentTurnIndex = advanceTurn(order, players, r.currentTurnIndex);
        }

        // ✅ Move the played action card from source player's hand to discard
        const playedActionCard = players[sourceUid]?.actionCards?.find(
          (c: any) => c.action === pa.action
        );
        if (playedActionCard) {
          players[sourceUid].actionCards = (players[sourceUid].actionCards ?? []).filter(
            (c: any) => c.id !== playedActionCard.id
          );
          discard = [...discard, playedActionCard];
        }

        tx.update(ref, {
          deck, discard, players, phase,
          pendingAction: null,
          currentTurnIndex, lastEvent, winnerUid,
        });
      });
    } finally {
      isProcessing.current = false;
    }
  }, [room, myUid]);

  return {
    room, myUid, loading,
    createRoom, joinRoom,
    startGame, startNextRound,
    playerHit, playerStay, resolveAction,
  };
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function advanceTurn(
  order: string[],
  players: Record<string, PlayerState>,
  current: number
): number {
  let next = (current + 1) % order.length;
  let tries = 0;
  while (players[order[next]]?.status !== 'active' && tries < order.length) {
    next = (next + 1) % order.length;
    tries++;
  }
  return next;
}
