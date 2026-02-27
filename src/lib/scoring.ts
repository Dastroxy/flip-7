import type { PlayerState } from '../types/game';

export function calculateHandScore(player: PlayerState): number {
  if (player.status === 'busted') return 0;

  const numberSum = player.numberCards.reduce((sum, c) => sum + (c.value ?? 0), 0);

  // Apply x2 modifier first (only on number card sum)
  const hasDouble = player.modifierCards.some((c) => c.isDouble);
  const doubledSum = hasDouble ? numberSum * 2 : numberSum;

  // Apply additive modifiers
  const addBonus = player.modifierCards
    .filter((c) => !c.isDouble)
    .reduce((sum, c) => sum + (c.value ?? 0), 0);

  return doubledSum + addBonus;
}

export function hasFlip7(player: PlayerState): boolean {
  const uniqueNumbers = new Set(player.numberCards.map((c) => c.value));
  return uniqueNumbers.size >= 7;
}

export function isActivePlayer(player: PlayerState): boolean {
  return player.status === 'active';
}

