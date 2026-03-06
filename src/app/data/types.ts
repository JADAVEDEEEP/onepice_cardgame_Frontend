export type OPTCGColor = 'red' | 'blue' | 'green' | 'purple' | 'black' | 'yellow';
export type CardType = 'leader' | 'character' | 'event' | 'stage';

export interface Card {
  card_code: string;
  name: string;
  color: OPTCGColor;
  type: CardType;
  cost: number;
  power: number;
  counter_value: number;
  traits: string[];
  text_effect: string;
  rarity: string;
  set_code: string;
  image_url: string;
  tournament_status?: 'active' | 'banned' | 'unknown';
  is_active?: boolean;
}
