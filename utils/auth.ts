import { USERS_DB_KEY } from '../constants';
import { User } from '../types';
import { api } from './api';

// Initialize DB with default admin if empty
export const initAuthDB = async () => {
  const users = await api.get<User[]>(USERS_DB_KEY);
  if (!users || users.length === 0) {
    const defaultAdmin: User = {
      username: 'admin',
      password: 'admin',
      role: 'admin'
    };
    await api.set(USERS_DB_KEY, [defaultAdmin]);
  }
};

export const getUsers = async (): Promise<User[]> => {
  const users = await api.get<User[]>(USERS_DB_KEY);
  return users || [];
};

export const createUser = async (username: string, password: string): Promise<{ success: boolean; message?: string }> => {
  const users = await getUsers();
  
  if (users.find(u => u.username.toLowerCase() === username.toLowerCase())) {
    return { success: false, message: 'Username already exists' };
  }

  const newUser: User = {
    username,
    password,
    role: 'user'
  };

  users.push(newUser);
  await api.set(USERS_DB_KEY, users);
  return { success: true };
};

export const authenticate = async (username: string, password: string): Promise<User | null> => {
  const users = await getUsers();
  const user = users.find(u => u.username.toLowerCase() === username.toLowerCase() && u.password === password);
  return user ? { ...user, password: '' } : null; // Remove password before returning
};