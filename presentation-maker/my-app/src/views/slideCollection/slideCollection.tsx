import { ShowSlide } from "../../common/ShowSlide"
import { useEffect, useState, useRef } from "react"
import styles from "./slideCollection.module.css"
import { useSelector, useDispatch } from 'react-redux'
import type { RootState } from '../../store/store'
import { 
  addSlide, 
  removeSlide, 
  replaceSlide,
  changeBackgroundToColor,
  changeBackgroundToImage 
} from '../../store/slideSlice'
import { selectSlide } from '../../store/presentationSlice'
import { Button } from "../../common/Button"
import { createBlankSlide } from "../../store/utils"

type SlideCollectionProps = {
    onSlideSelect: (slideId: string) => void
}

export function SlideCollection(props: SlideCollectionProps) {
    const dispatch = useDispatch()
    const presentation = useSelector((state: RootState) => state.presentation)
    const slides = useSelector((state: RootState) => state.slides.slides)
    const selectedSlide = presentation.selectedSlide

    const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
    const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
    const [contextMenu, setContextMenu] = useState<{
        visible: boolean,
        x: number,
        y: number,
        slideId: string,
        slideIndex: number
    } | null>(null)
    const [showColorPicker, setShowColorPicker] = useState(false)
    const [colorPickerPosition, setColorPickerPosition] = useState({ x: 0, y: 0 })
    const [selectedSlideIdForColor, setSelectedSlideIdForColor] = useState<string | null>(null)
    
    const containerRef = useRef<HTMLDivElement>(null)
    const contextMenuRef = useRef<HTMLDivElement>(null)
    const colorPickerRef = useRef<HTMLInputElement>(null)
    const scrollDirectionRef = useRef<'up' | 'down' | null>(null)
    const scrollIntervalRef = useRef<number | null>(null)
    const colorTimeoutRef = useRef<number | null>(null)

    const handleAddSlide = () => {
        const newSlide = createBlankSlide()
        dispatch(selectSlide(newSlide.id))
        dispatch(addSlide({
            slide: newSlide,
            idx: slides.length
        }))
        closeContextMenu()
    }

    const handleRemoveSlide = (slideId?: string) => {
        const slideToRemove = slideId || selectedSlide
        if (slideToRemove) {
            const currentSlideIndex = slides.findIndex((slide: { id: string }) => slide.id === slideToRemove)
            
            if (slides.length > 1) {
                let newSelectedSlideId: string
                if (currentSlideIndex === slides.length - 1) {
                    newSelectedSlideId = slides[currentSlideIndex - 1].id
                } 
                else {
                    newSelectedSlideId = slides[currentSlideIndex + 1].id
                }
                dispatch(selectSlide(newSelectedSlideId))
            }
            dispatch(removeSlide(slideToRemove))
        }
        closeContextMenu()
    }

    const handleSlideClick = (slideId: string) => {
        if (draggedIndex === null) {
            props.onSlideSelect(slideId)
            dispatch(selectSlide(slideId))
            closeContextMenu()
        }
    }

    const handleContextMenu = (e: React.MouseEvent, slideId: string, index: number) => {
        e.preventDefault()
        e.stopPropagation()
        
        setContextMenu({
            visible: true,
            x: e.clientX,
            y: e.clientY,
            slideId,
            slideIndex: index
        })
        
        dispatch(selectSlide(slideId))
        props.onSlideSelect(slideId)
        
        setSelectedSlideIdForColor(slideId)
    }

    const handleChangeBackgroundColor = () => {
        if (!contextMenu || !selectedSlideIdForColor) return
        
        setColorPickerPosition({
            x: contextMenu.x,
            y: contextMenu.y + 120 
        })
        setShowColorPicker(true)
        closeContextMenu()
    }

    const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const color = e.target.value
        
        if (!selectedSlideIdForColor) return
        
        if (colorTimeoutRef.current) {
            clearTimeout(colorTimeoutRef.current)
        }
        
        colorTimeoutRef.current = window.setTimeout(() => {
            if (color && selectedSlideIdForColor) {
                dispatch(changeBackgroundToColor({
                    slideId: selectedSlideIdForColor,
                    color: color
                }))
            }
        }, 100)
    }

    const handleAddImageBackground = () => {
        if (!selectedSlideIdForColor) return
        
        const input = document.createElement('input')
        input.type = 'file'
        input.accept = 'image/*'
        
        input.onchange = (e: Event) => {
            const target = e.target as HTMLInputElement
            const file = target.files?.[0]
            if (file && selectedSlideIdForColor) {
                const imageUrl = URL.createObjectURL(file)
                
                dispatch(changeBackgroundToImage({
                    slideId: selectedSlideIdForColor,
                    imageUrl: imageUrl
                }))
            }
            closeContextMenu()
        }
        
        input.click()
    }

    const closeContextMenu = () => {
        setContextMenu(null)
    }

    const closeColorPicker = () => {
        setShowColorPicker(false)
        setSelectedSlideIdForColor(null)
        if (colorPickerRef.current) {
            colorPickerRef.current.value = '#ffffff'
        }
    }

    const handleMouseDown = (index: number) => {
        setDraggedIndex(index)
        closeContextMenu()
        closeColorPicker()
    }

    const handleMouseEnter = (index: number) => {
        if (draggedIndex !== null && draggedIndex !== index) {
            setDragOverIndex(index)
        }
    }

    const handleMouseLeave = () => {
        setDragOverIndex(null)
    }

    const handleMouseUp = (dropIndex: number, e: React.MouseEvent) => {
        e.stopPropagation()
        if (draggedIndex !== null && draggedIndex !== dropIndex) {
            dispatch(replaceSlide({
                dragItemId: draggedIndex,
                insertSpot: dropIndex
            }))
        }
        setDraggedIndex(null)
        setDragOverIndex(null)
        stopAutoScroll()
        closeContextMenu()
        closeColorPicker()
    }

    const startAutoScroll = (direction: 'up' | 'down') => {
        if (scrollDirectionRef.current === direction) return

        stopAutoScroll()
        scrollDirectionRef.current = direction

        const scroll = () => {
            if (containerRef.current && scrollDirectionRef.current) {
                containerRef.current.scrollTop += scrollDirectionRef.current === 'down' ? 10 : -10
                scrollIntervalRef.current = setTimeout(scroll, 5)
            }
        }
        scroll()
    }

    const stopAutoScroll = () => {
        if (scrollIntervalRef.current) {
            clearTimeout(scrollIntervalRef.current)
            scrollIntervalRef.current = null
        }
        scrollDirectionRef.current = null
    }

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!containerRef.current || draggedIndex === null) {
            stopAutoScroll()
            return
        }

        const rect = containerRef.current.getBoundingClientRect()
        const mouseY = e.clientY
        const scrollZone = 50

        if (mouseY < rect.top + scrollZone) {
            startAutoScroll('up')
        } else if (mouseY > rect.bottom - scrollZone) {
            startAutoScroll('down')
        } else {
            stopAutoScroll()
        }
    }

    useEffect(() => {
        const handleClickOutside = (e: globalThis.MouseEvent) => {
            const target = e.target as HTMLElement
            
            if (contextMenuRef.current && !contextMenuRef.current.contains(target)) {
                closeContextMenu()
            }
            
            if (showColorPicker && colorPickerRef.current && 
                !colorPickerRef.current.contains(target) && 
                target.tagName !== 'INPUT') {
                closeColorPicker()
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [showColorPicker])

    useEffect(() => {
        if (showColorPicker && colorPickerRef.current) {
            colorPickerRef.current.focus()
            
            colorPickerRef.current.click()
        }
    }, [showColorPicker])

    useEffect(() => {
        const handleGlobalMouseUp = () => {
            setDraggedIndex(null)
            setDragOverIndex(null)
            stopAutoScroll()
        }

        document.addEventListener('mouseup', handleGlobalMouseUp)
        return () => {
            document.removeEventListener('mouseup', handleGlobalMouseUp)
            stopAutoScroll()
        }
    }, [])

    useEffect(() => {
        if (slides.length > 0 && !selectedSlide) {
            dispatch(selectSlide(slides[0].id))
        }
    }, [slides, selectedSlide, dispatch])

    useEffect(() => {
        return () => {
            if (colorTimeoutRef.current) {
                clearTimeout(colorTimeoutRef.current)
            }
        }
    }, [])

    return (
        <>
            <div className={styles.buttonSection}>
                    <Button className={styles.button} onClick={handleAddSlide}>+</Button>
                </div>
            <div
                className={styles.slideCollection}
                ref={containerRef}
                onMouseMove={handleMouseMove}
            >

                <div>
                    {slides.map((slide, index) => (
                        <div
                            className={`${styles.slideCollectionObject} ${selectedSlide === slide.id ? styles.slideCollectionObjectSelected : ''
                                } ${draggedIndex === index ? styles.dragging : ''
                                } ${dragOverIndex === index ? styles.dragOver : ''
                                }`}
                            key={slide.id}
                            id={slide.id}
                            onClick={() => handleSlideClick(slide.id)}
                            onMouseDown={() => handleMouseDown(index)}
                            onMouseEnter={() => handleMouseEnter(index)}
                            onMouseLeave={handleMouseLeave}
                            onContextMenu={(e) => handleContextMenu(e, slide.id, index)}
                            onMouseUp={(e) => handleMouseUp(index, e)}
                            style={{
                                cursor: draggedIndex !== null ? 'grabbing' : 'pointer',
                                transform: draggedIndex === index ? 'scale(0.95)' : 'scale(1)',
                                opacity: draggedIndex === index ? 0.7 : 1
                            }}
                        >
                            <div
                                className={styles.slideContainer}
                                style={{ pointerEvents: 'none' }}
                            >
                                <ShowSlide
                                    slide={slide}
                                    disableObjectClicks={true}
                                    className={styles.slide}
                                    slideId={slide.id}
                                />
                            </div>
                            <div className={styles.counter}>
                                {index + 1}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {contextMenu && contextMenu.visible && (
                <div
                    ref={contextMenuRef}
                    className={styles.contextMenu}
                    style={{
                        position: 'fixed',
                        left: `${contextMenu.x}px`,
                        top: `${contextMenu.y}px`,
                        zIndex: 1000,
                    }}
                >
                    <div 
                        className={styles.contextMenuItem}
                        onClick={() => handleRemoveSlide(contextMenu.slideId)}
                    >
                        Удалить слайд
                    </div>
                    <div 
                        className={styles.contextMenuItem}
                        onClick={handleChangeBackgroundColor}
                    >
                        Изменить цвет фона
                    </div>
                    <div 
                        className={styles.contextMenuItem}
                        onClick={handleAddImageBackground}
                    >
                        Добавить изображение на фон
                    </div>
                </div>
            )}

            {showColorPicker && (
                <div style={{
                    position: 'fixed',
                    left: `${colorPickerPosition.x}px`,
                    top: `${colorPickerPosition.y}px`,
                    zIndex: 1001,
                }}>
                    <input
                        ref={colorPickerRef}
                        type="color"
                        onChange={handleColorChange}
                        style={{
                            width: '40px',
                            height: '40px',
                            border: '2px solid #ccc',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            opacity: 1, 
                            position: 'absolute',
                            top: 0,
                            left: 0,
                        }}
                        onBlur={closeColorPicker}
                    />
                </div>
            )}
        </>
    )
}