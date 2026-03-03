// Mock data for OPTCG DeckLab
// This represents the database structure for cards, decks, matches, and meta

export type OPTCGColor = 'red' | 'blue' | 'green' | 'purple' | 'black' | 'yellow';
export type CardType = 'leader' | 'character' | 'event' | 'stage';
export type DeckArchetype = 'aggro' | 'control' | 'midrange' | 'tempo' | 'ramp';
export type GameFormat = 'locals' | 'online' | 'regionals';

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

export interface DeckCard {
  card_code: string;
  count: number;
}

export interface Deck {
  deck_id: string;
  deck_name: string;
  leader_code: string;
  primary_color: OPTCGColor;
  decklist: DeckCard[];
  tags: DeckArchetype[];
  win_rate?: number;
  consistency_score?: number;
  meta_fit_score?: number;
}

export interface Match {
  match_id: string;
  date: string;
  format: GameFormat;
  player_deck_id: string;
  opponent_deck_id: string;
  went_first: boolean;
  result: 'W' | 'L';
  turns: number;
  notes: string;
}

export interface MetaData {
  leader_code: string;
  leader_name: string;
  color: OPTCGColor;
  pick_rate: number;
  win_rate: number;
  top_cut_rate: number;
  date_window: string;
}

// Sample Cards Database
export const mockCards: Card[] = [
  {
    card_code: 'OP01-001',
    name: 'Roronoa Zoro',
    color: 'green',
    type: 'leader',
    cost: 0,
    power: 5000,
    counter_value: 0,
    traits: ['Straw Hat Crew'],
    text_effect: '[Activate:Main] Once per turn: Give this Leader +1000 power during this turn.',
    rarity: 'L',
    set_code: 'OP01',
    image_url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400'
  },
  {
    card_code: 'OP01-016',
    name: 'Monkey D. Luffy',
    color: 'red',
    type: 'leader',
    cost: 0,
    power: 5000,
    counter_value: 0,
    traits: ['Straw Hat Crew'],
    text_effect: '[Don!! x1] [Your Turn] Give all your Characters +1000 power.',
    rarity: 'L',
    set_code: 'OP01',
    image_url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400'
  },
  {
    card_code: 'OP01-031',
    name: 'Nami',
    color: 'red',
    type: 'character',
    cost: 1,
    power: 1000,
    counter_value: 1000,
    traits: ['Straw Hat Crew'],
    text_effect: '[On Play] Look at 5 cards from the top of your deck; reveal up to 1 {Straw Hat Crew} type card and add it to your hand. Then, place the rest at the bottom of your deck in any order.',
    rarity: 'R',
    set_code: 'OP01',
    image_url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400'
  },
  {
    card_code: 'OP02-013',
    name: 'Charlotte Katakuri',
    color: 'purple',
    type: 'leader',
    cost: 0,
    power: 5000,
    counter_value: 0,
    traits: ['Big Mom Pirates'],
    text_effect: '[Activate:Main] Once per turn: Rest up to 1 of your opponent\'s Characters with a cost of 3 or less.',
    rarity: 'L',
    set_code: 'OP02',
    image_url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400'
  },
  {
    card_code: 'OP03-022',
    name: 'Kaido',
    color: 'purple',
    type: 'leader',
    cost: 0,
    power: 6000,
    counter_value: 0,
    traits: ['Animal Kingdom Pirates'],
    text_effect: '[Don!! x2] [When Attacking] Your opponent cannot activate [Blocker] during this battle.',
    rarity: 'L',
    set_code: 'OP03',
    image_url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400'
  },
  {
    card_code: 'OP04-001',
    name: 'Trafalgar Law',
    color: 'blue',
    type: 'leader',
    cost: 0,
    power: 5000,
    counter_value: 0,
    traits: ['Heart Pirates'],
    text_effect: '[Activate:Main] Once per turn: Return 1 Character with a cost of 4 or less to the owner\'s hand.',
    rarity: 'L',
    set_code: 'OP04',
    image_url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400'
  },
  {
    card_code: 'OP05-011',
    name: 'Eustass Kid',
    color: 'red',
    type: 'leader',
    cost: 0,
    power: 5000,
    counter_value: 0,
    traits: ['Kid Pirates'],
    text_effect: '[Don!! x1] [When Attacking] If you have 3 or less cards in your hand, draw 1 card.',
    rarity: 'L',
    set_code: 'OP05',
    image_url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400'
  },
  {
    card_code: 'OP01-047',
    name: 'Radical Beam',
    color: 'red',
    type: 'event',
    cost: 1,
    power: 0,
    counter_value: 0,
    traits: ['Straw Hat Crew'],
    text_effect: '[Main] K.O. up to 1 of your opponent\'s Characters with 3000 power or less.',
    rarity: 'C',
    set_code: 'OP01',
    image_url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400'
  },
  {
    card_code: 'OP02-036',
    name: 'Gum-Gum Red Roc',
    color: 'red',
    type: 'event',
    cost: 3,
    power: 0,
    counter_value: 0,
    traits: ['Straw Hat Crew'],
    text_effect: '[Main] K.O. up to 1 of your opponent\'s Characters with 6000 power or less.',
    rarity: 'UC',
    set_code: 'OP02',
    image_url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400'
  },
  {
    card_code: 'ST01-001',
    name: 'Nico Robin',
    color: 'black',
    type: 'leader',
    cost: 0,
    power: 5000,
    counter_value: 0,
    traits: ['Straw Hat Crew'],
    text_effect: '[Don!! x1] [Your Turn] All of your {Straw Hat Crew} type Characters gain +1000 power.',
    rarity: 'L',
    set_code: 'ST01',
    image_url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400'
  }
];

