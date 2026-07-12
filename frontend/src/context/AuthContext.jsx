import { createContext, useContext, useState, useCallback } from 'react';
import { api } from '../api';

const AuthContext = createContext(null);

const TOKEN_KEY = 'fleetforge_token';
const USER_KEY  = 'fleetforge_user';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    // Support both old and new storage keys during migration
    const raw = localStorage.getItem(USER_KEY) || localStorage.getItem('transitops_user');
    return raw ? JSON.parse(raw) : null;
  });

  const persist = (token, userData) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
    // Clean up old keys
    localStorage.removeItem('transitops_token');
    localStorage.removeItem('transitops_user');
  };

  const login = useCallback(async (email, password) => {
    const data = await api.login(email, password);
    persist(data.token, data.user);
    setUser(data.user);
    return data.user;
  }, []);

  const register = useCallback(async (payload) => {
    const data = await api.register(payload);
    persist(data.token, data.user);
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem('transitops_token');
    localStorage.removeItem('transitops_user');
    setUser(null);
  }, []);

  const updateProfile = useCallback(async (updates) => {
    const data = await api.updateProfile(updates);
    const updated = data.user;
    localStorage.setItem(USER_KEY, JSON.stringify(updated));
    setUser(updated);
    return updated;
  }, []);

  const changePassword = useCallback(async (currentPassword, newPassword) => {
    return api.changePassword(currentPassword, newPassword);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateProfile, changePassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
