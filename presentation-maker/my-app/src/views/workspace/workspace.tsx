import { ShowSlide } from "../../common/ShowSlide"

import styles from "./workspace.module.css"
import { useState, useRef, useEffect } from "react"
import { useSelector, useDispatch } from 'react-redux'
import type { RootState } from '../../store/store'
import { selectSlide, addTextObject, addImageObject } from '../../store/presentationSlice'

type WorkspaceProps = {
    slideIndex: number,
    isSlideShow?: boolean,
    onExitSlideShow?: () => void
}

type ModalState = 'none' | 'source' | 'url'

export function Workspace(props: WorkspaceProps) {
    const dispatch = useDispatch()
    const presentation = useSelector((state: RootState) => state.presentation)
    const slides = presentation.slides
    const selectedSlideId = presentation.selectedSlide
    const selectedObjects = presentation.selectedObjects
    
    const slide = slides[props.slideIndex]
    const [contextMenu, setContextMenu] = useState<{x: number, y: number} | null>(null)
    const [imageUrlInput, setImageUrlInput] = useState<string>("")
    const [modalState, setModalState] = useState<ModalState>('none')
    const [shouldShowFileInput, setShouldShowFileInput] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const workspaceRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (shouldShowFileInput && fileInputRef.current) {
            fileInputRef.current.click()
            setShouldShowFileInput(false)
        }
    }, [shouldShowFileInput])

    useEffect(() => {
        if (props.isSlideShow) {
            const handleContextMenu = (e: MouseEvent) => {
                e.preventDefault()
            }
            document.addEventListener('contextmenu', handleContextMenu)
            return () => document.removeEventListener('contextmenu', handleContextMenu)
        }
    }, [props.isSlideShow])

    const goToPreviousSlide = () => {
        if (props.slideIndex > 0) {
            const prevSlide = slides[props.slideIndex - 1]
            dispatch(selectSlide(prevSlide.id))
        }
    }

    const goToNextSlide = () => {
        if (props.slideIndex < slides.length - 1) {
            const nextSlide = slides[props.slideIndex + 1]
            dispatch(selectSlide(nextSlide.id))
        }
    }

    const handleContextMenu = (e: React.MouseEvent) => {
        if (props.isSlideShow) return
        e.preventDefault()
        if (!selectedSlideId) return
        
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
            dispatch(addTextObject(selectedSlideId))
            setContextMenu(null)
        }
    }

    const handleAddImageClick = () => {
        setModalState('source')
        setContextMenu(null)
    }

    const handleSelectImageSource = (source: 'url' | 'device') => {
        if (source === 'device') {
            setModalState('none')
            setShouldShowFileInput(true)
        } else {
            setModalState('url')
        }
    }

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file && selectedSlideId) {
            if (!file.type.startsWith('image/')) return

            const imageUrl = URL.createObjectURL(file)
            dispatch(addImageObject({ slideId: selectedSlideId, imageUrl }))
            
            e.target.value = ''
        }
    }

    const handleAddImageFromUrl = () => {
        if (selectedSlideId && imageUrlInput.trim()) {
            dispatch(addImageObject({ slideId: selectedSlideId, imageUrl: imageUrlInput.trim() }))
            setImageUrlInput("")
            setModalState('none')
        }
    }

    const handleCloseContextMenu = () => {
        setContextMenu(null)
    }

    const handleCloseModal = () => {
        setModalState('none')
        setImageUrlInput("")
    }

    return (
        <div className={styles.workspaceContainer}>
            {!props.isSlideShow && (
                <div className={styles.workspaceNavigation}>
                    <button
                        className={styles.navButton}
                        onClick={goToPreviousSlide}
                        disabled={props.slideIndex <= 0}
                    >
                        ◀ Предыдущий
                    </button>
                    <div className={styles.slideInfo}>
                        Слайд {props.slideIndex + 1} из {slides.length}
                    </div>
                    <button
                        className={styles.navButton}
                        onClick={goToNextSlide}
                        disabled={props.slideIndex >= slides.length - 1}
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
                {slide ? (
                    <>
                        <ShowSlide
                            slide={slide}
                            className={styles.slide}
                            disableObjectClicks={props.isSlideShow || false}
                            slideId={slide.id}
                            objSelection={selectedObjects}
                        />
                        
                        {!props.isSlideShow && contextMenu && (
                            <div 
                                className={styles.contextMenu}
                                style={{
                                    left: contextMenu.x,
                                    top: contextMenu.y
                                }}
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

                        {shouldShowFileInput && (
                            <input
                                type="file"
                                ref={fileInputRef}
                                style={{ display: 'none' }}
                                accept="image/*"
                                onChange={handleFileSelect}
                            />
                        )}

                        {!props.isSlideShow && modalState === 'source' && (
                            <div className={styles.modalOverlay} onClick={handleCloseModal}>
                                <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                                    <h3>Выберите источник изображения</h3>
                                    <div className={styles.sourceButtons}>
                                        <button 
                                            className={styles.sourceButton}
                                            onClick={() => handleSelectImageSource('url')}
                                        >
                                            Из URL
                                        </button>
                                        <button 
                                            className={styles.sourceButton}
                                            onClick={() => handleSelectImageSource('device')}
                                        >
                                            С устройства
                                        </button>
                                    </div>
                                    <div className={styles.modalButtons}>
                                        <button 
                                            className={styles.modalButton}
                                            onClick={handleCloseModal}
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
                                    />
                                    <div className={styles.modalButtons}>
                                        <button 
                                            className={styles.modalButton}
                                            onClick={handleAddImageFromUrl}
                                            disabled={!imageUrlInput.trim()}
                                        >
                                            Добавить
                                        </button>
                                        <button 
                                            className={styles.modalButton}
                                            onClick={handleCloseModal}
                                        >
                                            Отмена
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    <div className={styles.noSlide}>Нет слайдов</div>
                )}
            </div>
        </div>
    )
}