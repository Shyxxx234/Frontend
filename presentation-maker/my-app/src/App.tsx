import styles from './App.module.css'
import { Toolbar } from './views/Toolbar/Toolbar'
import { Workspace } from './views/Workspace/Workspace'
import { SlideCollection } from './views/SlideCollection/SlideCollection'
import { SidePanel } from './views/SidePanel/SidePanel'
import { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import type { RootState } from './store/store'
import { selectSlide } from './store/presentationSlice'
import { useHotkeys } from './hooks/useHotKeys'
import { ChoosePresentationModalWindow } from './views/ChoosePresentationModalWindow/ChoosePresentationModalWindow'

function App() {
    const dispatch = useDispatch()
    const presentation = useSelector((state: RootState) => state.presentation)
    const slides = useSelector((state: RootState) => state.slides.slides)
    const [isSlideShow, setIsSlideShow] = useState(false)
    const [showLoadModal, setShowLoadModal] = useState(false)

    useHotkeys(isSlideShow)

    const handleSlideSelect = (slideId: string) => {
        dispatch(selectSlide(slideId))
    }

    const handleStartSlideShow = () => {
        setIsSlideShow(true)
        if (slides.length > 0 && !presentation.selectedSlide) {
            dispatch(selectSlide(slides[0].id))
        }
    }

    const handleExitSlideShow = () => {
        setIsSlideShow(false)
    }

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

    useEffect(() => {
        if (slides.length > 0 && !presentation.selectedSlide) {
            dispatch(selectSlide(slides[0].id))
        }
    }, [slides, presentation.selectedSlide, dispatch])

    return (
        <div className={`${styles.app} ${isSlideShow ? styles.slideShowMode : ''}`}>
            {!isSlideShow && (
                <Toolbar
                    onStartSlideShow={handleStartSlideShow}
                    onOpenLoadModal={() => setShowLoadModal(true)}
                />
            )}

            <div className={styles.mainContent}>
                {!isSlideShow && (
                    <SlideCollection
                        onSlideSelect={handleSlideSelect}
                    />
                )}

                <Workspace
                    isSlideShow={isSlideShow}
                    onExitSlideShow={handleExitSlideShow}
                />

                {!isSlideShow && (
                    <SidePanel />
                )}
            </div>

            {showLoadModal && (
                <ChoosePresentationModalWindow
                    onClose={() => setShowLoadModal(false)}
                />
            )}
        </div>
    )
}

export default App