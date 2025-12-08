import type React from "react"
import { Button } from "../../common/Button"
import styles from "./sidePanel.module.css"
import { useSelector, useDispatch } from 'react-redux'
import { removeObject } from '../../store/slideObjectSlice'
import { useRef, useState } from "react"
import { useAuth } from '../../hooks/useAuth'
import type { RootState } from "../../store/store"
import { selectSlide } from "../../store/presentationSlice"
import { changeBackgroundToColor } from "../../store/slideSlice"
import { historyManager } from "../../store/history"

export function SidePanel() {
    const dispatch = useDispatch()
    const presentation = useSelector((state: RootState) => state.presentation)
    const selectedSlideId = presentation.selectedSlide
    const selectedObjects = presentation.selectedObjects

    const {
        user,
        loading,
        showLogin,
        showRegister,
        setShowLogin,
        setShowRegister,
        login,
        register,
        logout
    } = useAuth()

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    const colorTimeoutRef = useRef<number | null>(null)

    

    const handleRemoveObject = () => {
        if (selectedSlideId && selectedObjects.length > 0) {
            const objectId = selectedObjects[0]
            dispatch(removeObject({ objectId, slideId: selectedSlideId }))
        }
    }

    const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const color = e.target.value

        if (colorTimeoutRef.current) {
            clearTimeout(colorTimeoutRef.current)
        }
        dispatch(selectSlide(selectedSlideId))

        colorTimeoutRef.current = window.setTimeout(() => {
            if (selectedSlideId) {
                dispatch(changeBackgroundToColor({ color, slideId: selectedSlideId }))
            }
        }, 300)
    }

    const handleLoginSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        login(email, password)
    }

    const handleRegisterSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        register(email, password)
    }

    const handleLoginClick = () => {
        login(email, password)
    }

    const handleRegisterClick = () => {
        register(email, password)
    }

    const handleUndo = () => {
        dispatch({ type: 'history/undo' })
    }

    const handleRedo = () => {
        dispatch({ type: 'history/redo' })
    }

    const closeModals = () => {
        setShowLogin(false)
        setShowRegister(false)
        setEmail('')
        setPassword('')
    }

    return (
        <div className={styles.sidePanel}>
            <div className={styles.section}>
                <h3 className={styles.text}>Аккаунт</h3>
                {loading ? (
                    <div style={{ fontSize: '12px', color: '#666' }}>Загрузка...</div>
                ) : user ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ fontSize: '30px', color: '#ffffffff' }}>
                            {user.name || user.email}
                        </div>
                        <Button
                            className={styles.button}
                            onClick={logout}
                        >
                            Выйти
                        </Button>
                    </div>
                ) : (
                    <div style={{ display: 'flex', gap: '8px', flexDirection: 'column' }}>
                        <Button
                            className={styles.button}
                            onClick={() => setShowLogin(true)}
                        >
                            Войти
                        </Button>
                        <Button
                            className={styles.button}
                            onClick={() => setShowRegister(true)}
                        >
                            Регистрация
                        </Button>
                    </div>
                )}
            </div>

            {showLogin && (
                <div className={styles.modalOverlay} onClick={closeModals}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <h3 style={{ margin: '0 0 15px 0' }}>Вход в аккаунт</h3>
                        <form onSubmit={handleLoginSubmit}>
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
                            />
                            <div style={{ display: 'flex', gap: '8px', marginTop: '15px' }}>
                                <Button className={styles.button} onClick={handleLoginClick}>
                                    Войти
                                </Button>
                                <Button 
                                    className={styles.button}
                                    onClick={closeModals}
                                >
                                    Отмена
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showRegister && (
                <div className={styles.modalOverlay} onClick={closeModals}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <h3 style={{ margin: '0 0 15px 0' }}>Регистрация</h3>
                        <form onSubmit={handleRegisterSubmit}>
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
                            />
                            <div style={{ display: 'flex', gap: '8px', marginTop: '15px' }}>
                                <Button className={styles.button} onClick={handleRegisterClick}>
                                    Зарегистрироваться
                                </Button>
                                <Button 
                                    className={styles.button}
                                    onClick={closeModals}
                                >
                                    Отмена
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className={styles.section}>
                <h3 className={styles.text}>История</h3>
                <div style={{ display: 'flex', gap: '8px', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', gap: '4px' }}>
                        <Button
                            className={styles.button}
                            onClick={handleUndo}
                            disabled={!historyManager.canUndo()}
                        >
                            Отменить
                        </Button>
                        <Button
                            className={styles.button}
                            onClick={handleRedo}
                            disabled={!historyManager.canRedo()}
                        >
                            Повторить
                        </Button>
                    </div>
                </div>
            </div>

            <div className={styles.section}>
                <h3 className={styles.text}>Объекты</h3>
                <Button
                    className={styles.button}
                    onClick={handleRemoveObject}
                    disabled={selectedObjects.length === 0}
                >
                    Удалить объект
                </Button>
                <div style={{ marginTop: '10px' }}>
                    <label style={{ fontSize: '12px', display: 'block', marginBottom: '5px' }}>
                        Цвет фона:
                    </label>
                    <input
                        type="color"
                        onChange={handleColorChange}
                        disabled={!selectedSlideId}
                        style={{ width: '100%' }}
                    />
                </div>
            </div>
        </div>
    )
}