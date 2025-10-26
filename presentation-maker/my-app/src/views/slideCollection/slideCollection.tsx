import { ShowSlide } from "../../common/ShowSlide"
import { setSlides, type Slide } from "../../store/typeAndFunctions"
import { useState, useRef } from "react"
import styles from "./slideCollection.module.css"
import { dispatch } from "../../presentation"

type SlideCollectionProps = {
    slideCollection: Array<Slide>,
    selectedSlide: string,
    onSlideSelect: (slideId: string) => void
}

export function SlideCollection(props: SlideCollectionProps) {
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
    const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
    const dragItem = useRef<number | null>(null)


    const handleSlideClick = (slideId: string) => { 
        props.onSlideSelect(slideId)
    }

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
        dragItem.current = index
        setDraggedIndex(index)
        e.currentTarget.style.opacity = "0.4"
    }

    const handleDragEnter = (e: React.DragEvent<HTMLDivElement>, index: number) => {
        e.preventDefault()
        setDragOverIndex(index)
    }

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
    }

    const handleDragLeave = () => {
        setDragOverIndex(null)
    }

    const handleDrop = (e: React.DragEvent<HTMLDivElement>, dropIndex: number) => {
        e.preventDefault()
        
        if (dragItem.current !== null && dragItem.current !== dropIndex) {
            const newSlides = [...props.slideCollection]
            const [movedSlide] = newSlides.splice(dragItem.current, 1)
            newSlides.splice(dropIndex, 0, movedSlide)
            dispatch(setSlides, [newSlides])
        }
        resetDragState()
    }

    const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
        resetDragState()
        e.currentTarget.style.opacity = "1"
    }

    const resetDragState = () => {
        setDraggedIndex(null)
        setDragOverIndex(null)
        dragItem.current = null
        
        const slides = document.querySelectorAll(`.${styles.slideCollectionObject}`)
        slides.forEach(slide => {
            (slide as HTMLElement).style.opacity = "1"
        })
    }

    return (
        <div className={styles.slideCollection}>
            <div>
                {props.slideCollection.map((slide, index) => (
                    <div 
                        className={`${styles.slideCollectionObject} ${
                            props.selectedSlide === slide.id ? styles.slideCollectionObjectSelected : ''
                        } ${draggedIndex === index ? styles.dragging : ''} ${
                            dragOverIndex === index ? styles.dragOver : ''
                        }`} 
                        key={slide.id}
                        id={slide.id}
                        onClick={() => handleSlideClick(slide.id)}
                        draggable
                        onDragStart={(e) => handleDragStart(e, index)}
                        onDragEnter={(e) => handleDragEnter(e, index)}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, index)}
                        onDragEnd={handleDragEnd}
                    >
                        <div className={styles.slideContainer}>
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