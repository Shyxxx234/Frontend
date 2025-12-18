import { useState, useEffect, useCallback, useRef } from "react"
import styles from "./SpeakerNotesModalWindow.module.css"
import { useSelector, useDispatch } from 'react-redux'
import type { RootState } from "../../store/store"
import { selectSlide } from "../../store/presentationSlice"
import { updateSlideNotes } from "../../store/slideSlice"
import type { Slide, SlideObject } from "../../store/types"
import { ShowSlide } from "../../common/ShowSlide"

type SpeakerNotesModalWindowProps = {
    isOpen: boolean
    onClose: () => void
    isNewWindow?: boolean
}

type ExternalState = {
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
    const dispatch = useDispatch()
    const slides = useSelector((state: RootState) => state.slides.slides)
    const presentation = useSelector((state: RootState) => state.presentation)
    const slideObjects = useSelector((state: RootState) => state.slideObjects.objects)
    
    const [currentSlideIndex, setCurrentSlideIndex] = useState<number>(0)
    const [notes, setNotes] = useState<string>("")
    const [debouncedNotes, setDebouncedNotes] = useState<string>("")
    const [aiResponse, setAiResponse] = useState<string>("")
    const [isGenerating, setIsGenerating] = useState(false)
    const [timer, setTimer] = useState<number>(0)
    const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false)
    const [externalSlides, setExternalSlides] = useState<Slide[]>([])
    const [externalPresentation, setExternalPresentation] = useState<ExternalState['presentation']>()
    const [externalSlideObjects, setExternalSlideObjects] = useState<Record<string, SlideObject[]>>({})
    
    const abortControllerRef = useRef<AbortController | null>(null)

    useEffect(() => {
        if (!isNewWindow) return;

        const handleMessage = (event: MessageEvent) => {
            if (event.data.type === 'INIT_REDUX_STATE') {
                localStorage.setItem('reduxState', JSON.stringify(event.data.state));
                setExternalSlides(event.data.state.slides?.slides || []);
                setExternalPresentation(event.data.state.presentation || {});
                setExternalSlideObjects(event.data.state.slideObjects?.objects || {});
            }
        };

        window.addEventListener('message', handleMessage);
        
        if (window.opener) {
            window.opener.postMessage({ type: 'REQUEST_REDUX_STATE' }, '*');
        }

        return () => window.removeEventListener('message', handleMessage);
    }, [isNewWindow]);

    useEffect(() => {
        if (isNewWindow) {
            const savedState = localStorage.getItem('reduxState');
            if (savedState) {
                try {
                    const state: ExternalState = JSON.parse(savedState);
                    setExternalSlides(state.slides?.slides || []);
                    setExternalPresentation(state.presentation || {});
                    setExternalSlideObjects(state.slideObjects?.objects || {});
                } catch (error) {
                    console.error('Error loading redux state:', error);
                }
            }
        }
    }, [isNewWindow]);

    const displaySlides = isNewWindow && externalSlides.length > 0 ? externalSlides : slides;
    const displayPresentation = isNewWindow && externalPresentation ? externalPresentation : presentation;
    const displaySlideObjects = isNewWindow && externalSlideObjects ? externalSlideObjects : slideObjects;
    const displaySelectedSlideId = displayPresentation?.selectedSlide;

    // Создаем слайд для ShowSlide как в SlideCollection
    const createSlideForShowSlide = (slide: Slide): Slide => {
        const slideId = slide.id;
        const objectsForSlide = displaySlideObjects[slideId] || [];
        
        // Создаем новый объект слайда с объектами в формате, который ожидает ShowSlide
        return {
            ...slide,
            slideObject: objectsForSlide
        };
    };

    // Получаем текущий слайд
    const getCurrentSlide = (): Slide | null => {
        if (!displaySlides.length || currentSlideIndex < 0 || currentSlideIndex >= displaySlides.length) {
            return null;
        }
        
        const originalSlide = displaySlides[currentSlideIndex];
        return createSlideForShowSlide(originalSlide);
    };

    const currentSlide = getCurrentSlide();

    // Автоматически выбираем первый слайд при загрузке
    useEffect(() => {
        if (displaySlides.length > 0 && !displaySelectedSlideId) {
            const firstSlideId = displaySlides[0].id;
            setCurrentSlideIndex(0);
            
            if (!isNewWindow) {
                dispatch(selectSlide(firstSlideId));
            }
        }
    }, [displaySlides, displaySelectedSlideId, dispatch, isNewWindow]);

    // Синхронизируем индекс с выбранным слайдом
    useEffect(() => {
        if (displaySelectedSlideId && displaySlides.length > 0) {
            const slideIndex = displaySlides.findIndex(slide => slide.id === displaySelectedSlideId);
            if (slideIndex !== -1) {
                setCurrentSlideIndex(slideIndex);
                const slide = displaySlides[slideIndex];
                setNotes(slide.notes || "");
                setDebouncedNotes(slide.notes || "");
            }
        }
    }, [displaySelectedSlideId, displaySlides]);

    const handlePreviousSlide = useCallback(() => {
        if (currentSlideIndex > 0) {
            const newIndex = currentSlideIndex - 1;
            const newSlideId = displaySlides[newIndex].id;
            
            if (isNewWindow) {
                window.opener?.postMessage({
                    type: 'SLIDE_CHANGED',
                    slideId: newSlideId
                }, '*');
                
                setCurrentSlideIndex(newIndex);
                const slide = displaySlides[newIndex];
                setNotes(slide.notes || "");
                setDebouncedNotes(slide.notes || "");
            } else {
                dispatch(selectSlide(newSlideId));
            }
        }
    }, [currentSlideIndex, displaySlides, dispatch, isNewWindow]);

    const handleNextSlide = useCallback(() => {
        if (currentSlideIndex < displaySlides.length - 1) {
            const newIndex = currentSlideIndex + 1;
            const newSlideId = displaySlides[newIndex].id;
            
            if (isNewWindow) {
                window.opener?.postMessage({
                    type: 'SLIDE_CHANGED',
                    slideId: newSlideId
                }, '*');
                
                setCurrentSlideIndex(newIndex);
                const slide = displaySlides[newIndex];
                setNotes(slide.notes || "");
                setDebouncedNotes(slide.notes || "");
            } else {
                dispatch(selectSlide(newSlideId));
            }
        }
    }, [currentSlideIndex, displaySlides, dispatch, isNewWindow]);

    // Debounced обновление заметок
    useEffect(() => {
        const handler = setTimeout(() => {
            if (currentSlide?.id && debouncedNotes !== notes && debouncedNotes !== undefined) {
                if (isNewWindow) {
                    localStorage.setItem(`notes_${currentSlide.id}`, debouncedNotes);
                    
                    window.opener?.postMessage({
                        type: 'NOTES_UPDATED',
                        slideId: currentSlide.id,
                        notes: debouncedNotes
                    }, '*');
                } else {
                    dispatch(updateSlideNotes({
                        slideId: currentSlide.id,
                        notes: debouncedNotes
                    }));
                }
            }
        }, 500);

        return () => {
            clearTimeout(handler);
        };
    }, [debouncedNotes, currentSlide?.id, dispatch, notes, isNewWindow]);

    // Обработка обновлений заметок в новом окне
    useEffect(() => {
        if (!isNewWindow) return;

        const handleNotesUpdate = (event: MessageEvent) => {
            if (event.data.type === 'NOTES_UPDATED' && event.data.slideId === currentSlide?.id) {
                setNotes(event.data.notes);
                setDebouncedNotes(event.data.notes);
            }
        };

        window.addEventListener('message', handleNotesUpdate);
        return () => window.removeEventListener('message', handleNotesUpdate);
    }, [isNewWindow, currentSlide?.id]);

    // Обработка горячих клавиш
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isOpen && !isNewWindow) return;

            switch (e.key) {
                case 'Escape':
                    if (!isNewWindow) {
                        onClose();
                    }
                    break;
                case 'ArrowLeft':
                case 'PageUp':
                    e.preventDefault();
                    handlePreviousSlide();
                    break;
                case 'ArrowRight':
                case 'PageDown':
                case ' ':
                    e.preventDefault();
                    handleNextSlide();
                    break;
                case 't':
                case 'Т':
                    toggleTimer();
                    break;
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose, handlePreviousSlide, handleNextSlide, isNewWindow]);

    // Таймер
    useEffect(() => {
        let interval: number | null = null;

        if (isTimerRunning) {
            interval = window.setInterval(() => {
                setTimer(prev => prev + 1);
            }, 1000);
        }

        return () => {
            if (interval !== null) {
                window.clearInterval(interval);
            }
        };
    }, [isTimerRunning]);

    const toggleTimer = () => {
        setIsTimerRunning(prev => !prev);
    };

    const resetTimer = () => {
        setTimer(0);
        setIsTimerRunning(false);
    };

    const formatTime = (seconds: number): string => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newNotes = e.target.value;
        setNotes(newNotes);
        setDebouncedNotes(newNotes);
    };

    const handleGenerateAIResponse = async () => {
        if (!notes.trim()) return;

        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        const controller = new AbortController();
        abortControllerRef.current = controller;

        setIsGenerating(true);
        setAiResponse("");

        try {
            const response = await fetch('/api/ai/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: "local-model",
                    messages: [
                        {
                            role: "system",
                            content: "Ты помогаешь отвечать на вопросы. Ты должен дать краткий, но ёмкий ответ. Отвечай на русском языке.\n"
                        },
                        {
                            role: "user",
                            content: `${notes}`
                        }
                    ],
                    temperature: 0.7,
                    max_tokens: 1000,
                    stream: true
                }),
                signal: controller.signal
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const reader = response.body?.getReader();
            const decoder = new TextDecoder('utf-8');

            if (!reader) {
                throw new Error("Не удалось получить поток данных");
            }

            try {
                while (true) {
                    const { done, value } = await reader.read();
                    
                    if (done) {
                        break;
                    }

                    const chunk = decoder.decode(value);
                    const lines = chunk.split('\n').filter(line => line.trim() !== '');

                    for (const line of lines) {
                        if (line.startsWith('data: ')) {
                            const data = line.slice(6);
                            
                            if (data === '[DONE]') {
                                break;
                            }

                            try {
                                const parsed = JSON.parse(data);
                                const content = parsed.choices[0]?.delta?.content || '';
                                
                                if (content) {
                                    setAiResponse(prev => prev + content);
                                }
                            } catch (error) {
                                console.error('Ошибка парсинга данных:', error);
                            }
                        }
                    }
                }
            } finally {
                reader.releaseLock();
            }
        } finally {
            setIsGenerating(false);
            abortControllerRef.current = null;
        }
    };

    const handleStopGeneration = () => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
    };

    const handleClearAIResponse = () => {
        setAiResponse("");
    };

    const handleCopyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(aiResponse);
            alert("Текст скопирован в буфер обмена");
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const handleUseAIResponse = () => {
        const newNotes = notes + "\n\n--- AI совет ---\n" + aiResponse;
        setNotes(newNotes);
        setDebouncedNotes(newNotes);
    };

    if (!isOpen && !isNewWindow) return null;

    return (
        <div className={styles.modalOverlay} style={isNewWindow ? { position: 'static', height: '100vh' } : {}}>
            <div className={styles.modal} style={isNewWindow ? { width: '100%', height: '100%', margin: 0, maxHeight: 'none' } : {}}>
                <div className={styles.header}>
                    <h2 className={styles.title}>Режим докладчика</h2>
                    {!isNewWindow && (
                        <button className={styles.closeButton} onClick={onClose}>×</button>
                    )}
                </div>

                <div className={styles.content}>
                    <div className={styles.leftPanel}>
                        <div className={styles.slidePreview}>
                            <div className={styles.slideNumber}>
                                Слайд {currentSlideIndex + 1} из {displaySlides.length}
                            </div>
                            <div className={styles.previewContainer}>
                                {currentSlide ? (
                                    <ShowSlide
                                        slide={currentSlide}
                                        className={styles.slide}
                                        disableObjectClicks={true}
                                        slideId={currentSlide.id}
                                        objSelection={[]}
                                    />
                                ) : (
                                    <div className={styles.noSlide}>
                                        {displaySlides.length === 0 ? "Нет слайдов" : "Выберите слайд"}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className={styles.navigation}>
                            <button
                                className={styles.navButton}
                                onClick={handlePreviousSlide}
                                disabled={currentSlideIndex === 0}
                            >
                                ← Предыдущий
                            </button>
                            <button
                                className={styles.navButton}
                                onClick={handleNextSlide}
                                disabled={currentSlideIndex === displaySlides.length - 1}
                            >
                                Следующий →
                            </button>
                        </div>

                        <div className={styles.timerSection}>
                            <h3 className={styles.sectionTitle}>Таймер</h3>
                            <div className={styles.timerDisplay}>
                                {formatTime(timer)}
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
                        <div className={styles.notesSection}>
                            <h3 className={styles.sectionTitle}>
                                Заметки к слайду {currentSlideIndex + 1}
                            </h3>
                            <textarea
                                className={styles.notesTextarea}
                                value={notes}
                                onChange={handleNotesChange}
                                placeholder="Введите заметки для этого слайда..."
                                rows={10}
                            />
                            <div className={styles.notesInfo}>
                                Длина: {notes.length} символов
                            </div>
                        </div>

                        <div className={styles.aiSection}>
                            <h3 className={styles.sectionTitle}>Помощник AI (LM Studio)</h3>
                            <div className={styles.aiControls}>
                                <button
                                    className={styles.aiButton}
                                    onClick={handleGenerateAIResponse}
                                    disabled={isGenerating || !notes.trim()}
                                >
                                    {isGenerating ? 'Генерация...' : 'Анализировать заметки'}
                                </button>
                                
                                {isGenerating && (
                                    <button
                                        className={styles.stopButton}
                                        onClick={handleStopGeneration}
                                        style={{ backgroundColor: '#ff4444', color: 'white' }}
                                    >
                                        Остановить
                                    </button>
                                )}
                                
                                <button
                                    className={styles.clearButton}
                                    onClick={handleClearAIResponse}
                                    disabled={!aiResponse || isGenerating}
                                >
                                    Очистить
                                </button>
                                <button
                                    className={styles.actionButton}
                                    onClick={handleCopyToClipboard}
                                    disabled={!aiResponse || isGenerating}
                                >
                                    Копировать
                                </button>
                                <button
                                    className={styles.actionButton}
                                    onClick={handleUseAIResponse}
                                    disabled={!aiResponse || isGenerating}
                                >
                                    Использовать
                                </button>
                            </div>

                            <div className={styles.aiResponseContainer}>
                                {aiResponse && (
                                    <>
                                        <h4>Советы от AI:</h4>
                                        <div className={styles.responseContent}>
                                            {aiResponse}
                                            {isGenerating && (
                                                <span className={styles.typingIndicator}>▌</span>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className={styles.footer}>
                    <div className={styles.hotkeyInfo}>
                        <span>←/→: Навигация</span>
                        <span>Пробел: Следующий слайд</span>
                        <span>T: Таймер</span>
                        {!isNewWindow && <span>Esc: Выход</span>}
                    </div>
                    <div className={styles.presentationInfo}>
                        Презентация: {displayPresentation?.title || "Без названия"}
                    </div>
                </div>
            </div>
        </div>
    )
}