import styles from './App.module.css'
import { Toolbar } from './views/Toolbar/Toolbar'
import { Workspace } from './views/Workspace/Workspace'
import { SlideCollection } from './views/SlideCollection/SlideCollection'
import { SidePanel } from './views/SidePanel/SidePanel'
import { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import type { RootState } from './store/store'
import { selectSlide } from './store/presentationSlice'

function App() {
    const dispatch = useDispatch()
    const presentation = useSelector((state: RootState) => state.presentation)
    const [isSlideShow, setIsSlideShow] = useState(false)
    
    const handleSlideSelect = (slideId: string) => {
        dispatch(selectSlide(slideId))
    }

    const handleStartSlideShow = () => {
        setIsSlideShow(true)
        if (presentation.slides.length > 0) {
            const firstSlide = presentation.slides[0]
            dispatch(selectSlide(firstSlide.id))
        }
    }

    const handleExitSlideShow = () => {
        setIsSlideShow(false)
    }

    const slideIndex = presentation.slides.findIndex(
        slide => slide.id === presentation.selectedSlide
    )

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (isSlideShow) {
                if (event.key === 'Escape') {
                    handleExitSlideShow()
                    return
                }
            }

            const currentSlideIndex = presentation.slides.findIndex(
                slide => slide.id === presentation.selectedSlide
            )

            if (event.key === 'ArrowLeft' && currentSlideIndex > 0) {
                const prevSlide = presentation.slides[currentSlideIndex - 1]
                dispatch(selectSlide(prevSlide.id))
            } else if (event.key === 'ArrowRight' && currentSlideIndex < presentation.slides.length - 1) {
                const nextSlide = presentation.slides[currentSlideIndex + 1]
                dispatch(selectSlide(nextSlide.id))
            }

            if (isSlideShow && event.key === ' ' && currentSlideIndex < presentation.slides.length - 1) {
                const nextSlide = presentation.slides[currentSlideIndex + 1]
                dispatch(selectSlide(nextSlide.id))
            }
        }

        document.addEventListener('keydown', handleKeyDown)
        return () => {
            document.removeEventListener('keydown', handleKeyDown)
        }
    }, [presentation, isSlideShow, dispatch])

    useEffect(() => {
        if (isSlideShow) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = 'unset'
        }

        return () => {
            document.body.style.overflow = 'unset'
        }
    }, [isSlideShow])

    return (
        <div className={`${styles.app} ${isSlideShow ? styles.slideShowMode : ''}`}>
            {!isSlideShow && (
                <Toolbar 
                    onStartSlideShow={handleStartSlideShow}
                />
            )}
            
            <div className={styles.mainContent}>
                {!isSlideShow && (
                    <SlideCollection 
                        onSlideSelect={handleSlideSelect}
                    />
                )}
                
                <Workspace 
                    slideIndex={slideIndex}
                    isSlideShow={isSlideShow}
                    onExitSlideShow={handleExitSlideShow}
                />
                
                {!isSlideShow && (
                    <SidePanel />
                )}
            </div>
        </div>
    )
}

export default App