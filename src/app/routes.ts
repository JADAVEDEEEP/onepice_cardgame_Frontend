import { createBrowserRouter } from 'react-router';
import Login from './pages/login';
import Onboarding from './pages/onboarding';
import Dashboard from './pages/dashboard';
import BestColorFinder from './pages/best-color-finder';
import GenerateDeck from './pages/generate-deck';
import DeckBuilder from './pages/deck-builder';
import DeckCompare from './pages/deck-compare';
import MatchupMatrix from './pages/matchup-matrix';
import CardExplorer from './pages/card-explorer';
import MetaTrends from './pages/meta-trends';
import MyCollection from './pages/my-collection';
import Reports from './pages/reports';
import Settings from './pages/settings';
import DeckAnalytics from './pages/deck-analytics';
import { AppLayout } from './layouts/app-layout';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Login
  },
  {
    path: '/onboarding',
    Component: Onboarding
  },
  {
    path: '/',
    Component: AppLayout,
    children: [
      {
        path: 'dashboard',
        Component: Dashboard
      },
      {
        path: 'color-finder',
        Component: BestColorFinder
      },
      {
        path: 'generate-deck',
        Component: GenerateDeck
      },
      {
        path: 'deck-builder',
        Component: DeckBuilder
      },
      {
        path: 'deck-analytics/:deckId',
        Component: DeckAnalytics
      },
      {
        path: 'deck-compare',
        Component: DeckCompare
      },
      {
        path: 'matchup-matrix',
        Component: MatchupMatrix
      },
      {
        path: 'card-explorer',
        Component: CardExplorer
      },
      {
        path: 'meta-trends',
        Component: MetaTrends
      },
      {
        path: 'my-collection',
        Component: MyCollection
      },
      {
        path: 'reports',
        Component: Reports
      },
      {
        path: 'settings',
        Component: Settings
      }
    ]
  }
]);