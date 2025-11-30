import { useEffect, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import type { RootState } from '../store/store'
import { selectSlide } from '../store/presentationSlice'
import { removeSlide } from '../store/slideSlice'
import { historyManager } from '../store/history'

export const useHotkeys = (isSlideShow: boolean) => {
    const dispatch = useDispatch()
    const presentation = useSelector((state: RootState) => state.presentation)
    const slides = useSelector((state: RootState) => state.slides.slides)

    const handleUndo = useCallback(() => {
        if (historyManager.canUndo()) {
            dispatch({ type: 'history/undo' })
        }
    }, [dispatch])

    const handleRedo = useCallback(() => {
        if (historyManager.canRedo()) {
            dispatch({ type: 'history/redo' })
        }
    }, [dispatch])

    const navigateToSlide = useCallback((slideId: string) => {
        dispatch(selectSlide(slideId))
    }, [dispatch])

    const handleDeleteSlide = useCallback(() => {
        if (!isSlideShow && presentation.selectedSlide && slides.length > 1) {
            const currentSlideIndex = slides.findIndex(slide => slide.id === presentation.selectedSlide)
            let newSelectedSlideId: string
            if (currentSlideIndex === slides.length - 1) {
                newSelectedSlideId = slides[currentSlideIndex - 1].id
            }
            else {
                newSelectedSlideId = slides[currentSlideIndex + 1].id
            }
            dispatch(selectSlide(newSelectedSlideId))
            dispatch(removeSlide(presentation.selectedSlide))
        }
    }, [isSlideShow, presentation.selectedSlide, slides, dispatch])

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            const isMac = navigator.userAgent.toUpperCase().includes('MAC')
            const cmdKey = isMac ? event.metaKey : event.ctrlKey

            if (cmdKey) {
                switch (event.key) {
                    case 'z':
                        if (!event.shiftKey) {
                            event.preventDefault()
                            handleUndo()
                            return
                        }
                        break
                    case 'y':
                        event.preventDefault()
                        handleRedo()
                        return
                    case 'Z':
                        if (event.shiftKey) {
                            event.preventDefault()
                            handleRedo()
                            return
                        }
                        break
                    case 'я':
                        if (!event.shiftKey) {
                            event.preventDefault()
                            handleUndo()
                            return
                        }
                        break
                    case 'Я':
                        if (event.shiftKey) {
                            event.preventDefault()
                            handleRedo()
                            return
                        }
                        break
                    case 'н':
                        event.preventDefault()
                        handleRedo()
                        return
                }
            }

            if (!isSlideShow) {
                if ((event.key === 'Delete' || event.key === 'Backspace') &&
                    !event.ctrlKey && !event.metaKey && !event.altKey) {
                    event.preventDefault()
                    handleDeleteSlide()
                    return
                }
            }

            if (isSlideShow) {
                if (event.key === 'Escape') {
                    return
                }

                if (event.key === ' ' || event.key === 'Enter') {
                    event.preventDefault()
                    const currentSlideIndex = slides.findIndex(
                        slide => slide.id === presentation.selectedSlide
                    )
                    if (currentSlideIndex < slides.length - 1) {
                        const nextSlide = slides[currentSlideIndex + 1]
                        navigateToSlide(nextSlide.id)
                    }
                    return
                }

                const currentSlideIndex = slides.findIndex(
                    slide => slide.id === presentation.selectedSlide
                )

                if (event.key === 'ArrowLeft' && currentSlideIndex > 0) {
                    event.preventDefault()
                    const prevSlide = slides[currentSlideIndex - 1]
                    navigateToSlide(prevSlide.id)
                } else if (event.key === 'ArrowRight' && currentSlideIndex < slides.length - 1) {
                    event.preventDefault()
                    const nextSlide = slides[currentSlideIndex + 1]
                    navigateToSlide(nextSlide.id)
                } else if (event.key === 'Home') {
                    event.preventDefault()
                    navigateToSlide(slides[0].id)
                } else if (event.key === 'End') {
                    event.preventDefault()
                    navigateToSlide(slides[slides.length - 1].id)
                }
            }

            if (!isSlideShow && !cmdKey && !event.altKey) {
                const currentSlideIndex = slides.findIndex(
                    slide => slide.id === presentation.selectedSlide
                )

                if (event.key === 'ArrowLeft' && currentSlideIndex > 0) {
                    event.preventDefault()
                    const prevSlide = slides[currentSlideIndex - 1]
                    navigateToSlide(prevSlide.id)
                } else if (event.key === 'ArrowRight' && currentSlideIndex < slides.length - 1) {
                    event.preventDefault()
                    const nextSlide = slides[currentSlideIndex + 1]
                    navigateToSlide(nextSlide.id)
                }
            }
        }

        document.addEventListener('keydown', handleKeyDown)
        return () => {
            document.removeEventListener('keydown', handleKeyDown)
        }
    }, [
        isSlideShow, 
        presentation.selectedSlide, 
        slides, 
        handleUndo, 
        handleRedo, 
        handleDeleteSlide, 
        navigateToSlide
    ])
}