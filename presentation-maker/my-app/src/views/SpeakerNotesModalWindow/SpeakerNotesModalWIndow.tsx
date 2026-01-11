import { useState, useEffect, useRef, useCallback } from "react"
import { useSelector } from 'react-redux'
import type { RootState } from "../../store/store"
import styles from "./SpeakerNotesModalWindow.module.css"

import { SlidePreviewSection } from "./components/SlidePreviewSection"
import { NotesSection } from "./components/NoteSection"
import { SpeechInputSection } from "./components/SpeechInputSection"
import { AIQuerySection } from "./components/AIQuerySection"
import { AIResponseSection } from "./components/AIResponseSection"

import type { Slide, SlideObject } from "../../store/types"
import { useAIGeneration } from "../../hooks/useAIGeneration"
import { useSpeechRecognition } from "../../hooks/useSpeechRecognition"
import { useSlideNavigation } from "../../hooks/useSlideNavigation"
import { useTimer } from "../../hooks/useTimer"

export type SpeakerNotesModalWindowProps = {
    isOpen: boolean
    onClose: () => void
    isNewWindow?: boolean
}

export type ExternalState = {
    slides?: {
        slides: Slide[]
    }
    presentation?: {
        selectedSlide?: string
        title?: string
    }
    slideObjects?: {
        objects: Record<string, SlideObject[]>
    }
}

