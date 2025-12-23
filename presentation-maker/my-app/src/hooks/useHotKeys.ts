import { useEffect, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { historyManager } from '../store/history'
import type { RootState } from '../store/store'
import { selectSlide } from '../store/presentationSlice'
import { addSlide, duplicateSlide, removeSlide } from '../store/slideSlice'
import { restoreObjects } from '../store/slideObjectSlice'
import type { SlideObject } from '../store/types'
import { generateTimestampId } from '../store/utils'
import { saveToDB } from '../database/database'

export const useHotkeys = (isSlideShow: boolean) => {
    const dispatch = useDispatch()
    const presentation = useSelector((state: RootState) => state.presentation)
    const slides = useSelector((state: RootState) => state.slides.slides)
    const slideObjects = useSelector((state: RootState) => state.slideObjects.objects)
    const slidesObject = useSelector((state: RootState) => state.slides)
    const slideObjectsObject = useSelector((state: RootState) => state.slideObjects)


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

    const handleSavePresentation = useCallback( async () => {
        await saveToDB({
            title: presentation.title || 'Без названия',
            presentation: presentation,
            slides: slidesObject,
            slideObjects: slideObjectsObject,
        }, false)
    }, [presentation, slideObjectsObject, slidesObject])

    const handleAddSLide = useCallback(() => {
        const slideIndex = slides.findIndex((slide: { id: string }) => slide.id === presentation.selectedSlide)
        dispatch(addSlide({ idx: slideIndex + 1 }))
    }, [dispatch, presentation.selectedSlide, slides])

    const handleDuplicateSlide = useCallback(() => {
        const slideIndex = slides.findIndex((slide: { id: string }) => slide.id === presentation.selectedSlide)
        if (slideIndex === -1) return

        const slide = slides[slideIndex]

        const newSlideId = generateTimestampId()

        const duplicatedSlide = {
            ...slide,
            id: newSlideId
        }

        dispatch(duplicateSlide({ slide: duplicatedSlide, idx: slideIndex }))

        const slideObjectsToDuplicate = slideObjects[slide.id] || []

        if (slideObjectsToDuplicate.length > 0) {
            const newObjectsForSlide = slideObjectsToDuplicate.map((obj: SlideObject) => ({
                ...obj,
                id: generateTimestampId()
            }))

            const updatedSlideObjects = {
                ...slideObjects,
                [newSlideId]: newObjectsForSlide
            }
            dispatch(restoreObjects({ objects: updatedSlideObjects }))
        }
    }, [dispatch, presentation.selectedSlide, slides, slideObjects])
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
                    case 'd':
                    case 'D':
                        event.preventDefault()
                        handleDuplicateSlide()
                        return
                    case 'M':
                    case 'm':
                        handleAddSLide()
                        return
                    case 'S':
                    case 's':
                        console.log("save")
                        event.preventDefault()
                        event.stopPropagation()
                        handleSavePresentation()
                        return
                }
            }

            if (!isSlideShow) {
                if ((event.key === 'Delete') &&
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
        navigateToSlide,
        handleDuplicateSlide,
        handleAddSLide,
        handleSavePresentation
    ])
}