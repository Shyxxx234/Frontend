import { useState, useEffect } from 'react';
import { getCurrentUser, signIn, register, signOut } from '../login/login';
import type { Models } from 'appwrite';

export const useAuth = () => {
  const [user, setUser] = useState<Models.User<Models.Preferences> | null>(null);
  const [loading, setLoading] = useState(true);
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const userData = await getCurrentUser();
      setUser(userData);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      await signIn(email, password);
      const userData = await getCurrentUser();
      setUser(userData);
      setShowLogin(false);
    } catch (error) {
      alert('Ошибка входа: ' + error);
    }
  };

  const registerUser = async (email: string, password: string) => {
    try {
      await register(email, password);
      const userData = await getCurrentUser();
      setUser(userData);
      setShowRegister(false);
    } catch (error) {
      alert('Ошибка регистрации: ' + error);
    }
  };

  const logout = async () => {
    try {
      await signOut();
      setUser(null);
    } catch (error) {
      alert('Ошибка выхода: ' + error);
    }
  };

  return {
    user,
    loading,
    showLogin,
    showRegister,
    setShowLogin,
    setShowRegister,
    login,
    register: registerUser,
    logout,
  };
};