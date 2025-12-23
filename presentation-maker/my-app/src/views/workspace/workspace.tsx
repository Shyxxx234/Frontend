import { ShowSlide } from "../../common/ShowSlide"
import styles from "./workspace.module.css"
import { useState, useRef, useEffect } from "react"
import { useSelector, useDispatch } from 'react-redux'
import {
    addTextObject,
    addImageObject,
    changePlainTextFontFamily,
    changePlainTextScale,
    changePlainTextWeight,
    changePlainTextColor,
} from '../../store/slideObjectSlice'
import { uploadImage, uploadImageFromUrl } from "../../database/storage"
import type { RootState } from "../../store/store"
import { selectSlide } from "../../store/presentationSlice"
import type { PlainText } from '../../store/types'

type ModalState = 'none' | 'source' | 'url'

const FONT_FAMILIES = [
        'Arial',
        'Georgia',
        'Times New Roman',
        'Verdana',
        'Tahoma',
        'Courier New',
        'Trebuchet MS',
        'Comic Sans MS'
    ]

    const FONT_WEIGHTS = [
        { label: 'Обычный', value: 400 },
        { label: 'Жирный', value: 800 }
    ]
const SCALE_TO_PX = 16 
const MIN_FONT_SIZE_PX = 8
const MAX_FONT_SIZE_PX = 144