// Sample Decks
export const mockDecks: Deck[] = [
  {
    deck_id: 'deck_001',
    deck_name: 'Red Luffy Aggro',
    leader_code: 'OP01-016',
    primary_color: 'red',
    decklist: [
      { card_code: 'OP01-031', count: 4 },
      { card_code: 'OP01-047', count: 4 },
      { card_code: 'OP02-036', count: 3 }
    ],
    tags: ['aggro', 'tempo'],
    win_rate: 68.5,
    consistency_score: 85,
    meta_fit_score: 92
  },
  {
    deck_id: 'deck_002',
    deck_name: 'Purple Kaido Control',
    leader_code: 'OP03-022',
    primary_color: 'purple',
    decklist: [
      { card_code: 'OP02-013', count: 3 }
    ],
    tags: ['control', 'ramp'],
    win_rate: 62.3,
    consistency_score: 78,
    meta_fit_score: 85
  },
  {
    deck_id: 'deck_003',
    deck_name: 'Blue Law Midrange',
    leader_code: 'OP04-001',
    primary_color: 'blue',
    decklist: [],
    tags: ['midrange', 'control'],
    win_rate: 65.8,
    consistency_score: 82,
    meta_fit_score: 88
  }
];

// Sample Match Data
export const mockMatches: Match[] = [
  {
    match_id: 'match_001',
    date: '2026-02-20',
    format: 'online',
    player_deck_id: 'deck_001',
    opponent_deck_id: 'deck_002',
    went_first: true,
    result: 'W',
    turns: 8,
    notes: 'Aggressive mulligan paid off'
  },
  {
    match_id: 'match_002',
    date: '2026-02-21',
    format: 'locals',
    player_deck_id: 'deck_001',
    opponent_deck_id: 'deck_003',
    went_first: false,
    result: 'L',
    turns: 11,
    notes: 'Bricked on turn 4'
  }
];

