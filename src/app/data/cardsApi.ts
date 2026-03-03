import { useEffect, useState } from 'react';
import { Card, CardType, OPTCGColor } from './mockData';
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

function toCard(card: BackendCard, index: number): Card {
  const cardCode = card.id || `CARD-${index + 1}`;
  const effect = [card.effect, card.trigger].filter(Boolean).join(' | ');

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
    image_url: card.img_full_url || card.img_url || DEFAULT_IMAGE_URL
  };
}

export async function fetchCards(): Promise<Card[]> {
  const response = await fetch(API_URL);
  if (!response.ok) {
    throw new Error(`Cards API request failed with status ${response.status}`);
  }

  const payload = await response.json();
  const rawCards = Array.isArray(payload) ? payload : Array.isArray(payload?.cards) ? payload.cards : [];

  return rawCards.map((card: BackendCard, index: number) => toCard(card, index));
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

