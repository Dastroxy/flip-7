import { v4 as uuidv4 } from 'uuid';
import type { GameCard } from '../types/game';

function makeNumberCards(): GameCard[] {
  const cards: GameCard[] = [];

  // Updated counts per your spec:
  // 0×1, 1×1, 2×2, 3×3, 4×4, 5×5, 6×6, 7×7, 8×8, 9×9, 10×10, 11×11, 12×12
  const counts: Record<number, number> = {
    0: 1,
    1: 1,
    2: 2,
    3: 3,
    4: 4,
    5: 5,
    6: 6,
    7: 7,
    8: 8,
    9: 9,
    10: 10,
    11: 11,
    12: 12,
  };

  for (const [valStr, count] of Object.entries(counts)) {
    const val = parseInt(valStr);
    for (let i = 0; i < count; i++) {
      cards.push({
        id: `num_${val}_${i}_${uuidv4()}`,
        type: 'number',
        value: val,
        label: `${val}`,
      });
    }
  }

  return cards;
}

function makeModifierCards(): GameCard[] {
  const cards: GameCard[] = [];

  // Each modifier is now ×1 only
  const plusValues = [2, 4, 6, 8, 10];
  for (const v of plusValues) {
    cards.push({
      id: `mod_plus${v}_${uuidv4()}`,
      type: 'modifier',
      value: v,
      label: `+${v}`,
    });
  }

  // x2 card — 1 copy
  cards.push({
    id: `mod_x2_${uuidv4()}`,
    type: 'modifier',
    value: 2,
    isDouble: true,
    label: 'x2',
  });

  return cards;
}

function makeActionCards(): GameCard[] {
  const cards: GameCard[] = [];

  const actions: Array<'freeze' | 'flip_three' | 'second_chance'> = [
    'freeze',
    'flip_three',
    'second_chance',
  ];

  const labels: Record<string, string> = {
    freeze: 'FREEZE',
    flip_three: 'FLIP THREE',
    second_chance: 'SECOND CHANCE',
  };

  for (const action of actions) {
    for (let i = 0; i < 3; i++) {
      cards.push({
        id: `action_${action}_${i}_${uuidv4()}`,
        type: 'action',
        value: null,
        action,
        label: labels[action],
      });
    }
  }

  return cards;
}

export function buildDeck(): GameCard[] {
  const deck = [
    ...makeNumberCards(),
    ...makeModifierCards(),
    ...makeActionCards(),
  ];
  return shuffle(deck);
}

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
