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

// --- Google Auth Helpers ---

function decodeJwtResponse(token: string) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    } catch (e) {
        console.error("Failed to decode JWT", e);
        return null;
    }
}

export const processGoogleToken = async (token: string): Promise<User | null> => {
    const payload = decodeJwtResponse(token);
    
    if (!payload || !payload.email) {
        return null;
    }

    const users = await getUsers();
    // Check if user exists by email
    let user = users.find(u => u.email === payload.email);
    let updated = false;

    if (!user) {
        // If not, create a new user from Google data
        user = {
            username: payload.name || payload.email.split('@')[0],
            role: 'user', // Default role for Google users
            email: payload.email,
            picture: payload.picture
        };
        users.push(user);
        updated = true;
    } else {
        // Update picture if changed
        if (user.picture !== payload.picture) {
            user.picture = payload.picture;
            updated = true;
        }
    }

    if (updated) {
        await api.set(USERS_DB_KEY, users);
    }

    return user;
};