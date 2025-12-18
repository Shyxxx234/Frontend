import { useState, useEffect } from 'react'
import { getCurrentUser, signIn, register, signOut } from '../login/login'
import type { Models } from 'appwrite'

export const useAuth = () => {
  const [user, setUser] = useState<Models.User<Models.Preferences> | null>(null)
  const [loading, setLoading] = useState(true)
  const [showLogin, setShowLogin] = useState(false)
  const [showRegister, setShowRegister] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      const userData = await getCurrentUser()
      setUser(userData)
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    setError(null)
    try {
      await signIn(email, password)
      const userData = await getCurrentUser()
      setUser(userData)
      setShowLogin(false)
      return true
    } catch {
      return false
    }
  }

  const registerUser = async (email: string, password: string, name: string) => {
    setError(null)
    await register(email, password, name)

    const loginResult = await signIn(email, password)
    if (loginResult) {
      const userData = await getCurrentUser()
      setUser(userData)
      setShowRegister(false)
      return true
    }
    return false
  }

  const logoutUser = async () => {
      await signOut()
      setUser(null)
  }

  return {
    user,
    loading,
    showLogin,
    showRegister,
    error,
    setShowLogin,
    setShowRegister,
    login,
    register: registerUser,
    logout: logoutUser,
  }
}