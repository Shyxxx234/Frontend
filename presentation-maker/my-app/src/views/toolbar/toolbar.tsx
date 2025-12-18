import { useState, useRef, useEffect } from "react"
import { useNavigate } from 'react-router-dom'
import { Button } from "../../common/Button"
import styles from "./toolbar.module.css"
import { useSelector, useDispatch } from 'react-redux'
import { saveToDB } from '../../database/database'
import type { RootState } from "../../store/store"
import { changePresentationName } from "../../store/presentationSlice"

type ToolbarProps = {
    onStartSpeakerMode: () => void,
    onOpenLoadModal: () => void,
}

export function Toolbar(props: ToolbarProps) {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const presentation = useSelector((state: RootState) => state.presentation)
    const slides = useSelector((state: RootState) => state.slides)
    const slideObjects = useSelector((state: RootState) => state.slideObjects)

    const [isEditing, setIsEditing] = useState(false)
    const [title, setTitle] = useState(presentation.title)
    const [showFileMenu, setShowFileMenu] = useState(false)

    const fileMenuRef = useRef<HTMLDivElement>(null)

    const handleTitleClick = () => {
        setIsEditing(true)
    }

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTitle(e.target.value)
    }

    const handleTitleBlur = () => {
        setIsEditing(false)
        if (title !== presentation.title) {
            dispatch(changePresentationName(title))
        }
    }

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleTitleBlur()
        }
    }

    const handleFileClick = () => {
        setShowFileMenu(!showFileMenu)
    }

    const handleSavePresentation = async () => {
        await saveToDB({
            title: presentation.title || 'Без названия',
            presentation: presentation,
            slides: slides,
            slideObjects: slideObjects,
        }, false)
        setShowFileMenu(false)
    }

    const handleLoadPresentationClick = () => {
        setShowFileMenu(false)
        props.onOpenLoadModal()
    }

    const handleStartSlideShow = () => {
        navigate('/player')
    }

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (fileMenuRef.current && !fileMenuRef.current.contains(event.target as Node)) {
                setShowFileMenu(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [])

    return (
        <div className={styles.toolbar}>
            <div>
                <Button
                    onClick={handleFileClick}
                    className={styles.button}
                >
                    Файл
                </Button>

                {showFileMenu && (
                    <div
                        ref={fileMenuRef}
                        className={styles.file_menu}
                    >
                        <div
                            className={styles.new_presentation}
                            onClick={handleSavePresentation}
                        >
                            Сохранить презентацию
                        </div>
                        <div
                            className={styles.new_presentation}
                            onClick={handleLoadPresentationClick}
                        >
                            Загрузить презентацию
                        </div>
                    </div>
                )}

                <Button
                    onClick={() => console.log("Insert")}
                    className={styles.button}
                >
                    Вставка
                </Button>
            </div>

            {isEditing ? (
                <input
                    type="text"
                    value={title}
                    onChange={handleTitleChange}
                    onBlur={handleTitleBlur}
                    onKeyDown={handleKeyPress}
                    className={styles.title}
                    autoFocus
                />
            ) : (
                <Button
                    onClick={handleTitleClick}
                    className={`${styles.button} ${styles.title}`}
                >
                    {presentation.title || "Название презентации"}
                </Button>
            )}

            <div style={{ display: 'flex', gap: '10px' }}>
                <Button
                    onClick={props.onStartSpeakerMode}
                    className={styles.button}
                >
                    Режим докладчика
                </Button>
                
                <Button
                    onClick={handleStartSlideShow}
                    className={`${styles.button} ${styles.slide_show}`}
                >
                    Слайд-шоу
                </Button>
            </div>
        </div>
    )
}