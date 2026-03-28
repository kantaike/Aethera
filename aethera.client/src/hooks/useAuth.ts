import { useEffect } from 'react';
import { type UseMutationOptions, useMutation } from '@tanstack/react-query';
import { type AuthUser, authApi } from '../api/auth';
import type { components } from '../api/schema';
import { useAuthStore } from '../store/authStore';

type LoginUserCommand = components['schemas']['LoginUserCommand'];
type RegisterUserCommand = components['schemas']['RegisterUserCommand'];

export const useLogin = (options?: UseMutationOptions<AuthUser, Error, LoginUserCommand>) => {
  return useMutation<AuthUser, Error, LoginUserCommand>({
    mutationFn: async (credentials) => {
      const { token } = await authApi.login(credentials);

      useAuthStore.getState().setToken(token);

      try {
        const currentUser = await authApi.me();
        useAuthStore.getState().setAuthSession(token, currentUser);
        return currentUser;
      } catch (error) {
        useAuthStore.getState().clearAuth();
        throw error;
      }
    },
    ...options,
  });
};

export const useRegistration = (options?: UseMutationOptions<unknown, Error, RegisterUserCommand>) => {
  return useMutation<unknown, Error, RegisterUserCommand>({
    mutationFn: authApi.register,
    ...options,
  });
};

export const useAuthBootstrap = () => {
  const token = useAuthStore((state) => state.token);
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const setCurrentUser = useAuthStore((state) => state.setCurrentUser);
  const clearAuth = useAuthStore((state) => state.clearAuth);

  useEffect(() => {
    if (!isHydrated || !token) {
      return;
    }

    let isCancelled = false;

    authApi.me()
      .then((user) => {
        if (!isCancelled) {
          setCurrentUser(user);
        }
      })
      .catch(() => {
        if (!isCancelled) {
          clearAuth();
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [clearAuth, isHydrated, setCurrentUser, token]);
};