// Sample Meta Data
export const mockMetaData: MetaData[] = [
  {
    leader_code: 'OP01-016',
    leader_name: 'Monkey D. Luffy',
    color: 'red',
    pick_rate: 18.5,
    win_rate: 68.5,
    top_cut_rate: 22.3,
    date_window: '2026-02-01 to 2026-02-24'
  },
  {
    leader_code: 'OP03-022',
    leader_name: 'Kaido',
    color: 'purple',
    pick_rate: 16.2,
    win_rate: 62.3,
    top_cut_rate: 18.7,
    date_window: '2026-02-01 to 2026-02-24'
  },
  {
    leader_code: 'OP04-001',
    leader_name: 'Trafalgar Law',
    color: 'blue',
    pick_rate: 15.8,
    win_rate: 65.8,
    top_cut_rate: 19.2,
    date_window: '2026-02-01 to 2026-02-24'
  },
  {
    leader_code: 'OP02-013',
    leader_name: 'Charlotte Katakuri',
    color: 'purple',
    pick_rate: 14.3,
    win_rate: 59.2,
    top_cut_rate: 15.8,
    date_window: '2026-02-01 to 2026-02-24'
  },
  {
    leader_code: 'OP05-011',
    leader_name: 'Eustass Kid',
    color: 'red',
    pick_rate: 12.7,
    win_rate: 61.5,
    top_cut_rate: 14.2,
    date_window: '2026-02-01 to 2026-02-24'
  },
  {
    leader_code: 'OP01-001',
    leader_name: 'Roronoa Zoro',
    color: 'green',
    pick_rate: 11.2,
    win_rate: 58.3,
    top_cut_rate: 12.5,
    date_window: '2026-02-01 to 2026-02-24'
  }
];

// Color matchup data (win rates)
export const colorMatchups: Record<OPTCGColor, Record<OPTCGColor, number>> = {
  red: {
    red: 50,
    blue: 55,
    green: 62,
    purple: 48,
    black: 58,
    yellow: 65
  },
  blue: {
    red: 45,
    blue: 50,
    green: 52,
    purple: 58,
    black: 55,
    yellow: 60
  },
  green: {
    red: 38,
    blue: 48,
    green: 50,
    purple: 52,
    black: 47,
    yellow: 55
  },
  purple: {
    red: 52,
    blue: 42,
    green: 48,
    purple: 50,
    black: 50,
    yellow: 45
  },
  black: {
    red: 42,
    blue: 45,
    green: 53,
    purple: 50,
    black: 50,
    yellow: 52
  },
  yellow: {
    red: 35,
    blue: 40,
    green: 45,
    purple: 55,
    black: 48,
    yellow: 50
  }
};

// Color stats for Best Color Finder
export interface ColorStats {
  color: OPTCGColor;
  win_rate: number;
  pick_rate: number;
  bad_matchups_count: number;
  consistency: number;
  skill_floor: number;
  skill_ceiling: number;
  top_leaders: string[];
}

export const colorStats: ColorStats[] = [
  {
    color: 'red',
    win_rate: 65.2,
    pick_rate: 31.2,
    bad_matchups_count: 2,
    consistency: 88,
    skill_floor: 6,
    skill_ceiling: 9,
    top_leaders: ['OP01-016', 'OP05-011']
  },
  {
    color: 'blue',
    win_rate: 62.5,
    pick_rate: 22.8,
    bad_matchups_count: 1,
    consistency: 85,
    skill_floor: 7,
    skill_ceiling: 10,
    top_leaders: ['OP04-001']
  },
  {
    color: 'purple',
    win_rate: 60.8,
    pick_rate: 30.5,
    bad_matchups_count: 2,
    consistency: 82,
    skill_floor: 5,
    skill_ceiling: 9,
    top_leaders: ['OP03-022', 'OP02-013']
  },
  {
    color: 'green',
    win_rate: 56.3,
    pick_rate: 11.2,
    bad_matchups_count: 3,
    consistency: 80,
    skill_floor: 6,
    skill_ceiling: 8,
    top_leaders: ['OP01-001']
  },
  {
    color: 'black',
    win_rate: 54.8,
    pick_rate: 8.5,
    bad_matchups_count: 2,
    consistency: 78,
    skill_floor: 7,
    skill_ceiling: 9,
    top_leaders: ['ST01-001']
  },
  {
    color: 'yellow',
    win_rate: 51.2,
    pick_rate: 5.8,
    bad_matchups_count: 4,
    consistency: 75,
    skill_floor: 8,
    skill_ceiling: 10,
    top_leaders: []
  }
];
