import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import styles from './App.module.css'
import { Toolbar } from './views/Toolbar/Toolbar'
import { Workspace } from './views/Workspace/Workspace'
import { SlideCollection } from './views/SlideCollection/SlideCollection'
import { SidePanel } from './views/SidePanel/SidePanel'
import { PlayerPage } from './views/PlayerPage/PlayerPage'
import { LoginPage } from './views/LoginPage/LoginPage'
import { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { store, type RootState } from './store/store'
import { selectSlide } from './store/presentationSlice'
import { useHotkeys } from './hooks/useHotKeys'
import { ChoosePresentationModalWindow } from './views/ChoosePresentationModalWindow/ChoosePresentationModalWindow'
import { SpeakerNotesModalWindow } from './views/SpeakerNotesModalWindow/SpeakerNotesModalWIndow'

function Editor() {
    const dispatch = useDispatch()
    const presentation = useSelector((state: RootState) => state.presentation)
    const slides = useSelector((state: RootState) => state.slides.slides)
    const [showLoadModal, setShowLoadModal] = useState(true)
    const [showSpeakerNotes, setShowSpeakerNotes] = useState(false)
    const location = useLocation()
    useHotkeys(false)

    window.addEventListener('popstate', async function() {
        if (location.pathname == '/editor') {
            history.replaceState('editor', '')
        }
    })

    const handleStartSpeakerMode = () => {
        if (slides.length === 0) {
            return
        }
        
        const fullState = store.getState();
        
        localStorage.setItem('presentationFullState', JSON.stringify(fullState));
        
        const currentUrl = window.location.origin + window.location.pathname
        const speakerUrl = `${currentUrl}#speaker`
        
        const width = 1200
        const height = 800
        const left = (window.screen.width - width) / 2
        const top = (window.screen.height - height) / 2
        
        const newWindow = window.open(
            speakerUrl,
            'speakerNotes',
            `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
        )
        
        if (newWindow) {
            setTimeout(() => {
                newWindow.postMessage({
                    type: 'INIT_REDUX_STATE',
                    state: fullState
                }, '*');
            }, 1000);
            setShowSpeakerNotes(false);
        }
    }

    const handleCloseSpeakerNotes = () => {
        setShowSpeakerNotes(false)
    }

    useEffect(() => {
        if (window.location.hash === '#speaker') {
            setShowSpeakerNotes(true)
        }
    }, [])

    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            if (event.data.type === 'SLIDE_CHANGED') {
                dispatch(selectSlide(event.data.slideId));
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [dispatch]);

    useEffect(() => {
        if (slides.length > 0 && !presentation.selectedSlide) {
            dispatch(selectSlide(slides[0].id))
        }
    }, [slides, presentation.selectedSlide, dispatch])

    const handleSlideSelect = (slideId: string) => {
        dispatch(selectSlide(slideId))
    }

    return (
        <div className={styles.app}>
            <Toolbar
                onStartSpeakerMode={handleStartSpeakerMode}
                onOpenLoadModal={() => setShowLoadModal(true)}
            />

            <div className={styles.mainContent}>
                <SlideCollection onSlideSelect={handleSlideSelect} />
                <Workspace />
                <SidePanel />
            </div>

            {showLoadModal && (
                <ChoosePresentationModalWindow
                    onClose={() => setShowLoadModal(false)}
                />
            )}

            <SpeakerNotesModalWindow
                isOpen={showSpeakerNotes || window.location.hash === '#speaker'}
                onClose={handleCloseSpeakerNotes}
                isNewWindow={window.location.hash === '#speaker'}
            />
        </div>
    )
}

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Navigate to="/login" />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/editor" element={<Editor />}  />
                <Route path="/player" element={<PlayerPage />} />
            </Routes>
        </Router>
    )
}

export default App