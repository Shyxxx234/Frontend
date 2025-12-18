import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import styles from './loginPage.module.css'
import { signOut } from '../../login/login'

export function LoginPage() {
    const navigate = useNavigate()
    const { login, register, loading, user } = useAuth()
    
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [isLoginMode, setIsLoginMode] = useState(true)
    const [name, setName] = useState('')
    const [loginError, setLoginError] = useState(false)

    useEffect(() => {
        if (history.state == 'editor')  {
            signOut()
        }
        else if (user) {
            history.replaceState('login', '')
            navigate('/editor')
        }
    }, [user, navigate])
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        
        let success = false
        if (isLoginMode) {
            success = await login(email, password)
        } else {
            success = await register(email, password, name)
        }
        
        if (success && user) {
            navigate('/editor')
        }

        if (!success) {
            setLoginError(true)
        }
    }
    
    const handleSwitchMode = () => {
        setIsLoginMode(!isLoginMode)
    }
    
    return (
        <div className={styles.loginPage}>
            <div className={styles.loginContainer}>
                <h1 className={styles.title}>
                    {isLoginMode ? 'Вход в систему' : 'Регистрация'}
                </h1>
                
                <form onSubmit={handleSubmit} className={styles.form}>
                    {!isLoginMode && (
                        <input
                            type="text"
                            placeholder="Имя (опционально)"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className={styles.input}
                        />
                    )}
                    
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={styles.input}
                        required
                    />
                    
                    <input
                        type="password"
                        placeholder="Пароль"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={styles.input}
                        required
                        minLength={6}
                    />
                    
                    <button
                        type="submit"
                        className={styles.submitButton}
                        disabled={loading || !email || !password}
                    >
                        {loading ? 'Загрузка...' : (isLoginMode ? 'Войти' : 'Зарегистрироваться')}
                    </button>
                    
                    <button
                        type="button"
                        className={styles.switchButton}
                        onClick={handleSwitchMode}
                    >
                        {isLoginMode ? 'Нет аккаунта? Зарегистрироваться' : 'Есть аккаунт? Войти'}
                    </button>
                </form>
                {loginError && 
                    <span className={styles.loginError}>Указаны неверные почта или ароль</span>
                }
            </div>
        </div>
    )
}