import { useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { selectSlide } from '../../store/presentationSlice'
import type { RootState } from '../../store/store'
import { ShowSlide } from '../../common/ShowSlide'
import styles from './playerPage.module.css'

export function PlayerPage() {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    
    const slides = useSelector((state: RootState) => state.slides.slides)
    const presentation = useSelector((state: RootState) => state.presentation)
    const slideObjects = useSelector((state: RootState) => state.slideObjects.objects)
    
    const selectedSlideId = presentation.selectedSlide
    const slideIndex = slides.findIndex(slide => slide.id === selectedSlideId)
    const slide = slides[slideIndex]
    
    const getSlideWithObjects = useCallback(() => {
        if (!slide) return null
        return {
            ...slide,
            slideObject: slideObjects[slide.id] || []
        }
    }, [slide, slideObjects])
    
    const currentSlideWithObjects = getSlideWithObjects()
    
    const goToPreviousSlide = useCallback(() => {
        if (slideIndex > 0) {
            const prevSlide = slides[slideIndex - 1]
            dispatch(selectSlide(prevSlide.id))
        }
    }, [slideIndex, slides, dispatch])
    
    const goToNextSlide = useCallback(() => {
        if (slideIndex < slides.length - 1) {
            const nextSlide = slides[slideIndex + 1]
            dispatch(selectSlide(nextSlide.id))
        }
    }, [slideIndex, slides, dispatch])
    
    const handleExit = useCallback(() => {
        history.replaceState('player', '')
        navigate('/editor')
    }, [navigate])
    
    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        switch (e.key) {
            case 'ArrowLeft':
            case 'PageUp':
                goToPreviousSlide()
                break
            case 'ArrowRight':
            case 'PageDown':
                goToNextSlide()
                break
            case 'Escape':
                handleExit()
                break
        }
    }, [goToPreviousSlide, goToNextSlide, handleExit])
    
    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown)
        return () => {
            document.removeEventListener('keydown', handleKeyDown)
        }
    }, [handleKeyDown])
    
    useEffect(() => {
        if (slides.length > 0 && !selectedSlideId) {
            dispatch(selectSlide(slides[0].id))
        }
    }, [slides, selectedSlideId, dispatch])
    
    useEffect(() => {
        document.body.style.overflow = 'hidden'
        return () => {
            document.body.style.overflow = 'unset'
        }
    }, [])
    
    return (
        <div className={styles.playerPage}>
            <div className={styles.slideContainer}>
                {currentSlideWithObjects ? (
                    <ShowSlide
                        slide={currentSlideWithObjects}
                        className={styles.slide}
                        disableObjectClicks={true}
                        slideId={currentSlideWithObjects.id}
                    />
                ) : (
                    <div className={styles.noSlide}>
                        {slides.length === 0 ? "Нет слайдов" : "Загрузка..."}
                    </div>
                )}
            </div>
        </div>
    )
}