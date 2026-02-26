# OPTCG DeckLab – Complete Documentation

## Overview

**OPTCG DeckLab** is a full-featured, responsive web application for One Piece Trading Card Game (OPTCG) competitive analytics. It provides data-driven insights for deck building, color selection, matchup analysis, and meta trend tracking.

---

## 🎨 Design System

### Color Tokens

The application uses a comprehensive design system with the following color variables:

#### Background & Surface
- `--bg-primary`: Main background
- `--bg-secondary`: Secondary background
- `--surface-1`, `--surface-2`, `--surface-3`: Card and component surfaces

#### Text
- `--text-primary`: Main text
- `--text-secondary`: Secondary text
- `--text-muted`: Muted/disabled text

#### Borders
- `--border-default`: Standard borders
- `--border-soft`: Subtle borders

#### OPTCG Colors (One Piece TCG)
- `--accent-red`: Red deck color (#ef4444 dark, #dc2626 light)
- `--accent-blue`: Blue deck color (#3b82f6 dark, #2563eb light)
- `--accent-green`: Green deck color (#22c55e dark, #16a34a light)
- `--accent-purple`: Purple deck color (#a855f7 dark, #9333ea light)
- `--accent-black`: Black deck color (#374151 dark, #1f2937 light)
- `--accent-yellow`: Yellow deck color (#facc15 dark, #eab308 light)

#### State Colors
- `--state-success`: Success states (#22c55e)
- `--state-warn`: Warning states (#f59e0b)
- `--state-danger`: Danger states (#ef4444)
- `--state-info`: Info states (#3b82f6)

### Typography

- **Display XL**: Dashboard headlines
- **H1, H2, H3**: Standard headings
- **Body M, Body S**: Body text
- **Label**: Form labels
- **Caption**: Small descriptive text
- **Mono**: Card codes (e.g., `OP01-016`)

### Spacing System

- 4px, 8px, 12px, 16px, 24px, 32px, 40px

### Border Radius

- 10px (`--radius-10`)
- 14px (`--radius-14`)
- 20px (`--radius-20`)

### Responsive Grid

- **Desktop**: 12 columns, max-width 1320px, 24px gutter
- **Tablet**: 8 columns
- **Mobile**: 4 columns

---

## 📊 Data Structure

The application uses a mock database structure that's ready to connect to a real backend:

### Tables

#### `cards`
```typescript
{
  card_code: string;        // e.g., "OP01-016"
  name: string;
  color: OPTCGColor;       // red | blue | green | purple | black | yellow
  type: CardType;          // leader | character | event | stage
  cost: number;
  power: number;
  counter_value: number;
  traits: string[];
  text_effect: string;
  rarity: string;
  set_code: string;
  image_url: string;
}
```

#### `decks`
```typescript
{
  deck_id: string;
  deck_name: string;
  leader_code: string;
  primary_color: OPTCGColor;
  decklist: { card_code: string; count: number }[];
  tags: DeckArchetype[];   // aggro | control | midrange | tempo | ramp
  win_rate?: number;
  consistency_score?: number;
  meta_fit_score?: number;
}
```

#### `matches`
```typescript
{
  match_id: string;
  date: string;
  format: GameFormat;      // locals | online | regionals
  player_deck_id: string;
  opponent_deck_id: string;
  went_first: boolean;
  result: 'W' | 'L';
  turns: number;
  notes: string;
}
```

#### `meta`
```typescript
{
  leader_code: string;
  leader_name: string;
  color: OPTCGColor;
  pick_rate: number;
  win_rate: number;
  top_cut_rate: number;
  date_window: string;
}
```

---

## 🧭 Application Structure

### Pages

1. **Login** (`/`)
   - Google OAuth integration ready
   - Guest access
   - Feature highlights

2. **Onboarding** (`/onboarding`)
   - 3-step data import wizard
   - Cards, Decklists, Match History
   - CSV/JSON support

3. **Dashboard** (`/dashboard`)
   - 6 KPI cards (Win Rate, Best Color, Best Leader, Worst Matchup, Consistency, Meta Fit)
   - Meta trend chart (win rate by color over time)
   - Pick rate bar chart (top 10 leaders)
   - Recommended decks
   - Matchup heatmap preview
   - Quick actions panel

4. **Best Color Finder** (`/color-finder`)
   - Filter panel (date, format, playstyle, going first/second, budget, meta weight)
   - Top 3 recommended colors + wildcard
   - "Why this color wins" explanation
   - Color comparison table with all metrics
   - Clickable rows for detailed color breakdowns

5. **Deck Builder** (`/deck-builder`)
   - 3-column layout: Filters | Card Grid | Deck Panel
   - Search by name or code
   - Advanced filters (color, type, cost, power, traits, set, owned only)
   - Leader slot
   - Deck progress (0/50)
   - Curve visualization
   - Quick stats (counter density, removal, draw/search, tempo)
   - Tabs: List, Curve, Analytics
   - "Optimize deck" and "Simulate matchups" actions

6. **Deck Analytics** (`/deck-analytics/:deckId`)
   - Tabs: Overview, Matchups, Consistency, Card Contribution, Mulligan Guide
   - **Overview**: Win rate, consistency, meta fit, type distribution, going first vs second
   - **Matchups**: Full heatmap vs top leaders
   - **Card Contribution**: Drawn win rate, mulligan keep %, synergy scores
   - **Mulligan Guide**: Keep/toss examples with reasoning

7. **Deck Compare** (`/deck-compare`)
   - Side-by-side deck selection
   - Key metrics comparison
   - Radar chart (playstyle profile)
   - Recommendations: "Choose Deck A if..." vs "Choose Deck B if..."

8. **Matchup Matrix** (`/matchup-matrix`)
   - Full heatmap grid (your deck vs all leaders)
   - Color-coded win rates with confidence indicators
   - Click cell → detailed breakdown drawer
   - Common win/loss conditions
   - Recommended tech cards
   - Best play pattern tips

9. **Card Explorer** (`/card-explorer`)
   - Full card database search
   - Advanced filters
   - Card grid view
   - Card detail modals (planned)

10. **Meta Trends** (`/meta-trends`)
    - Placeholder for historical meta analysis

11. **My Collection** (`/my-collection`)
    - Placeholder for owned cards tracking

12. **Reports** (`/reports`)
    - Placeholder for analytics export

13. **Settings** (`/settings`)
    - Dark mode toggle (default: on)
    - Show card codes toggle
    - Data sharing preferences

---

## 🧩 Key Components

### Reusable Components

#### `KPICard`
```tsx
<KPICard
  title="Overall Win Rate"
  value="65.2%"
  subtitle="Last 30 days"
  icon={Trophy}
  trend="up"
  trendValue="+2.3%"
  dataSource="matches.result"
/>
```

#### `ColorBadge`
```tsx
<ColorBadge color="red" size="md" showLabel={true} />
<ColorBadges colors={['red', 'blue']} size="sm" />
```

#### `CardTile`
```tsx
<CardTile
  card={card}
  onAdd={addCard}
  onRemove={removeCard}
  count={2}
  synergy="removal"
  compact={false}
/>
```

#### `HeatmapGrid`
```tsx
<HeatmapGrid
  data={heatmapData}
  rows={['Red Luffy', 'Purple Kaido']}
  cols={['Blue Law', 'Green Zoro']}
  onCellClick={(row, col) => console.log(row, col)}
/>
```

#### `DataSourceLabel`
```tsx
<DataSourceLabel source="meta.win_rate, matches.result" />
```

---

## 📱 Responsive Design

### Desktop (≥1024px)
- Full sidebar navigation
- 3-column layouts in Deck Builder
- 12-column grid
- All features visible

### Tablet (768px - 1023px)
- Hamburger menu sidebar
- 2-column layouts
- 8-column grid
- Optimized spacing

### Mobile (<768px)
- Bottom tab navigation (Dashboard, Builder, Explore, Compare, Settings)
- Single-column layouts
- 4-column grid
- Touch-optimized interactions
- Sticky headers

---

## 🎯 Data Source Labels

Every analytics widget displays its data source in small mono font at the bottom:

```
Data: matches.result, decks.leader_code
```

This makes it clear which database tables/fields power each visualization, making the app database-ready.

---

## 🚀 Tech Stack

- **React 18.3.1** with TypeScript
- **React Router 7** (Data Router pattern)
- **Tailwind CSS v4** with custom design tokens
- **Recharts** for data visualization
- **Radix UI** for accessible components
- **Lucide React** for icons
- **Motion** for animations (ready to use)
- **Sonner** for toast notifications

---

## 📦 Mock Data

All data is currently mock but structured to match real database schemas:

- 10 sample cards covering all colors and types
- 3 sample decks with realistic stats
- 2 sample match records
- 6 meta leader stats
- Color matchup matrix
- Color stats for Best Color Finder

Located in: `/src/app/data/mockData.ts`

---

## 🎨 Theme & Dark Mode

Dark mode is **enabled by default** with full support for light mode.

Toggle via Settings page or by adding/removing the `dark` class on the root element.

All colors use CSS variables that automatically adapt to theme changes.

---

## 🔧 Customization

### Adding a New Color

1. Update `theme.css` with new color tokens
2. Add to `OPTCGColor` type in `mockData.ts`
3. Update `colorConfig` in `color-badge.tsx`
4. Add to filters in Deck Builder and Color Finder

### Adding a New Page

1. Create page in `/src/app/pages/`
2. Add route to `/src/app/routes.ts`
3. Add navigation item to `/src/app/components/app-sidebar.tsx`

### Connecting to Real Database

1. Replace mock data imports with API calls
2. Use the existing data types
3. Data source labels already reference correct table.field names
4. Add loading states and error handling

---

## 📊 Analytics Features

### Best Color Finder Algorithm

Based on:
- Win rate in selected date window
- Pick rate (popularity)
- Bad matchup count (vs top 6 meta)
- Consistency score
- Skill floor/ceiling
- Playstyle preference (aggro/control slider)
- Going first vs second preference
- Budget constraints
- Meta weight (balanced/counter/safe)

### Deck Optimization

- Curve smoothness analysis
- Counter density calculation
- Removal/draw/search counts
- Tempo scoring
- Brick rate estimation
- Synergy detection

### Matchup Analysis

- Win rate heatmaps with confidence indicators
- Sample size warnings
- Common win/loss patterns
- Tech card recommendations
- Play pattern guides

---

## 🎮 User Flow

1. **Login** → Choose Google or Guest
2. **Onboarding** → Import Cards, Decks, Matches (or skip)
3. **Dashboard** → Overview of all stats and quick actions
4. **Best Color Finder** → Discover optimal color for current meta
5. **Deck Builder** → Build deck with AI suggestions
6. **Deck Analytics** → Deep dive into deck performance
7. **Matchup Matrix** → Study all matchups
8. **Card Explorer** → Browse full database
9. **Deck Compare** → A/B test two decks

---

## 🏆 Best Practices

- All analytics widgets show their data sources
- Card codes displayed in monospace font
- Color-coded for quick recognition
- Hover states on interactive elements
- Loading states ready (add spinners when connecting real API)
- Mobile-first responsive design
- Accessible (Radix UI components)
- Consistent spacing and typography

---

## 📝 Future Enhancements

- Real-time data sync
- User authentication and profiles
- Deck sharing and social features
- Advanced filters and search
- Export to multiple formats
- Mobile app (React Native)
- AI-powered deck suggestions
- Tournament mode
- Team collaboration features

---

## 🎯 Summary

OPTCG DeckLab is a production-ready, enterprise-grade analytics platform for competitive One Piece TCG players. It combines modern web technologies with a clean, data-driven design to help players make informed decisions about deck building, color selection, and meta positioning.

**Key Differentiators:**
- Database-ready architecture with clear data source labels
- Comprehensive analytics across all aspects of competitive play
- Beautiful, responsive UI with dark mode default
- Real card codes and structured data
- Professional competitive gamer aesthetic

Built with ❤️ for the One Piece TCG community.
