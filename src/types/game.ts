export type CardType = 'number' | 'modifier' | 'action';

export interface GameCard {
  id: string;
  type: CardType;
  value: number | null;
  isDouble?: boolean;
  action?: 'freeze' | 'flip_three' | 'second_chance';
  label: string;
}

export interface PlayerState {
  uid: string;
  name: string;
  numberCards: GameCard[];
  modifierCards: GameCard[];
  actionCards: GameCard[];
  hasSecondChance: boolean;
  status: 'active' | 'stayed' | 'busted' | 'frozen';
  roundScore: number;
  totalScore: number;
  isDealer: boolean;
}

export type GamePhase =
  | 'lobby'
  | 'dealing'
  | 'player_turn'
  | 'action_resolve'
  | 'round_end'
  | 'game_over';

export interface PendingAction {
  action: 'freeze' | 'flip_three' | 'second_chance';
  sourcePlayerId: string;
  targetPlayerId: string | null;
  cardsRemaining?: number;
}

export interface GameRoom {
  roomCode: string;
  hostUid: string;
  phase: GamePhase;
  players: Record<string, PlayerState>;
  playerOrder: string[];
  dealerIndex: number;
  currentTurnIndex: number;
  deck: GameCard[];
  discard: GameCard[];
  pendingAction: PendingAction | null;
  round: number;
  winnerUid: string | null;
  lastEvent: string;
  recentEvents: string[];           // ← added: last 6 events
  createdAt: number;
}
