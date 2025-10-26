import styles from './App.module.css'
import { Toolbar } from './views/Toolbar/Toolbar'
import { selectSlide, type Presentation } from './store/typeAndFunctions'
import { Workspace } from './views/Workspace/Workspace'
import { SlideCollection } from './views/SlideCollection/SlideCollection'
import { SidePanel } from './views/SidePanel/SidePanel'
import { dispatch } from './presentation'
import { useEffect } from 'react'

type AppProps = {
    presentation: Presentation
}

function App(props: AppProps) {
    const handleSlideSelect = (slideId: string) => {
        dispatch(selectSlide, [slideId])
    }

    const slideIndex = props.presentation.slides.findIndex(
        slide => slide.id === props.presentation.selectedSlide
    )

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {

            const currentSlideIndex = props.presentation.slides.findIndex(
                slide => slide.id === props.presentation.selectedSlide
            )

            if (event.key === 'ArrowLeft' && currentSlideIndex > 0) {
                const prevSlide = props.presentation.slides[currentSlideIndex - 1]
                dispatch(selectSlide, [prevSlide.id])
            } else if (event.key === 'ArrowRight' && currentSlideIndex < props.presentation.slides.length - 1) {
                const nextSlide = props.presentation.slides[currentSlideIndex + 1]
                dispatch(selectSlide, [nextSlide.id])
            }
        }

        document.addEventListener('keydown', handleKeyDown)
        return () => {
            document.removeEventListener('keydown', handleKeyDown)
        }
    }, [props.presentation])

    return (
        <div className={styles.app}>
            <Toolbar title={props.presentation.title} />
            <div>
                <SlideCollection 
                    slideCollection={props.presentation.slides}
                    selectedSlide={props.presentation.selectedSlide}
                    onSlideSelect={handleSlideSelect}
                />
                <Workspace 
                    slides={props.presentation.slides} 
                    slideIndex={slideIndex}
                    selectedObjects={props.presentation.selectedObjects}
                    selectedSlideId={props.presentation.selectedSlide}
                />
                <SidePanel 
                    slides={props.presentation.slides}
                    selectedSlideId={props.presentation.selectedSlide}
                    selectedObjects={props.presentation.selectedObjects}
                />
            </div>
        </div>
    )
}

export default App