import { ShowSlide } from "../../common/ShowSlide"
import { SlideNotesPanel } from "../SlideNotesPanel/SlideNotesPanel"
import styles from "./workspace.module.css"
import { useState, useRef, useEffect, useCallback } from "react"
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
import type { PlainText, CodeBlock } from '../../store/types'
import { updateSlideNotes } from '../../store/slideSlice'
import { addCodeBlockObject, updateCodeBlockContent } from '../../store/slideObjectSlice'

type ModalState = 'none' | 'source' | 'url' | 'code'

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

const LANGUAGES = [
    { label: 'TypeScript', value: 'typescript' },
    { label: 'JavaScript', value: 'javascript' },
    { label: 'HTML', value: 'html' },
    { label: 'CSS', value: 'css' },
    { label: 'Python', value: 'python' },
    { label: 'Java', value: 'java' },
    { label: 'C++', value: 'cpp' },
    { label: 'JSON', value: 'json' },
    { label: 'Markdown', value: 'markdown' }
]

const THEMES = [
    { label: 'Темная', value: 'vs-dark' },
    { label: 'Светлая', value: 'vs' },
    { label: 'Высокий контраст', value: 'hc-black' }
]

const SCALE_TO_PX = 16 
const MIN_FONT_SIZE_PX = 8
const MAX_FONT_SIZE_PX = 144
const COLOR_CHANGE_TIMEOUT = 200

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
    const [codeContextMenu, setCodeContextMenu] = useState<{
        x: number;
        y: number;
        objectId: string;
    } | null>(null)
    const [imageUrlInput, setImageUrlInput] = useState<string>("")
    const [modalState, setModalState] = useState<ModalState>('none')
    const [isUploading, setIsUploading] = useState(false)
    const [uploadError, setUploadError] = useState<string | null>(null)
    const [fontSizeInput, setFontSizeInput] = useState<string>("")
    const [showColorPicker, setShowColorPicker] = useState(false)
    const [customColor, setCustomColor] = useState("#000000")
    const [colorInputValue, setColorInputValue] = useState("#000000")
    const [colorTimeoutId, setColorTimeoutId] = useState<ReturnType<typeof setTimeout> | null>(null)
    const [isNotesExpanded, setIsNotesExpanded] = useState<boolean>(false)
    const [codeBlockContent, setCodeBlockContent] = useState<string>("// Введите код\nconsole.log('Hello World');")
    const [selectedLanguage, setSelectedLanguage] = useState<string>('typescript')
    const [codeTheme, setCodeTheme] = useState<string>('vs-dark')
    const [codeFontSize, setCodeFontSize] = useState<number>(14)
    const [showLineNumbers, setShowLineNumbers] = useState<boolean>(true)
    const [isCodeEditorOpen, setIsCodeEditorOpen] = useState<boolean>(false)
    const [editingCodeBlockId, setEditingCodeBlockId] = useState<string | null>(null)

    const fileInputRef = useRef<HTMLInputElement>(null)
    const workspaceRef = useRef<HTMLDivElement>(null)
    const fontSizeInputRef = useRef<HTMLInputElement>(null)
    const colorPickerRef = useRef<HTMLDivElement>(null)
    const codeEditorTextareaRef = useRef<HTMLTextAreaElement>(null)
    const codeEditorModalTextareaRef = useRef<HTMLTextAreaElement>(null)

    useEffect(() => {
        if (slides.length > 0 && !selectedSlideId) {
            dispatch(selectSlide(slides[0].id))
        }
    }, [slides, selectedSlideId, dispatch])

    useEffect(() => {
        if (textContextMenu && selectedSlideId) {
            const slideObjectsList = slideObjects[selectedSlideId] || []
            const textObject = slideObjectsList.find(obj =>
                obj.id === textContextMenu.objectId && obj.type === 'plain_text'
            )

            if (textObject && textObject.type === 'plain_text') {
                const plainTextObject = textObject as PlainText
                const fontSizePx = scaleToPx(plainTextObject.scale)
                setFontSizeInput(fontSizePx.toString())
                setColorInputValue(plainTextObject.color || "#000000")
                setCustomColor(plainTextObject.color || "#000000")
            }
        }
    }, [textContextMenu, selectedSlideId, slideObjects])

    useEffect(() => {
        if (modalState === 'code' && codeEditorTextareaRef.current) {
            codeEditorTextareaRef.current.focus();
        }
    }, [modalState]);

    useEffect(() => {
        if (isCodeEditorOpen && codeEditorModalTextareaRef.current) {
            codeEditorModalTextareaRef.current.focus();
        }
    }, [isCodeEditorOpen]);

    useEffect(() => {
        if (editingCodeBlockId && selectedSlideId) {
            const slideObjectsList = slideObjects[selectedSlideId] || []
            const codeBlock = slideObjectsList.find(obj =>
                obj.id === editingCodeBlockId && obj.type === 'code_block'
            ) as CodeBlock | undefined

            if (codeBlock) {
                setCodeBlockContent(codeBlock.content)
                setSelectedLanguage(codeBlock.language)
                setCodeTheme(codeBlock.theme || 'vs-dark')
                setCodeFontSize(codeBlock.fontSize || 14)
                setShowLineNumbers(codeBlock.showLineNumbers !== false)
            }
        }
    }, [editingCodeBlockId, selectedSlideId, slideObjects])

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
            if (colorTimeoutId) {
                clearTimeout(colorTimeoutId)
            }
        }
    }, [colorTimeoutId])

    const scaleToPx = (scale: number): number => {
        const px = Math.round(scale * SCALE_TO_PX)
        console.log('scaleToPx:', { scale, px })
        return px
    }

    const pxToScale = (px: number): number => {
        const scale = Math.round((px / SCALE_TO_PX) * 100) / 100
        console.log('pxToScale:', { px, scale })
        return scale
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

        const slideObjectsList = slideObjects[selectedSlideId] || []
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
            setCodeContextMenu(null)
        }
    }

    const handleCodeBlockContextMenu = (e: React.MouseEvent, objectId: string) => {
        e.preventDefault();
        e.stopPropagation();
        
        const rect = workspaceRef.current?.getBoundingClientRect();
        if (rect) {
            setCodeContextMenu({
                x: e.clientX - rect.left,
                y: e.clientY - rect.top,
                objectId
            });
            setTextContextMenu(null);
        }
    }

    const handleAddText = () => {
        if (selectedSlideId) {
            dispatch(addTextObject({ slideId: selectedSlideId }))
            setContextMenu(null)
        }
    }

    const handleAddCodeBlock = () => {
        setModalState('code')
        setContextMenu(null)
    }

    const handleAddImageClick = () => {
        setModalState('source')
        setContextMenu(null)
    }

    const handleAddNotesClick = () => {
        setIsNotesExpanded(true)
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

        if (file && selectedSlideId) {
            if (!file.type.startsWith('image/')) {
                setUploadError('Пожалуйста, выберите файл изображения')
                return
            }

            setIsUploading(true)
            setUploadError(null)

            try {
                const imageUrl = await uploadImage(file)
                dispatch(addImageObject({
                    slideId: selectedSlideId,
                    imageUrl
                }))
                setModalState('none')
            } catch {
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
                setImageUrlInput("")
            } catch {
                setUploadError('Неверный URL изображения')
            } finally {
                setIsUploading(false)
            }
        }
    }

    const handleAddCodeBlockToSlide = () => {
        if (selectedSlideId && codeBlockContent.trim()) {
            dispatch(addCodeBlockObject({
                slideId: selectedSlideId,
                language: selectedLanguage,
                content: codeBlockContent,
                rect: {
                    x: 100,
                    y: 100,
                    width: 400,
                    height: 300
                },
                theme: codeTheme,
                fontSize: codeFontSize,
                showLineNumbers: showLineNumbers
            }))
            setModalState('none')
            setCodeBlockContent("// Введите код\nconsole.log('Hello World');")
            setSelectedLanguage('typescript')
            setCodeTheme('vs-dark')
            setCodeFontSize(14)
            setShowLineNumbers(true)
        }
    }

    const handleEditCodeBlock = (objectId: string) => {
        setEditingCodeBlockId(objectId)
        setIsCodeEditorOpen(true)
        setCodeContextMenu(null)
    }

    const handleSaveCodeBlock = () => {
        if (editingCodeBlockId && selectedSlideId) {
            dispatch(updateCodeBlockContent({
                objectId: editingCodeBlockId,
                slideId: selectedSlideId,
                content: codeBlockContent,
                language: selectedLanguage,
                theme: codeTheme,
                fontSize: codeFontSize,
                showLineNumbers: showLineNumbers
            }));
            
            setIsCodeEditorOpen(false);
            setEditingCodeBlockId(null);
            setCodeBlockContent("// Введите код\nconsole.log('Hello World');");
            setSelectedLanguage('typescript');
            setCodeTheme('vs-dark');
            setCodeFontSize(14);
            setShowLineNumbers(true);
        }
    }

    const handleCopyCodeBlock = (objectId: string) => {
        const slideObjectsList = slideObjects[selectedSlideId] || []
        const codeBlock = slideObjectsList.find(obj =>
            obj.id === objectId && obj.type === 'code_block'
        ) as CodeBlock | undefined

        if (codeBlock) {
            navigator.clipboard.writeText(codeBlock.content)
                .then(() => {
                    alert('Код скопирован в буфер обмена!')
                })
                .catch(err => {
                    console.error('Ошибка при копировании:', err)
                })
            setCodeContextMenu(null)
        }
    }

    const handleSaveNotes = (notes: string) => {
        if (selectedSlideId) {
            dispatch(updateSlideNotes({
                slideId: selectedSlideId,
                notes
            }))
        }
    }

    const handleClearNotes = () => {
        if (selectedSlideId) {
            dispatch(updateSlideNotes({
                slideId: selectedSlideId,
                notes: ''
            }))
        }
    }

    const handleCloseContextMenu = () => {
        setContextMenu(null)
    }

    const handleCloseTextContextMenu = () => {
        if (colorTimeoutId) {
            clearTimeout(colorTimeoutId)
            setColorTimeoutId(null)
        }
        setTextContextMenu(null)
        setFontSizeInput("")
        setShowColorPicker(false)
        setColorInputValue("#000000")
        setCustomColor("#000000")
    }

    const handleCloseCodeContextMenu = () => {
        setCodeContextMenu(null)
    }

    const handleCloseModal = () => {
        setModalState('none')
        setImageUrlInput("")
        setUploadError(null)
        setIsUploading(false)
    }

    const handleCloseCodeEditor = () => {
        setIsCodeEditorOpen(false)
        setEditingCodeBlockId(null)
        setCodeBlockContent("// Введите код\nconsole.log('Hello World');")
        setSelectedLanguage('typescript')
        setCodeTheme('vs-dark')
        setCodeFontSize(14)
        setShowLineNumbers(true)
    }

    const getSlideWithObjects = () => {
        if (!slide) return null

        return {
            ...slide,
            slideObject: slideObjects[slide.id] || []
        }
    }

    const getCurrentTextObject = (): PlainText | null => {
        if (!textContextMenu || !selectedSlideId) return null
        const slideObjectsList = slideObjects[selectedSlideId] || []
        const obj = slideObjectsList.find(obj =>
            obj.id === textContextMenu.objectId && obj.type === 'plain_text'
        )
        return obj as PlainText || null
    }

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
                console.log('Изменение размера шрифта:', {
                    fontSizePx,
                    newScale,
                    objectId: textContextMenu.objectId,
                    oldScale: textContextMenu.currentScale
                })
                
                dispatch(changePlainTextScale({
                    scale: newScale,
                    objectId: textContextMenu.objectId,
                    slideId: selectedSlideId
                }))
                
                setTextContextMenu(prev => prev ? {
                    ...prev,
                    currentScale: newScale
                } : null)
                
                setFontSizeInput(fontSizePx.toString())
            } else {
                const currentPx = scaleToPx(textContextMenu.currentScale)
                setFontSizeInput(currentPx.toString())
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

    const applyColorChange = useCallback((color: string) => {
        if (textContextMenu && selectedSlideId) {
            dispatch(changePlainTextColor({
                color,
                objectId: textContextMenu.objectId,
                slideId: selectedSlideId
            }))
        }
    }, [textContextMenu, selectedSlideId, dispatch])

    const handleColorChangeWithTimeout = (color: string) => {
        setCustomColor(color)
        setColorInputValue(color)

        if (colorTimeoutId) {
            clearTimeout(colorTimeoutId)
        }

        const newTimeoutId = setTimeout(() => {
            if (/^#[0-9A-F]{6}$/i.test(color)) {
                applyColorChange(color)
            }
            setColorTimeoutId(null)
        }, COLOR_CHANGE_TIMEOUT)

        setColorTimeoutId(newTimeoutId)
    }

    const handleColorChangeOnBlur = () => {
        if (colorTimeoutId) {
            clearTimeout(colorTimeoutId)
            setColorTimeoutId(null)
            if (/^#[0-9A-F]{6}$/i.test(colorInputValue)) {
                applyColorChange(colorInputValue)
            }
        }
    }

    const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const color = e.target.value
        handleColorChangeWithTimeout(color)
    }

    const handleColorTextInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const color = e.target.value
        handleColorChangeWithTimeout(color)
    }

    const handleFontSizeInputKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault()
            handleFontSizeChange()
            if (fontSizeInputRef.current) {
                fontSizeInputRef.current.blur()
            }
        } else if (e.key === 'Escape') {
            handleCloseTextContextMenu()
        }
    }

    const handleFontSizeInputBlur = () => {
        handleFontSizeChange()
    }

    const handleQuickFontSizeChange = (delta: number) => {
        if (textContextMenu && selectedSlideId) {
            const currentPx = scaleToPx(textContextMenu.currentScale)
            const newPx = Math.max(MIN_FONT_SIZE_PX, Math.min(MAX_FONT_SIZE_PX, currentPx + delta))
            const newScale = pxToScale(newPx)
            
            console.log('Быстрое изменение размера:', {
                delta,
                currentPx,
                newPx,
                newScale
            })
            
            dispatch(changePlainTextScale({
                scale: newScale,
                objectId: textContextMenu.objectId,
                slideId: selectedSlideId
            }))
            
            setTextContextMenu(prev => prev ? {
                ...prev,
                currentScale: newScale
            } : null)
            
            setFontSizeInput(newPx.toString())
        }
    }

    const handleCodeKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Tab') {
            e.preventDefault();
            const textarea = e.currentTarget;
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            
            const newValue = codeBlockContent.substring(0, start) + '  ' + codeBlockContent.substring(end);
            setCodeBlockContent(newValue);
            
            setTimeout(() => {
                textarea.selectionStart = textarea.selectionEnd = start + 2;
            }, 0);
        } else if (e.key === 'Enter' && e.ctrlKey) {
            e.preventDefault();
            if (isCodeEditorOpen) {
                handleSaveCodeBlock();
            } else if (modalState === 'code') {
                handleAddCodeBlockToSlide();
            }
        }
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
                    handleCloseCodeContextMenu()
                }}
                ref={workspaceRef}
            >
                {currentSlideWithObjects ? (
                    <>
                        <ShowSlide
                            slide={currentSlideWithObjects}
                            className={`${styles.slide} ${textContextMenu || codeContextMenu ? styles.slideDisabled : ''}`}
                            disableObjectClicks={false}
                            slideId={currentSlideWithObjects.id}
                            objSelection={selectedObjects}
                            onTextObjectContextMenu={handleTextObjectContextMenu}
                            onCodeBlockContextMenu={handleCodeBlockContextMenu}
                        />

                        <SlideNotesPanel
                            slideIndex={slideIndex}
                            currentNotes={slide?.notes || ''}
                            isExpanded={isNotesExpanded}
                            onToggle={() => setIsNotesExpanded(!isNotesExpanded)}
                            onSaveNotes={handleSaveNotes}
                            onClearNotes={handleClearNotes}
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
                                <button
                                    className={styles.contextMenuItem}
                                    onClick={handleAddCodeBlock}
                                >
                                    Вставить блок кода
                                </button>
                                <button
                                    className={styles.contextMenuItem}
                                    onClick={handleAddNotesClick}
                                >
                                    {slide?.notes ? 'Редактировать заметки' : 'Добавить заметки'}
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
                                        <button 
                                            className={styles.sizeButton}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleQuickFontSizeChange(-2);
                                            }}
                                            title="Уменьшить размер"
                                        >
                                            -
                                        </button>
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
                                            <span className={styles.sizeUnit}>px</span>
                                        </div>
                                        <button 
                                            className={styles.sizeButton}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleQuickFontSizeChange(2);
                                            }}
                                            title="Увеличить размер"
                                        >
                                            +
                                        </button>
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
                                                    value={customColor}
                                                    onChange={handleCustomColorChange}
                                                    className={styles.colorPickerInput}
                                                />
                                                <input
                                                    type="text"
                                                    value={colorInputValue}
                                                    onChange={handleColorTextInputChange}
                                                    onBlur={handleColorChangeOnBlur}
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

                        {/* Контекстное меню для блоков кода */}
                        {codeContextMenu && (
                            <div
                                className={styles.codeContextMenu}
                                style={{
                                    left: codeContextMenu.x,
                                    top: codeContextMenu.y
                                }}
                                onClick={(e) => e.stopPropagation()}
                            >
                                <button
                                    className={styles.codeMenuItem}
                                    onClick={() => handleEditCodeBlock(codeContextMenu.objectId)}
                                >
                                    Редактировать код
                                </button>
                                <button
                                    className={styles.codeMenuItem}
                                    onClick={() => handleCopyCodeBlock(codeContextMenu.objectId)}
                                >
                                    Копировать код
                                </button>
                                <button
                                    className={styles.codeMenuItem}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleCloseCodeContextMenu();
                                    }}
                                >
                                    Закрыть
                                </button>
                            </div>
                        )}

                        {/* Скрытый input для загрузки файлов */}
                        <input
                            type="file"
                            ref={fileInputRef}
                            style={{ display: 'none' }}
                            accept="image/*"
                            onChange={handleFileSelect}
                        />

                        {/* Модальные окна для изображений */}
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

                        {/* Модальное окно для добавления кода */}
                        {modalState === 'code' && (
                            <div className={styles.modalOverlay} onClick={handleCloseModal}>
                                <div className={styles.codeModal} onClick={(e) => e.stopPropagation()}>
                                    <h3>Добавить блок кода</h3>
                                    
                                    <div className={styles.codeModalSection}>
                                        <label className={styles.codeModalLabel}>Язык программирования:</label>
                                        <select
                                            className={styles.languageSelect}
                                            value={selectedLanguage}
                                            onChange={(e) => setSelectedLanguage(e.target.value)}
                                        >
                                            {LANGUAGES.map(lang => (
                                                <option key={lang.value} value={lang.value}>
                                                    {lang.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className={styles.codeModalSection}>
                                        <label className={styles.codeModalLabel}>Тема:</label>
                                        <select
                                            className={styles.themeSelect}
                                            value={codeTheme}
                                            onChange={(e) => setCodeTheme(e.target.value)}
                                        >
                                            {THEMES.map(theme => (
                                                <option key={theme.value} value={theme.value}>
                                                    {theme.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className={styles.codeModalSection}>
                                        <label className={styles.codeModalLabel}>Размер шрифта:</label>
                                        <input
                                            type="number"
                                            className={styles.fontSizeInput}
                                            value={codeFontSize}
                                            onChange={(e) => setCodeFontSize(parseInt(e.target.value) || 14)}
                                            min={8}
                                            max={72}
                                        />
                                    </div>

                                    <div className={styles.codeModalSection}>
                                        <label className={styles.codeModalLabel}>
                                            <input
                                                type="checkbox"
                                                checked={showLineNumbers}
                                                onChange={(e) => setShowLineNumbers(e.target.checked)}
                                            />
                                            Показывать номера строк
                                        </label>
                                    </div>

                                    <div className={styles.codeModalSection}>
                                        <label className={styles.codeModalLabel}>Код:</label>
                                        <div className={styles.codeEditorContainer}>
                                            <textarea
                                                ref={codeEditorTextareaRef}
                                                className={styles.codeTextarea}
                                                value={codeBlockContent}
                                                onChange={(e) => setCodeBlockContent(e.target.value)}
                                                onKeyDown={handleCodeKeyDown}
                                                style={{
                                                    fontFamily: "'Cascadia Code', 'Consolas', 'Monaco', 'Courier New', monospace",
                                                    fontSize: `${codeFontSize}px`,
                                                    backgroundColor: codeTheme === 'vs-dark' ? '#1e1e1e' : 
                                                                   codeTheme === 'hc-black' ? '#000000' : '#ffffff',
                                                    color: codeTheme === 'vs-dark' ? '#d4d4d4' : 
                                                          codeTheme === 'hc-black' ? '#ffffff' : '#000000'
                                                }}
                                                spellCheck="false"
                                            />
                                        </div>
                                    </div>

                                    <div className={styles.modalButtons}>
                                        <button
                                            className={styles.modalButton}
                                            onClick={handleAddCodeBlockToSlide}
                                            disabled={!codeBlockContent.trim()}
                                        >
                                            Добавить на слайд
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

                        {/* Редактор кода для существующих блоков */}
                        {isCodeEditorOpen && (
                            <div className={styles.codeEditorOverlay} onClick={handleCloseCodeEditor}>
                                <div className={styles.codeEditorModal} onClick={(e) => e.stopPropagation()}>
                                    <div className={styles.codeEditorHeader}>
                                        <h3>Редактирование блока кода</h3>
                                        <div className={styles.codeEditorSettings}>
                                            <div className={styles.codeEditorSetting}>
                                                <label>Язык:</label>
                                                <select
                                                    value={selectedLanguage}
                                                    onChange={(e) => setSelectedLanguage(e.target.value)}
                                                    className={styles.codeEditorSelect}
                                                >
                                                    {LANGUAGES.map(lang => (
                                                        <option key={lang.value} value={lang.value}>
                                                            {lang.label}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className={styles.codeEditorSetting}>
                                                <label>Тема:</label>
                                                <select
                                                    value={codeTheme}
                                                    onChange={(e) => setCodeTheme(e.target.value)}
                                                    className={styles.codeEditorSelect}
                                                >
                                                    {THEMES.map(theme => (
                                                        <option key={theme.value} value={theme.value}>
                                                            {theme.label}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className={styles.codeEditorSetting}>
                                                <label>Размер шрифта:</label>
                                                <input
                                                    type="number"
                                                    min="8"
                                                    max="72"
                                                    value={codeFontSize}
                                                    onChange={(e) => setCodeFontSize(parseInt(e.target.value) || 14)}
                                                    className={styles.codeEditorNumberInput}
                                                />
                                            </div>
                                            <div className={styles.codeEditorSetting}>
                                                <label>
                                                    <input
                                                        type="checkbox"
                                                        checked={showLineNumbers}
                                                        onChange={(e) => setShowLineNumbers(e.target.checked)}
                                                    />
                                                    Номера строк
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className={styles.codeEditorContent}>
                                        <textarea
                                            ref={codeEditorModalTextareaRef}
                                            className={styles.codeTextarea}
                                            value={codeBlockContent}
                                            onChange={(e) => setCodeBlockContent(e.target.value)}
                                            onKeyDown={handleCodeKeyDown}
                                            style={{
                                                fontFamily: "'Cascadia Code', 'Consolas', 'Monaco', 'Courier New', monospace",
                                                fontSize: `${codeFontSize}px`,
                                                backgroundColor: codeTheme === 'vs-dark' ? '#1e1e1e' : 
                                                               codeTheme === 'hc-black' ? '#000000' : '#ffffff',
                                                color: codeTheme === 'vs-dark' ? '#d4d4d4' : 
                                                      codeTheme === 'hc-black' ? '#ffffff' : '#000000'
                                            }}
                                            spellCheck="false"
                                        />
                                    </div>

                                    <div className={styles.codeEditorButtons}>
                                        <button
                                            className={styles.codeEditorButton}
                                            onClick={handleSaveCodeBlock}
                                        >
                                            Сохранить
                                        </button>
                                        <button
                                            className={styles.codeEditorButton}
                                            onClick={handleCloseCodeEditor}
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