export type CardType = 'number' | 'modifier' | 'action';

export interface GameCard {
  id: string;         // unique instance id e.g. "num_7_3"
  type: CardType;
  value: number | null;       // number cards: 0-9; modifier +2/+4/+6/+8/+10 as number; x2 = 2 but flag isDouble
  isDouble?: boolean;         // true for x2 modifier
  action?: 'freeze' | 'flip_three' | 'second_chance';
  label: string;
}

export interface PlayerState {
  uid: string;
  name: string;
  numberCards: GameCard[];
  modifierCards: GameCard[];
  actionCards: GameCard[];    // only second_chance cards held
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
  targetPlayerId: string | null;    // null = needs host to pick target
  cardsRemaining?: number;          // for flip_three countdown
}

export interface GameRoom {
  roomCode: string;
  hostUid: string;
  phase: GamePhase;
  players: Record<string, PlayerState>;
  playerOrder: string[];            // uid array in seat order
  dealerIndex: number;
  currentTurnIndex: number;         // index into playerOrder
  deck: GameCard[];
  discard: GameCard[];
  pendingAction: PendingAction | null;
  round: number;
  winnerUid: string | null;
  lastEvent: string;                // human-readable event log string
  createdAt: number;
}
