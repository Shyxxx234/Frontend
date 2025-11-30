import { ShowSlide } from "../../common/ShowSlide"
import { useEffect, useState, useRef } from "react"
import styles from "./slideCollection.module.css"
import { useSelector, useDispatch } from 'react-redux'
import type { RootState } from '../../store/store'
import { replaceSlide } from '../../store/slideSlice'
import { selectSlide } from '../../store/presentationSlice'

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
    const containerRef = useRef<HTMLDivElement>(null)
    const scrollDirectionRef = useRef<'up' | 'down' | null>(null)
    const scrollIntervalRef = useRef<number | null>(null)

    const handleSlideClick = (slideId: string) => {
        if (draggedIndex === null) {
            props.onSlideSelect(slideId)
            dispatch(selectSlide(slideId))
        }
    }

    const handleMouseDown = (index: number) => {
        setDraggedIndex(index)
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

    return (
        <div 
            className={styles.slideCollection} 
            ref={containerRef}
            onMouseMove={handleMouseMove}
        >
            <div>
                {slides.map((slide, index) => (
                    <div
                        className={`${styles.slideCollectionObject} ${
                            selectedSlide === slide.id ? styles.slideCollectionObjectSelected : ''
                        } ${
                            draggedIndex === index ? styles.dragging : ''
                        } ${
                            dragOverIndex === index ? styles.dragOver : ''
                        }`}
                        key={slide.id}
                        id={slide.id}
                        onClick={() => handleSlideClick(slide.id)}
                        onMouseDown={() => handleMouseDown(index)}
                        onMouseEnter={() => handleMouseEnter(index)}
                        onMouseLeave={handleMouseLeave}
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
    )
}