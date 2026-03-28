import './App.css'
import { RouterProvider } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { router } from './router';
import './index.css';
import { Toaster } from 'react-hot-toast';
import { useAuthBootstrap } from './hooks/useAuth';

const queryClient = new QueryClient();

function AuthBootstrap() {
  useAuthBootstrap();
  return null;
}

function App() {
  return (
    <>
      <QueryClientProvider client={queryClient}>
        <AuthBootstrap />
        <RouterProvider router={router} />
        <Toaster position="bottom-right" />
      </QueryClientProvider>
    </>
  )
}

export default App
