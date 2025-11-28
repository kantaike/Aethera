// src/router.tsx
import { createBrowserRouter } from 'react-router-dom';
import Layout from './components/Layout';
import CharactersPage from './pages/CharactersPage';
import CharacterDetailsPage from './pages/CharacterDetailsPage';
import { SettlementsPage } from './pages/SettlementsPage';
import { DynastiesPage } from './pages/DynastiesPage';
import { ItemsPage } from './pages/ItemsPage';
import { ItemDetailsPage } from './pages/ItemDetailsPage';
import { DynastyDetailsPage } from './pages/DynastyDetailsPage';
import { SettlementDetailsPage } from './pages/SettlementDetailsPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { path: 'characters', element: <CharactersPage /> },
      { path: 'characters/:id', element: <CharacterDetailsPage /> },
      { path: 'settlements', element: <SettlementsPage /> },
      { path: 'settlements/:id', element: <SettlementDetailsPage /> },
      { path: 'dynasties', element: <DynastiesPage /> },
      { path: 'dynasties/:id', element: <DynastyDetailsPage /> },
      { path: 'items', element: <ItemsPage /> },
      { path: 'items/:id', element: <ItemDetailsPage /> },
    ],
  },
]);