export function SpeakerNotesModalWindow({ isOpen, onClose, isNewWindow = false }: SpeakerNotesModalWindowProps) {
    const slides = useSelector((state: RootState) => state.slides.slides)
    const presentation = useSelector((state: RootState) => state.presentation)
    const slideObjects = useSelector((state: RootState) => state.slideObjects.objects)

    const [externalSlides, setExternalSlides] = useState<Slide[]>([])
    const [externalPresentation, setExternalPresentation] = useState(presentation)
    const [externalSlideObjects, setExternalSlideObjects] = useState<Record<string, SlideObject[]>>({})

    const aiQueryRef = useRef<HTMLTextAreaElement>(null) as React.RefObject<HTMLTextAreaElement>
    
    const {
        timer,
        isTimerRunning,
        toggleTimer,
        resetTimer
    } = useTimer()
    
    const {
        aiQuery,
        aiResponse,
        isGenerating,
        setAiQuery,
        handleGenerateAIResponse,
        addTextToAiQuery,
        handleStopGeneration,
        handleClearAIResponse,
        handleCopyToClipboard,
    } = useAIGeneration()

    const handleActivationCommand = useCallback((buffer: string) => {
        const addedText = addTextToAiQuery(buffer, aiQueryRef)
        if (addedText && addedText.trim()) {
            setTimeout(() => {
                handleGenerateAIResponse(addedText)
            }, 300)
        }
    }, [addTextToAiQuery, handleGenerateAIResponse])

    const {
        isListening,
        isSpeechSupported,
        interimTranscript,
        finalTranscript,
        recognitionError,
        audioLevel,
        speechBuffer,
        bufferSize,
        isProcessingCommand,
        toggleListening,
        clearSpeechTranscript,
        getFullBuffer
    } = useSpeechRecognition(handleActivationCommand)

    const handleAddBufferToQuery = useCallback(() => {
        const completeBuffer = getFullBuffer()
        if (completeBuffer) {
            const addedText = addTextToAiQuery(completeBuffer, aiQueryRef)
            if (addedText && addedText.trim()) {
                setTimeout(() => {
                    handleGenerateAIResponse(addedText)
                }, 300)
            }
        }
    }, [getFullBuffer, addTextToAiQuery, handleGenerateAIResponse])

    const displaySlides = isNewWindow && externalSlides.length > 0 ? externalSlides : slides
    const displayPresentation = isNewWindow && externalPresentation ? externalPresentation : presentation
    const displaySlideObjects = isNewWindow && externalSlideObjects ? externalSlideObjects : slideObjects
    const displaySelectedSlideId = displayPresentation?.selectedSlide

    const {
        currentSlideIndex,
        currentSlide,
        notes,
        handlePreviousSlide,
        handleNextSlide,
        handleNotesChange,
        handleUseAIResponse
    } = useSlideNavigation(displaySlides, displaySelectedSlideId, isNewWindow)

    useEffect(() => {
        if (!isNewWindow) return

        const handleMessage = (event: MessageEvent) => {
            if (event.data.type === 'INIT_REDUX_STATE') {
                localStorage.setItem('reduxState', JSON.stringify(event.data.state))
                setExternalSlides(event.data.state.slides?.slides || [])
                setExternalPresentation(event.data.state.presentation || {})
                setExternalSlideObjects(event.data.state.slideObjects?.objects || {})
            }
        }

        window.addEventListener('message', handleMessage)

        if (window.opener) {
            window.opener.postMessage({ type: 'REQUEST_REDUX_STATE' }, '*')
        }

        return () => window.removeEventListener('message', handleMessage)
    }, [isNewWindow])

    useEffect(() => {
        if (isNewWindow) {
            const savedState = localStorage.getItem('reduxState')
            if (savedState) {
                try {
                    const state = JSON.parse(savedState)
                    setExternalSlides(state.slides?.slides || [])
                    setExternalPresentation(state.presentation || {})
                    setExternalSlideObjects(state.slideObjects?.objects || {})
                } catch (error) {
                    console.error('Error loading redux state:', error)
                }
            }
        }
    }, [isNewWindow])

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isOpen && !isNewWindow) return

            switch (e.key) {
                case 'Escape':
                    if (!isNewWindow) onClose()
                    if (aiQueryRef.current === document.activeElement) {
                        e.preventDefault()
                        setAiQuery("")
                    }
                    break
                case 'ArrowLeft':
                case 'PageUp':
                    e.preventDefault()
                    handlePreviousSlide()
                    break
                case 'ArrowRight':
                case 'PageDown':
                    e.preventDefault()
                    handleNextSlide()
                    break
                case '~':
                    e.preventDefault()
                    toggleTimer()
                    break
                case 'Enter':
                    if (e.ctrlKey && aiQuery.trim()) {
                        e.preventDefault()
                        handleGenerateAIResponse()
                    }
                    break
                case 'v':
                case 'V':
                    if (e.ctrlKey) {
                        e.preventDefault()
                        toggleListening()
                    }
                    break
                case 'a':
                case 'А':
                    if (e.ctrlKey) {
                        e.preventDefault()
                        handleAddBufferToQuery()
                    }
                    break
            }
        }

        document.addEventListener('keydown', handleKeyDown)
        return () => document.removeEventListener('keydown', handleKeyDown)
    }, [
        isOpen, 
        onClose, 
        isNewWindow, 
        aiQuery, 
        toggleTimer, 
        handlePreviousSlide, 
        handleNextSlide, 
        toggleListening, 
        handleAddBufferToQuery, 
        setAiQuery, 
        handleGenerateAIResponse
    ])

    if (!isOpen && !isNewWindow) return null

    return (
        <div className={styles.modalOverlay} style={isNewWindow ? { position: 'static', height: '100vh' } : {}}>
            <div className={styles.modal} style={isNewWindow ? { width: '100%', height: '100%', margin: 0, maxHeight: 'none' } : {}}>
                <div className={styles.content}>
                    <div className={styles.leftPanel}>
                        <SlidePreviewSection
                            currentSlide={currentSlide}
                            slideObjects={displaySlideObjects}
                            currentSlideIndex={currentSlideIndex}
                            totalSlides={displaySlides.length}
                            onPreviousSlide={handlePreviousSlide}
                            onNextSlide={handleNextSlide}
                        />
                        
                        <div className={styles.timerSection}>
                            <h3 className={styles.sectionTitle}>Таймер</h3>
                            <div className={styles.timerDisplay}>
                                {(() => {
                                    const hrs = Math.floor(timer / 3600)
                                    const mins = Math.floor((timer % 3600) / 60)
                                    const secs = timer % 60
                                    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
                                })()}
                            </div>
                            <div className={styles.timerControls}>
                                <button
                                    className={styles.timerButton}
                                    onClick={toggleTimer}
                                >
                                    {isTimerRunning ? 'Пауза' : 'Старт'}
                                </button>
                                <button
                                    className={styles.timerButton}
                                    onClick={resetTimer}
                                >
                                    Сброс
                                </button>
                            </div>
                            <div className={styles.timerHotkey}>
                                Горячая клавиша: T
                            </div>
                        </div>
                    </div>

                    <div className={styles.rightPanel}>
                        <NotesSection
                            currentSlideIndex={currentSlideIndex}
                            notes={notes}
                            onNotesChange={handleNotesChange}
                        />

                        <SpeechInputSection
                            isListening={isListening}
                            isSpeechSupported={isSpeechSupported}
                            isProcessingCommand={isProcessingCommand}
                            interimTranscript={interimTranscript}
                            finalTranscript={finalTranscript}
                            recognitionError={recognitionError}
                            audioLevel={audioLevel}
                            speechBuffer={speechBuffer}
                            bufferSize={bufferSize}
                            onToggleListening={toggleListening}
                            onClearSpeech={clearSpeechTranscript}
                            onAddBufferToQuery={handleAddBufferToQuery}
                        />

                        <AIQuerySection
                            aiQuery={aiQuery}
                            isProcessingCommand={isProcessingCommand}
                            bufferSize={bufferSize}
                            onAiQueryChange={setAiQuery}
                            textAreaRef={aiQueryRef}
                        />

                        <AIResponseSection
                            aiResponse={aiResponse}
                            isGenerating={isGenerating}
                            onGenerateResponse={() => handleGenerateAIResponse()}
                            onStopGeneration={handleStopGeneration}
                            onClearResponse={handleClearAIResponse}
                            onCopyToClipboard={handleCopyToClipboard}
                            onUseAIResponse={() => handleUseAIResponse(aiResponse)}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}