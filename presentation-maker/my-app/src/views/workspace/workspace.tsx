import { ShowSlide } from "../../common/ShowSlide"
import type { Slide } from "../../store/typeAndFunctions"
import { dispatch } from "../../presentation"
import { selectSlide, addTextObject, addImageObject } from "../../store/typeAndFunctions"
import styles from "./workspace.module.css"
import { useState, useRef } from "react"

type WorkspaceProps = {
    slides: Array<Slide>,
    slideIndex: number,
    selectedObjects: Array<string>,
    selectedSlideId: string
}

type ModalState = 'none' | 'source' | 'url' | 'device'

export function Workspace(props: WorkspaceProps) {
    const slide = props.slides[props.slideIndex]
    const [contextMenu, setContextMenu] = useState<{x: number, y: number} | null>(null)
    const [imageUrlInput, setImageUrlInput] = useState<string>("")
    const [modalState, setModalState] = useState<ModalState>('none')
    const fileInputRef = useRef<HTMLInputElement>(null)
    const workspaceRef = useRef<HTMLDivElement>(null)

    const goToPreviousSlide = () => {
        if (props.slideIndex > 0) {
            const prevSlide = props.slides[props.slideIndex - 1]
            dispatch(selectSlide, [prevSlide.id])
        }
    }

    const goToNextSlide = () => {
        if (props.slideIndex < props.slides.length - 1) {
            const nextSlide = props.slides[props.slideIndex + 1]
            dispatch(selectSlide, [nextSlide.id])
        }
    }

    const handleContextMenu = (e: React.MouseEvent) => {
        e.preventDefault()
        if (!props.selectedSlideId) return
        
        const rect = workspaceRef.current?.getBoundingClientRect()
        if (rect) {
            setContextMenu({
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            })
        }
    }

    const handleAddText = () => {
        if (props.selectedSlideId) {
            dispatch(addTextObject, [props.selectedSlideId])
            setContextMenu(null)
        }
    }

    const handleAddImageClick = () => {
        setModalState('source')
        setContextMenu(null)
    }

    const handleSelectImageSource = (source: 'url' | 'device') => {
        if (source === 'device') {
            setModalState('device')
            setTimeout(() => {
                fileInputRef.current?.click()
            }, 100)
        } else {
            setModalState('url')
        }
    }

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file && props.selectedSlideId) {
            if (!file.type.startsWith('image/'))  return

            const imageUrl = URL.createObjectURL(file)
            dispatch(addImageObject, [props.selectedSlideId, imageUrl])
            setModalState('none')
            
            e.target.value = ''
        }
    }

    const handleAddImageFromUrl = () => {
        if (props.selectedSlideId && imageUrlInput.trim()) {
            dispatch(addImageObject, [props.selectedSlideId, imageUrlInput.trim()])
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
            <div className={styles.workspaceNavigation}>
                <button
                    className={styles.navButton}
                    onClick={goToPreviousSlide}
                    disabled={props.slideIndex <= 0}
                >
                    ◀ Предыдущий
                </button>
                <div className={styles.slideInfo}>
                    Слайд {props.slideIndex + 1} из {props.slides.length}
                </div>
                <button
                    className={styles.navButton}
                    onClick={goToNextSlide}
                    disabled={props.slideIndex >= props.slides.length - 1}
                >
                    Следующий ▶
                </button>
            </div>

            <div
                className={styles.workspace}
                onContextMenu={handleContextMenu}
                onClick={handleCloseContextMenu}
                ref={workspaceRef}
            >
                {slide ? (
                    <>
                        <ShowSlide
                            slide={slide}
                            className={styles.slide}
                            disableObjectClicks={false}
                            slideId={slide.id}
                            objSelection={props.selectedObjects}
                        />
                        
                        {contextMenu && (
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

                        {modalState === 'device' && (
                            <input
                                type="file"
                                ref={fileInputRef}
                                style={{ display: 'none' }}
                                accept="image/*"
                                onChange={handleFileSelect}
                            />
                        )}

                        {modalState === 'source' && (
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

                        {modalState === 'url' && (
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