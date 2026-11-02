import { User, UserRole, AuthUser } from '../types';
export type { AuthUser };
import { DEMO_USERS } from '../data/initialData';
import { setCurrentRole } from './storageService';

const AUTH_KEYS = {
  USERS: 'antaraja_auth_users_v1',
  SESSION: 'antaraja_auth_session_v1',
};

// Seed initial users
function getStoredUsers(): User[] {
  try {
    const raw = localStorage.getItem(AUTH_KEYS.USERS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    // ignore
  }

  const initialWithPass: User[] = [
    {
      ...DEMO_USERS[0],
      password: 'user123',
      createdAt: '2026-11-01T00:00:00.000Z',
    },
    {
      ...DEMO_USERS[1],
      password: 'admin123',
      createdAt: '2026-11-01T00:00:00.000Z',
    },
    {
      ...DEMO_USERS[2],
      password: 'kurir123',
      createdAt: '2026-11-01T00:00:00.000Z',
    },
  ];

  localStorage.setItem(AUTH_KEYS.USERS, JSON.stringify(initialWithPass));
  return initialWithPass;
}

export function getCurrentUser(): User | null {
  try {
    const raw = localStorage.getItem(AUTH_KEYS.SESSION);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    // ignore
  }
  return null;
}

export function setCurrentUser(user: User | null): void {
  if (user) {
    localStorage.setItem(AUTH_KEYS.SESSION, JSON.stringify(user));
    setCurrentRole(user.role);
  } else {
    localStorage.removeItem(AUTH_KEYS.SESSION);
    setCurrentRole('customer');
  }
}

export function loginUser(emailOrPhone: string, password?: string): User {
  const users = getStoredUsers();
  const trimmed = emailOrPhone.trim().toLowerCase();

  const found = users.find(
    (u) =>
      u.email.toLowerCase() === trimmed ||
      u.phone.replace(/\D/g, '') === trimmed.replace(/\D/g, '')
  );

  if (!found) {
    throw new Error('Akun tidak ditemukan. Periksa email atau nomor HP kamu.');
  }

  if (password && found.password && found.password !== password.trim()) {
    throw new Error('Kata sandi salah. Silakan coba lagi.');
  }

  setCurrentUser(found);
  return found;
}

export function registerCustomer(name: string, phone: string, email: string, password?: string): User {
  const users = getStoredUsers();
  const emailTrimmed = email.trim().toLowerCase();

  if (users.some((u) => u.email.toLowerCase() === emailTrimmed)) {
    throw new Error('Email ini sudah terdaftar. Silakan login.');
  }

  const newUser: User = {
    id: `user-${Date.now()}`,
    name: name.trim(),
    phone: phone.trim(),
    email: emailTrimmed,
    password: password || '123456',
    role: 'customer',
    createdAt: new Date().toISOString(),
  };

  const updated = [...users, newUser];
  localStorage.setItem(AUTH_KEYS.USERS, JSON.stringify(updated));
  setCurrentUser(newUser);
  return newUser;
}

export function fastDemoLogin(role: UserRole): User {
  const users = getStoredUsers();
  const target = users.find((u) => u.role === role) || users[0];
  setCurrentUser(target);
  return target;
}

export function logoutUser(): void {
  setCurrentUser(null);
}
