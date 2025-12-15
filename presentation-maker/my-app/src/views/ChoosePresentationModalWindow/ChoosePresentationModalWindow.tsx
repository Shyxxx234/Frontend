import { useEffect, useState, useCallback } from "react"
import { getUserPresentations, loadPresentation, createEmptyPresentation } from "../../database/database"
import { useDispatch, useSelector } from 'react-redux'
import { restoreObjects } from '../../store/slideObjectSlice'
import styles from "./ChoosePresentationModalWindow.module.css"
import { restorePresentation } from "../../store/presentationSlice"
import { restoreSlides } from "../../store/slideSlice"
import type { RootState } from "../../store/store"

type ChoosePresentationModalWindowProps = {
    onClose: () => void
}

type Presentation = {
    id: string
    $id?: string
    title: string
    lastModified?: string
}

export function ChoosePresentationModalWindow({ onClose }: ChoosePresentationModalWindowProps) {
    const dispatch = useDispatch()
    const [presentations, setPresentations] = useState<Presentation[]>([])
    const [loading, setLoading] = useState(true)
    const [creating, setCreating] = useState(false)
    const slides = useSelector((state: RootState) => state.slides.slides)

    const handleEscape = useCallback((event: KeyboardEvent) => {
        if ((event.key === 'Escape') && (slides.length != 0)) {
            onClose()
        }
    }, [onClose, slides.length])

    useEffect(() => {
        document.addEventListener('keydown', handleEscape)
        return () => {
            document.removeEventListener('keydown', handleEscape)
        }
    }, [handleEscape])

    useEffect(() => {
        async function loadPresentations() {
            try {
                setLoading(true)
                const userPresentations = await getUserPresentations()

                const formattedPresentations: Presentation[] = userPresentations.map((row) => {
                    const baseObj = {
                        id: row.$id || row.id || '',
                        title: typeof row.title === 'string' ? row.title : 'Без названия',
                        lastModified: row.$updatedAt,
                    }

                    const rest = row
                    return {
                        ...baseObj,
                        ...rest
                    }
                })

                setPresentations(formattedPresentations)
            } finally {
                setLoading(false)
            }
        }

        loadPresentations()
    }, [])

    const handleSelectPresentation = async (presentation: Presentation) => {
        try {
            setLoading(true)
            const presentationId = presentation.id || ''

            const presentationData = await loadPresentation(presentationId)

            if (presentationData) {
                dispatch(restorePresentation(presentationData.presentation))
                dispatch(restoreSlides(presentationData.slides))
                dispatch(restoreObjects(presentationData.slideObjects))

                console.log("Presentation loaded successfully:", presentation.title)
                onClose()
            }
        } finally {
            setLoading(false)
        }
    }

    const handleCloseModal = () => {
        onClose()
    }

    const handleNewPresentation = async () => {
        try {
            setCreating(true)
            const result = await createEmptyPresentation()
            const newPresentationId = (result)?.$id

            if (newPresentationId) {
                const presentationData = await loadPresentation(newPresentationId)

                if (presentationData) {
                    dispatch(restorePresentation(presentationData.presentation))
                    dispatch(restoreSlides(presentationData.slides))
                    dispatch(restoreObjects(presentationData.slideObjects))
                }
            }
            onClose()
        } finally {
            setCreating(false)
        }

    }

    const formatDate = (dateString?: string) => {
        if (!dateString) return "Дата неизвестна"
        try {
            return new Date(dateString).toLocaleDateString("ru-RU", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit"
            })
        } catch {
            return "Дата неизвестна"
        }
    }

    const getPresentationId = (pres: Presentation) => {
        return pres.id || ''
    }

    const getPresentationTitle = (pres: Presentation) => {
        return typeof pres.title === 'string' ? pres.title : 'Без названия'
    }

    return (
        <div className={styles.modal_container}>
            <div className={styles.modal} onClick={handleCloseModal}>
                <div
                    className={styles.modalContent}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className={styles.header}>
                        <h2 className={styles.title}>Выберите презентацию</h2>
                        <div className={styles.subtitle}>Загрузите сохраненную презентацию</div>
                    </div>

                    <div className={styles.content}>
                        {loading ? (
                            <div className={styles.loadingContainer}>
                                <div className={styles.spinner}></div>
                                <p className={styles.loadingText}>Загрузка презентаций...</p>
                            </div>
                        ) : presentations.length === 0 ? (
                            <div className={styles.emptyContainer}>
                                <p className={styles.emptyMessage}>У вас нет сохраненных презентаций</p>
                                <p className={styles.emptySubtext}>Создайте новую презентацию для начала работы</p>
                            </div>
                        ) : (
                            <div className={styles.presentationsGrid}>
                                {presentations.map(presentation => (
                                    <div
                                        key={getPresentationId(presentation)}
                                        className={styles.presentationCard}
                                        onClick={() => handleSelectPresentation(presentation)}
                                    >
                                        <div className={styles.presentationIcon}>

                                        </div>
                                        <div className={styles.presentationInfo}>
                                            <h3 className={styles.presentationTitle}>
                                                {getPresentationTitle(presentation)}
                                            </h3>
                                            <div className={styles.presentationMeta}>
                                                <span className={styles.presentationDate}>
                                                    {formatDate(presentation.lastModified)}
                                                </span>
                                            </div>
                                        </div>
                                        <button
                                            className={styles.selectButton}
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                handleSelectPresentation(presentation)
                                            }}
                                        >
                                            Выбрать
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className={styles.footer}>
                        <button
                            className={styles.cancelButton}
                            onClick={handleCloseModal}
                            disabled={slides.length == 0}
                        >
                            Отмена
                        </button>
                        <button
                            className={styles.newButton}
                            onClick={handleNewPresentation}
                            disabled={creating}
                        >
                            {creating ? 'Создание...' : 'Создать новую презентацию'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}