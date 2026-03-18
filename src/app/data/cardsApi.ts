import { useEffect, useState } from 'react';
import { Card, CardType, OPTCGColor } from './types';
import { withApiBase } from './apiBase';

interface BackendCard {
  id?: string;
  name?: string;
  rarity?: string;
  category?: string;
  img_url?: string;
  img_full_url?: string;
  colors?: string[];
  cost?: number;
  power?: number;
  counter?: number;
  types?: string[];
  effect?: string;
  trigger?: string;
  pack_id?: string;
  tournament_status?: string;
  tournamentStatus?: string | { status?: string; value?: string; state?: string; name?: string };
  status?: string;
  card_status?: string;
  tournamentLegal?: boolean | string;
  legality?: string;
  is_banned?: boolean;
  isBanned?: boolean | string;
  banned?: boolean;
  is_active?: boolean | string;
  isActive?: boolean | string;
}

const DEFAULT_IMAGE_URL = 'https://placehold.co/400x560?text=Card';
const API_URL = withApiBase('/cardsApi/cards');
function normalizeColor(value?: string): OPTCGColor {
  const normalized = (value || '').toLowerCase();
  if (
    normalized === 'red' ||
    normalized === 'blue' ||
    normalized === 'green' ||
    normalized === 'purple' ||
    normalized === 'black' ||
    normalized === 'yellow'
  ) {
    return normalized;
  }
  return 'red';
}

function normalizeType(value?: string): CardType {
  const normalized = (value || '').toLowerCase();
  if (normalized === 'leader' || normalized === 'character' || normalized === 'event' || normalized === 'stage') {
    return normalized;
  }
  return 'character';
}

function toBooleanLike(value: unknown): boolean | null {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const v = value.trim().toLowerCase();
    if (['true', '1', 'yes', 'y', 'active', 'legal', 'allowed'].includes(v)) return true;
    if (['false', '0', 'no', 'n', 'banned', 'illegal', 'forbidden', 'suspended'].includes(v)) return false;
  }
  return null;
}

function statusToString(value: unknown): string {
  if (typeof value === 'string') return value;
  if (value && typeof value === 'object') {
    const obj = value as { status?: unknown; value?: unknown; state?: unknown; name?: unknown };
    return String(obj.status || obj.value || obj.state || obj.name || '');
  }
  return '';
}

function normalizeTournamentStatus(card: BackendCard): 'active' | 'banned' | 'unknown' {
  // boolean-ish flags first (strongest signal)
  const bannedSignals = [card.is_banned, card.isBanned, card.banned];
  if (bannedSignals.some((flag) => toBooleanLike(flag) === true)) return 'banned';

  const activeSignals = [card.is_active, card.isActive, card.tournamentLegal];
  if (activeSignals.some((flag) => toBooleanLike(flag) === false)) return 'banned';
  if (activeSignals.some((flag) => toBooleanLike(flag) === true)) return 'active';

  const rawStatus = `${statusToString(card.tournament_status)} ${statusToString(card.tournamentStatus)} ${statusToString(
    card.status
  )} ${statusToString(card.card_status)} ${statusToString(card.legality)}`
    .toLowerCase()
    .trim();
  if (!rawStatus) return 'unknown';

  if (
    rawStatus.includes('banned') ||
    rawStatus.includes('ban') ||
    rawStatus.includes('forbidden') ||
    rawStatus.includes('suspended')
  ) {
    return 'banned';
  }

  if (
    rawStatus.includes('active') ||
    rawStatus.includes('legal') ||
    rawStatus.includes('allowed') ||
    rawStatus.includes('unrestricted')
  ) {
    return 'active';
  }

  return 'unknown';
}

function toCard(card: BackendCard, index: number): Card {
  const cardCode = card.id || `CARD-${index + 1}`;
  const effect = [card.effect, card.trigger].filter(Boolean).join(' | ');
  const tournamentStatus = normalizeTournamentStatus(card);

  return {
    card_code: cardCode,
    name: card.name || cardCode,
    color: normalizeColor(card.colors?.[0]),
    type: normalizeType(card.category),
    cost: Number(card.cost) || 0,
    power: Number(card.power) || 0,
    counter_value: Number(card.counter) || 0,
    traits: card.types || [],
    text_effect: effect,
    rarity: card.rarity || '-',
    set_code: card.pack_id || cardCode.split('-')[0] || 'SET',
    image_url: withApiBase(`/cardsApi/image/${encodeURIComponent(cardCode)}`) || DEFAULT_IMAGE_URL,
    tournament_status: tournamentStatus,
    is_active: tournamentStatus !== 'banned'
  };
}

export async function fetchCards(): Promise<Card[]> {
  const response = await fetch(API_URL);
  if (!response.ok) {
    throw new Error(`Cards API request failed with status ${response.status}`);
  }

  const payload = await response.json();
  const rawCards = Array.isArray(payload) ? payload : Array.isArray(payload?.cards) ? payload.cards : [];

  return rawCards
    .map((card: BackendCard, index: number) => toCard(card, index))
    .filter((card) => card.is_active !== false);
}

export function useCards() {
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadCards = async () => {
      try {
        setLoading(true);
        setError(null);
        const cardsData = await fetchCards();
        if (mounted) {
          setCards(cardsData);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to load cards');
          setCards([]);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    void loadCards();

    return () => {
      mounted = false;
    };
  }, []);

  return { cards, loading, error };
}

