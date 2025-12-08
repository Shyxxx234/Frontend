import { ShowSlide } from "../../common/ShowSlide"
import styles from "./workspace.module.css"
import { useState, useRef, useEffect } from "react"
import { useSelector, useDispatch } from 'react-redux'
import { addTextObject, addImageObject } from '../../store/slideObjectSlice'
import { uploadImage, uploadImageFromUrl } from "../../database/storage"
import type { RootState } from "../../store/store"
import { selectSlide } from "../../store/presentationSlice"

type WorkspaceProps = {
    isSlideShow?: boolean,
    onExitSlideShow?: () => void
}

type ModalState = 'none' | 'source' | 'url'

export function Workspace(props: WorkspaceProps) {
    const dispatch = useDispatch()
    const presentation = useSelector((state: RootState) => state.presentation)
    const slides = useSelector((state: RootState) => state.slides.slides)
    const slideObjects = useSelector((state: RootState) => state.slideObjects.objects)

    const selectedSlideId = presentation.selectedSlide
    const selectedObjects = presentation.selectedObjects

    const slideIndex = slides.findIndex(slide => slide.id === selectedSlideId)
    const slide = slides[slideIndex]

    const [contextMenu, setContextMenu] = useState<{ x: number, y: number } | null>(null)
    const [imageUrlInput, setImageUrlInput] = useState<string>("")
    const [modalState, setModalState] = useState<ModalState>('none')
    const [isUploading, setIsUploading] = useState(false)
    const [uploadError, setUploadError] = useState<string | null>(null)

    const fileInputRef = useRef<HTMLInputElement>(null)
    const workspaceRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (props.isSlideShow) {
            const handleContextMenu = (e: MouseEvent) => {
                e.preventDefault()
            }
            document.addEventListener('contextmenu', handleContextMenu)
            return () => document.removeEventListener('contextmenu', handleContextMenu)
        }
    }, [props.isSlideShow])

    useEffect(() => {
        if (slides.length > 0 && !selectedSlideId) {
            dispatch(selectSlide(slides[0].id))
        }
    }, [slides, selectedSlideId, dispatch])

    const goToPreviousSlide = () => {
        if (slideIndex > 0) {
            const prevSlide = slides[slideIndex - 1]
            dispatch(selectSlide(prevSlide.id))
        }
    }

    const goToNextSlide = () => {
        if (slideIndex < slides.length - 1) {
            const nextSlide = slides[slideIndex + 1]
            dispatch(selectSlide(nextSlide.id))
        }
    }

    const handleContextMenu = (e: React.MouseEvent) => {
        if (props.isSlideShow) return
        e.preventDefault()

        if (!selectedSlideId) {
            return
        }

        const rect = workspaceRef.current?.getBoundingClientRect()
        if (rect) {
            setContextMenu({
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            })
        }
    }

    const handleAddText = () => {
        if (selectedSlideId) {
            console.log('Adding text to slide:', selectedSlideId)
            dispatch(addTextObject({ slideId: selectedSlideId }))
            setContextMenu(null)
        }
    }

    const handleAddImageClick = () => {
        setModalState('source')
        setContextMenu(null)
    }

    const handleSelectImageSource = (source: 'url' | 'device') => {
        setUploadError(null)
        if (source === 'device') {
            setModalState('none')
            setTimeout(() => {
                if (fileInputRef.current) {
                    fileInputRef.current.click()
                }
            }, 0)
        } else {
            setModalState('url')
        }
    }

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        console.log('File selected:', file)

        if (file && selectedSlideId) {
            if (!file.type.startsWith('image/')) {
                setUploadError('Пожалуйста, выберите файл изображения')
                return
            }

            setIsUploading(true)
            setUploadError(null)

            try {
                console.log('Uploading image to storage...')
                const imageUrl = await uploadImage(file)
                console.log('Image uploaded to storage, URL:', imageUrl)

                dispatch(addImageObject({
                    slideId: selectedSlideId,
                    imageUrl
                }))

                setModalState('none')

            } catch (error) {
                console.error('Error uploading image:', error)
                setUploadError('Ошибка при загрузке изображения')
            } finally {
                setIsUploading(false)
                e.target.value = ''
            }
        }
    }

    const handleAddImageFromUrl = async () => {
        if (selectedSlideId && imageUrlInput.trim()) {
            new URL(imageUrlInput.trim())
            setIsUploading(true)
            setUploadError(null)
            try {
                const imageUrl = await uploadImageFromUrl(imageUrlInput.trim())
                dispatch(addImageObject({
                    slideId: selectedSlideId,
                    imageUrl
                }))

                setModalState('none')
            } finally {
                setIsUploading(false)
            }
        }
    }

    const handleCloseContextMenu = () => {
        setContextMenu(null)
    }

    const handleCloseModal = () => {
        setModalState('none')
        setImageUrlInput("")
        setUploadError(null)
        setIsUploading(false)
    }

    const getSlideWithObjects = () => {
        if (!slide) return null

        return {
            ...slide,
            slideObject: slideObjects[slide.id] || []
        }
    }

    const currentSlideWithObjects = getSlideWithObjects()

    return (
        <div className={styles.workspaceContainer}>
            {!props.isSlideShow && (
                <div className={styles.workspaceNavigation}>
                    <button
                        className={styles.navButton}
                        onClick={goToPreviousSlide}
                        disabled={slideIndex <= 0}
                    >
                        ◀ Предыдущий
                    </button>
                    <div className={styles.slideInfo}>
                        Слайд {slideIndex + 1} из {slides.length}
                    </div>
                    <button
                        className={styles.navButton}
                        onClick={goToNextSlide}
                        disabled={slideIndex >= slides.length - 1}
                    >
                        Следующий ▶
                    </button>
                </div>
            )}

            <div
                className={`${styles.workspace} ${props.isSlideShow ? styles.slideShowMode : ''}`}
                onContextMenu={handleContextMenu}
                onClick={handleCloseContextMenu}
                ref={workspaceRef}
            >
                {currentSlideWithObjects ? (
                    <>
                        <ShowSlide
                            slide={currentSlideWithObjects}
                            className={styles.slide}
                            disableObjectClicks={props.isSlideShow || false}
                            slideId={currentSlideWithObjects.id}
                            objSelection={selectedObjects}
                        />

                        {!props.isSlideShow && contextMenu && (
                            <div
                                className={styles.contextMenu}
                                style={{
                                    left: contextMenu.x,
                                    top: contextMenu.y
                                }}
                                onClick={(e) => e.stopPropagation()}
                            >
                                <button
                                    className={styles.contextMenuItem}
                                    onClick={handleAddText}
                                >
                                    Вставить текст
                                </button>
                                <button
                                    className={styles.contextMenuItem}
                                    onClick={handleAddImageClick}
                                >
                                    Вставить изображение
                                </button>
                            </div>
                        )}

                        <input
                            type="file"
                            ref={fileInputRef}
                            style={{ display: 'none' }}
                            accept="image/*"
                            onChange={handleFileSelect}
                        />

                        {!props.isSlideShow && modalState === 'source' && (
                            <div className={styles.modalOverlay} onClick={handleCloseModal}>
                                <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                                    <h3>Выберите источник изображения</h3>
                                    <div className={styles.sourceButtons}>
                                        <button
                                            className={styles.sourceButton}
                                            onClick={() => handleSelectImageSource('url')}
                                            disabled={isUploading}
                                        >
                                            Из URL
                                        </button>
                                        <button
                                            className={styles.sourceButton}
                                            onClick={() => handleSelectImageSource('device')}
                                            disabled={isUploading}
                                        >
                                            С устройства
                                        </button>
                                    </div>
                                    {isUploading && (
                                        <div className={styles.uploadingMessage}>
                                            Загрузка изображения...
                                        </div>
                                    )}
                                    <div className={styles.modalButtons}>
                                        <button
                                            className={styles.modalButton}
                                            onClick={handleCloseModal}
                                            disabled={isUploading}
                                        >
                                            Отмена
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {!props.isSlideShow && modalState === 'url' && (
                            <div className={styles.modalOverlay} onClick={handleCloseModal}>
                                <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                                    <h3>Добавить изображение из URL</h3>
                                    <input
                                        type="text"
                                        className={styles.urlInput}
                                        placeholder="Введите URL изображения"
                                        value={imageUrlInput}
                                        onChange={(e) => setImageUrlInput(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') handleAddImageFromUrl()
                                        }}
                                        autoFocus
                                        disabled={isUploading}
                                    />
                                    {uploadError && (
                                        <div className={styles.errorMessage}>
                                            {uploadError}
                                        </div>
                                    )}
                                    {isUploading && (
                                        <div className={styles.uploadingMessage}>
                                            Загрузка изображения...
                                        </div>
                                    )}
                                    <div className={styles.modalButtons}>
                                        <button
                                            className={styles.modalButton}
                                            onClick={handleAddImageFromUrl}
                                            disabled={!imageUrlInput.trim() || isUploading}
                                        >
                                            {isUploading ? 'Загрузка...' : 'Добавить'}
                                        </button>
                                        <button
                                            className={styles.modalButton}
                                            onClick={handleCloseModal}
                                            disabled={isUploading}
                                        >
                                            Отмена
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    <div className={styles.noSlide}>
                        {slides.length === 0 ? "Нет слайдов" : "Выберите слайд"}
                    </div>
                )}
            </div>
        </div>
    )
}