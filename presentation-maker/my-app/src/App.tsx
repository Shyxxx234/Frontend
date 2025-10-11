import './App.css'
import { Toolbar } from './views/toolbar/toolbar'
import { selectSlide, type Presentation } from './store/typeAndFunctions'
import { Workspace } from './views/workspace/workspace'
import { SlideCollection } from './views/slideCollection/slideCollection'
import { SidePanel } from './views/sidePanel/sidePanel'
import { dispatch } from './presentation'
import { useEffect } from 'react'

type AppProps = {
    presentation: Presentation
}

function App(props: AppProps) {
    const handleSlideSelect = (slideId: string) => {
        dispatch(selectSlide, [slideId])
    }

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {

            const currentSlideIndex = props.presentation.slides.findIndex(
                slide => slide.id === props.presentation.selectedSlide
            )

            if (event.key === 'ArrowLeft' && currentSlideIndex > 0) {
                event.preventDefault()
                const prevSlide = props.presentation.slides[currentSlideIndex - 1]
                dispatch(selectSlide, [prevSlide.id])
            } else if (event.key === 'ArrowRight' && currentSlideIndex < props.presentation.slides.length - 1) {
                event.preventDefault()
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
        <div className="app">
            <Toolbar presentation={props.presentation} />
            <div className="app-content">
                <SlideCollection 
                    presentation={props.presentation} 
                    onSlideSelect={handleSlideSelect}
                />
                <Workspace presentation={props.presentation} />
                <SidePanel />
            </div>
        </div>
    )
}

export default App