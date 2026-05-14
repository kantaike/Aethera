// src/router.tsx
import { Suspense, lazy } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import Layout from './components/Layout';
import { FantasyLoader } from './components/Loader/FantasyLoader';
import CharactersPage from './pages/CharactersPage';
import CharacterDetailsPage from './pages/CharacterDetailsPage';
import { SettlementsPage } from './pages/SettlementsPage';
import { DynastiesPage } from './pages/DynastiesPage';
import { ItemsPage } from './pages/ItemsPage';
import { ItemDetailsPage } from './pages/ItemDetailsPage';
import { DynastyDetailsPage } from './pages/DynastyDetailsPage';
import { SettlementDetailsPage } from './pages/SettlementDetailsPage';
import ProfilePage from './pages/ProfilePage';
import LoginPage from './pages/LoginPage';
import RegistrationPage from './pages/RegistrationPage';
import { StoriesPage } from './pages/StoriesPage';
import { StoryDetailsPage } from './pages/StoryDetailsPage';
import HomePage from './pages/HomePage';

const CreateStoryPage = lazy(() =>
  import('./pages/CreateStoryPage').then((module) => ({
    default: module.CreateStoryPage,
  }))
);

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'characters', element: <CharactersPage /> },
      { path: 'characters/:id', element: <CharacterDetailsPage /> },
      { path: 'settlements', element: <SettlementsPage /> },
      { path: 'settlements/:id', element: <SettlementDetailsPage /> },
      { path: 'dynasties', element: <DynastiesPage /> },
      { path: 'dynasties/:id', element: <DynastyDetailsPage /> },
      { path: 'items', element: <ItemsPage /> },
      { path: 'items/:id', element: <ItemDetailsPage /> },
      { path: 'stories', element: <StoriesPage /> },
      {
        path: 'stories/create',
        element: (
          <Suspense fallback={<FantasyLoader />}>
            <CreateStoryPage />
          </Suspense>
        ),
      },
      { path: 'stories/:id', element: <StoryDetailsPage /> },
      { path: 'profile', element: <ProfilePage /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'registration', element: <RegistrationPage /> },
    ],
  },
]);