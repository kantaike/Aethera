import type { components } from './schema';
import api from './client';

type LoginUserCommand = components['schemas']['LoginUserCommand'];
type RegisterUserCommand = components['schemas']['RegisterUserCommand'];

export type AuthUser = {
  id: string;
  username: string;
  role: string;
};

type LoginResponse = {
  token: string;
};

const ROLE_BY_INDEX: Record<number, string> = {
  0: 'Master',
  1: 'Player',
  2: 'Reader',
  3: 'Writer',
};

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null;
};

const readString = (record: Record<string, unknown>, keys: string[]) => {
  for (const key of keys) {
    const value = record[key];

    if (typeof value === 'string' && value.trim().length > 0) {
      return value.trim();
    }
  }

  return null;
};

const normalizeRole = (value: unknown) => {
  if (typeof value === 'string') {
    const trimmed = value.trim();

    if (!trimmed) {
      return 'Unknown';
    }

    const numericRole = Number(trimmed);
    if (Number.isInteger(numericRole) && ROLE_BY_INDEX[numericRole]) {
      return ROLE_BY_INDEX[numericRole];
    }

    return trimmed;
  }

  if (typeof value === 'number' && ROLE_BY_INDEX[value]) {
    return ROLE_BY_INDEX[value];
  }

  return 'Unknown';
};

const normalizeLoginResponse = (data: unknown): LoginResponse => {
  if (!isRecord(data)) {
    throw new Error('Login response has an unexpected format.');
  }

  const token = readString(data, ['token', 'accessToken', 'Token', 'AccessToken']);

  if (!token) {
    throw new Error('Login response does not contain an access token.');
  }

  return { token };
};

export const normalizeCurrentUser = (data: unknown): AuthUser => {
  if (!isRecord(data)) {
    throw new Error('Current user response has an unexpected format.');
  }

  const id = readString(data, ['id', 'userId', 'Id', 'UserId']);
  const username = readString(data, ['username', 'userName', 'name', 'Username', 'UserName', 'Name']);

  if (!id || !username) {
    throw new Error('Current user response is missing required fields.');
  }

  return {
    id,
    username,
    role: normalizeRole(data.role ?? data.Role),
  };
};

export const authApi = {
  login: (data: LoginUserCommand) => api.post('/Auth/login', data).then((res) => normalizeLoginResponse(res.data)),
  me: () => api.get('/Auth/me').then((res) => normalizeCurrentUser(res.data)),
  register: (data: RegisterUserCommand) => api.post('/Auth/register', data).then((res) => res.data),
};
