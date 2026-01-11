import { useState, useRef, useEffect } from 'react'
import styles from './SlideNotesPanel.module.css'

interface SlideNotesPanelProps {
    slideIndex: number
    currentNotes: string
    isExpanded: boolean
    onToggle: () => void
    onSaveNotes: (notes: string) => void
    onClearNotes: () => void
}

export function SlideNotesPanel({
    slideIndex,
    currentNotes,
    isExpanded,
    onToggle,
    onSaveNotes,
    onClearNotes
}: SlideNotesPanelProps) {
    const [notesInput, setNotesInput] = useState<string>(currentNotes)
    const [isEditing, setIsEditing] = useState<boolean>(false)
    const notesTextareaRef = useRef<HTMLTextAreaElement>(null)
    const notesPreviewRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        setNotesInput(currentNotes)
    }, [currentNotes, slideIndex])

    const handleSave = () => {
        onSaveNotes(notesInput)
        setIsEditing(false)
    }

    const handleClear = () => {
        setNotesInput('')
        onClearNotes()
        setIsEditing(false)
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.ctrlKey && e.key === 's') {
            e.preventDefault()
            handleSave()
        }
        if (e.key === 'Escape') {
            setIsEditing(false)
            setNotesInput(currentNotes)
        }
    }

    const handleDoubleClick = () => {
        setIsEditing(true)
        setTimeout(() => {
            notesTextareaRef.current?.focus()
            if (notesTextareaRef.current) {
                notesTextareaRef.current.selectionStart = notesInput.length
                notesTextareaRef.current.selectionEnd = notesInput.length
            }
        }, 0)
    }

    useEffect(() => {
        if (notesPreviewRef.current && !isEditing && currentNotes) {
            notesPreviewRef.current.scrollTop = 0
        }
    }, [isEditing, currentNotes])

    return (
        <div className={`${styles.notesPanel} ${isExpanded ? styles.notesExpanded : ''}`}>
            <div className={styles.notesHeader} onClick={onToggle}>
                <span className={styles.notesTitle}>
                     Заметки к слайду {slideIndex + 1}
                </span>
            </div>
            
            {isExpanded && (
                <div className={styles.notesContent}>
                    {isEditing ? (
                        <>
                            <textarea
                                ref={notesTextareaRef}
                                className={styles.notesTextarea}
                                value={notesInput}
                                onChange={(e) => setNotesInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Введите заметки к слайду..."
                                autoFocus
                            />
                            <div className={styles.notesButtons}>
                                <button
                                    className={`${styles.notesButton} ${styles.notesButtonPrimary}`}
                                    onClick={handleSave}
                                    title="Сохранить заметки (Ctrl+S)"
                                >
                                    Сохранить
                                </button>
                                <button
                                    className={styles.notesButton}
                                    onClick={() => {
                                        setIsEditing(false)
                                        setNotesInput(currentNotes)
                                    }}
                                    title="Отменить изменения (Esc)"
                                >
                                    Отмена
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className={styles.notesPreviewContainer}>
                                <div 
                                    ref={notesPreviewRef}
                                    className={styles.notesPreview}
                                    onDoubleClick={handleDoubleClick}
                                    title="Двойной клик для редактирования"
                                >
                                    {currentNotes ? (
                                        <div className={styles.notesPreviewText}>
                                            {currentNotes}
                                        </div>
                                    ) : (
                                        <span className={styles.noNotes}>
                                            Нет заметок для этого слайда. 
                                            <br />
                                            <small>Двойной клик, чтобы добавить заметки</small>
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className={styles.notesPreviewActions}>
                                <button
                                    className={styles.notesButton}
                                    onClick={() => setIsEditing(true)}
                                >
                                    Редактировать
                                </button>
                                {currentNotes && (
                                    <button
                                        className={`${styles.notesButton} ${styles.notesButtonDanger}`}
                                        onClick={handleClear}
                                    >
                                        Очистить
                                    </button>
                                )}
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    )
}