export function Workspace() {
    const dispatch = useDispatch()
    const presentation = useSelector((state: RootState) => state.presentation)
    const slides = useSelector((state: RootState) => state.slides.slides)
    const slideObjects = useSelector((state: RootState) => state.slideObjects.objects)

    const selectedSlideId = presentation.selectedSlide
    const selectedObjects = presentation.selectedObjects

    const slideIndex = slides.findIndex(slide => slide.id === selectedSlideId)
    const slide = slides[slideIndex]

    const [contextMenu, setContextMenu] = useState<{ x: number, y: number } | null>(null)
    const [textContextMenu, setTextContextMenu] = useState<{
        x: number;
        y: number;
        objectId: string;
        currentScale: number;
    } | null>(null)
    const [imageUrlInput, setImageUrlInput] = useState<string>("")
    const [modalState, setModalState] = useState<ModalState>('none')
    const [isUploading, setIsUploading] = useState(false)
    const [uploadError, setUploadError] = useState<string | null>(null)
    const [fontSizeInput, setFontSizeInput] = useState<string>("")
    const [showColorPicker, setShowColorPicker] = useState(false)
    const [customColor, setCustomColor] = useState("#000000")

    const fileInputRef = useRef<HTMLInputElement>(null)
    const workspaceRef = useRef<HTMLDivElement>(null)
    const fontSizeInputRef = useRef<HTMLInputElement>(null)
    const colorPickerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (slides.length > 0 && !selectedSlideId) {
            dispatch(selectSlide(slides[0].id))
        }
    }, [slides, selectedSlideId, dispatch])

    useEffect(() => {
        if (textContextMenu) {
            const slideObjectsList = slideObjects[selectedSlideId!] || []
            const textObject = slideObjectsList.find(obj =>
                obj.id === textContextMenu.objectId && obj.type === 'plain_text'
            )

            if (textObject && textObject.type === 'plain_text') {
                // Конвертируем scale в пиксели для отображения
                const plainTextObject = textObject as PlainText
                const fontSizePx = scaleToPx(plainTextObject.scale)
                setFontSizeInput(fontSizePx.toString())
            }
        }
    }, [textContextMenu, selectedSlideId, slideObjects])

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (colorPickerRef.current && 
                !colorPickerRef.current.contains(event.target as Node)) {
                setShowColorPicker(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [])

    const scaleToPx = (scale: number): number => {
        return Math.round(scale * SCALE_TO_PX)
    }

    const pxToScale = (px: number): number => {
        return Math.round((px / SCALE_TO_PX) * 10) / 10
    }

    const handleContextMenu = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()

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

    const handleTextObjectContextMenu = (e: React.MouseEvent, objectId: string) => {
        e.preventDefault()
        e.stopPropagation()

        const rect = workspaceRef.current?.getBoundingClientRect()
        if (!rect) return

        const slideObjectsList = slideObjects[selectedSlideId!] || []
        const textObject = slideObjectsList.find(obj =>
            obj.id === objectId && obj.type === 'plain_text'
        )

        if (textObject && textObject.type === 'plain_text') {
            const plainTextObject = textObject as PlainText
            setTextContextMenu({
                x: e.clientX - rect.left,
                y: e.clientY - rect.top,
                objectId,
                currentScale: plainTextObject.scale
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
            try {
                new URL(imageUrlInput.trim())
                setIsUploading(true)
                setUploadError(null)

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

    const handleCloseTextContextMenu = () => {
        setTextContextMenu(null)
        setFontSizeInput("")
        setShowColorPicker(false)
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

    // Получение текущего текстового объекта для подсветки активных опций
    const getCurrentTextObject = (): PlainText | null => {
        if (!textContextMenu || !selectedSlideId) return null
        const slideObjectsList = slideObjects[selectedSlideId] || []
        const obj = slideObjectsList.find(obj =>
            obj.id === textContextMenu.objectId && obj.type === 'plain_text'
        )
        return obj as PlainText || null
    }

    // Обработчики для форматирования текста
    const handleFontFamilyChange = (fontFamily: string) => {
        if (textContextMenu && selectedSlideId) {
            dispatch(changePlainTextFontFamily({
                fontFamily,
                objectId: textContextMenu.objectId,
                slideId: selectedSlideId
            }))
        }
    }

    const handleFontSizeChange = () => {
        if (textContextMenu && selectedSlideId && fontSizeInput) {
            const fontSizePx = parseInt(fontSizeInput)
            if (!isNaN(fontSizePx) && fontSizePx >= MIN_FONT_SIZE_PX && fontSizePx <= MAX_FONT_SIZE_PX) {
                const newScale = pxToScale(fontSizePx)
                dispatch(changePlainTextScale({
                    scale: newScale,
                    objectId: textContextMenu.objectId,
                    slideId: selectedSlideId
                }))
                setTextContextMenu(prev => prev ? {
                    ...prev,
                    currentScale: newScale
                } : null)
            }
        }
    }

    const handleFontWeightChange = (weight: number) => {
        if (textContextMenu && selectedSlideId) {
            dispatch(changePlainTextWeight({
                weight,
                objectId: textContextMenu.objectId,
                slideId: selectedSlideId
            }))
        }
    }

    const handleColorChange = (color: string) => {
        if (textContextMenu && selectedSlideId) {
            dispatch(changePlainTextColor({
                color,
                objectId: textContextMenu.objectId,
                slideId: selectedSlideId
            }))
        }
    }

    const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const color = e.target.value
        setCustomColor(color)
        handleColorChange(color)
    }

    const handleFontSizeInputKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleFontSizeChange()
        } else if (e.key === 'Escape') {
            handleCloseTextContextMenu()
        }
    }

    const handleFontSizeInputBlur = () => {
        handleFontSizeChange()
    }

    const currentSlideWithObjects = getSlideWithObjects()
    const currentTextObject = getCurrentTextObject()


    return (
        <div className={styles.workspaceContainer}>
            <div className={styles.workspaceNavigation}>
                <button
                    className={styles.navButton}
                    onClick={() => {
                        if (slideIndex > 0) {
                            const prevSlide = slides[slideIndex - 1]
                            dispatch(selectSlide(prevSlide.id))
                        }
                    }}
                    disabled={slideIndex <= 0}
                >
                    ◀ Предыдущий
                </button>
                <div className={styles.slideInfo}>
                    Слайд {slideIndex + 1} из {slides.length}
                </div>
                <button
                    className={styles.navButton}
                    onClick={() => {
                        if (slideIndex < slides.length - 1) {
                            const nextSlide = slides[slideIndex + 1]
                            dispatch(selectSlide(nextSlide.id))
                        }
                    }}
                    disabled={slideIndex >= slides.length - 1}
                >
                    Следующий ▶
                </button>
            </div>

            <div
                className={styles.workspace}
                onContextMenu={handleContextMenu}
                onClick={() => {
                    handleCloseContextMenu()
                    handleCloseTextContextMenu()
                }}
                ref={workspaceRef}
            >
                {currentSlideWithObjects ? (
                    <>
                        <ShowSlide
                            slide={currentSlideWithObjects}
                            className={`${styles.slide} ${textContextMenu ? styles.slideDisabled : ''}`}
                            disableObjectClicks={false}
                            slideId={currentSlideWithObjects.id}
                            objSelection={selectedObjects}
                            onTextObjectContextMenu={handleTextObjectContextMenu}
                        />

                        {contextMenu && (
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

                        {textContextMenu && (
                            <div
                                className={styles.textContextMenu}
                                style={{
                                    left: textContextMenu.x,
                                    top: textContextMenu.y
                                }}
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className={styles.textMenuSection}>
                                    <label className={styles.textMenuLabel}>Размер шрифта:</label>
                                    <div className={styles.sizeControl}>
                                        <div className={styles.sizeInputContainer}>
                                            <input
                                                ref={fontSizeInputRef}
                                                type="number"
                                                className={styles.sizeInput}
                                                value={fontSizeInput}
                                                onChange={(e) => setFontSizeInput(e.target.value)}
                                                onKeyDown={handleFontSizeInputKeyDown}
                                                onBlur={handleFontSizeInputBlur}
                                                min={MIN_FONT_SIZE_PX}
                                                max={MAX_FONT_SIZE_PX}
                                                placeholder="Размер"
                                            />
                                            <span className={styles.sizeUnit}></span>
                                        </div>
                                    </div>

                                </div>

                                <div className={styles.textMenuSection}>
                                    <label className={styles.textMenuLabel}>Шрифт:</label>
                                    <select
                                        className={styles.fontSelect}
                                        value={currentTextObject?.fontFamily || 'Arial'}
                                        onChange={(e) => handleFontFamilyChange(e.target.value)}
                                        onMouseDown={(e) => e.stopPropagation()}
                                    >
                                        {FONT_FAMILIES.map(font => (
                                            <option key={font} value={font}>{font}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className={styles.textMenuSection}>
                                    <label className={styles.textMenuLabel}>Начертание:</label>
                                    <div className={styles.weightOptions}>
                                        {FONT_WEIGHTS.map(({ label, value }) => (
                                            <button
                                                key={value}
                                                className={`${styles.weightOption} ${currentTextObject?.weight === value ? styles.active : ''
                                                    }`}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleFontWeightChange(value);
                                                }}
                                            >
                                                {label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className={styles.textMenuSection}>
                                    <label className={styles.textMenuLabel}>Цвет:</label>
                                    <div className={styles.colorPickerContainer} ref={colorPickerRef}>
                                        <div className={styles.colorOptions}>
                                            <button
                                                className={styles.customColorButton}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setShowColorPicker(!showColorPicker);
                                                }}
                                                title="Выбрать свой цвет"
                                            >
                                                🎨
                                            </button>
                                        </div>

                                        {showColorPicker && (
                                            <div className={styles.colorPickerPopup} onClick={(e) => e.stopPropagation()}>
                                                <input
                                                    type="color"
                                                    value={currentTextObject?.color || customColor}
                                                    onChange={handleCustomColorChange}
                                                    className={styles.colorPickerInput}
                                                />
                                                <input
                                                    type="text"
                                                    value={currentTextObject?.color || customColor}
                                                    onChange={(e) => {
                                                        const newColor = e.target.value
                                                        setCustomColor(newColor)
                                                       if (/^#[0-9A-F]{6}$/i.test(newColor)) {
                                                            handleColorChange(newColor)
                                                        }
                                                    }}
                                                    className={styles.colorTextInput}
                                                    placeholder="#000000"
                                                />
                                                <button
                                                    className={styles.closeColorPicker}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setShowColorPicker(false);
                                                    }}
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <button
                                    className={styles.closeMenuButton}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleCloseTextContextMenu();
                                    }}
                                >
                                    Закрыть
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

                        {modalState === 'source' && (
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

//TODO: Разнести файл и отладить загрузку картинки по URL