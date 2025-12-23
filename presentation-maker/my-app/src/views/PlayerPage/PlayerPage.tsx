import { useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { selectSlide } from '../../store/presentationSlice';
import type { RootState } from '../../store/store';
import { ShowSlide } from '../../common/ShowSlide';
import styles from './playerPage.module.css';

const SLIDE_WIDTH = 1920;
const SLIDE_HEIGHT = 1080;

const ZOOM = 1.38;        
const OFFSET_X = -360;    
const OFFSET_Y = -210;    

export function PlayerPage() {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const slides = useSelector((state: RootState) => state.slides.slides);
    const presentation = useSelector((state: RootState) => state.presentation);
    const slideObjects = useSelector((state: RootState) => state.slideObjects.objects);

    const selectedSlideId = presentation.selectedSlide;
    const slideIndex = slides.findIndex(slide => slide.id === selectedSlideId);
    const slide = slides[slideIndex];

    const containerRef = useRef<HTMLDivElement>(null);

    const goToPreviousSlide = useCallback(() => {
        if (slideIndex > 0) {
            const prevSlide = slides[slideIndex - 1];
            dispatch(selectSlide(prevSlide.id));
        }
    }, [slideIndex, slides, dispatch]);

    const goToNextSlide = useCallback(() => {
        if (slideIndex < slides.length - 1) {
            const nextSlide = slides[slideIndex + 1];
            dispatch(selectSlide(nextSlide.id));
        }
    }, [slideIndex, slides, dispatch]);

    const handleExit = useCallback(() => {
        history.replaceState('player', '');
        navigate('/editor');
    }, [navigate]);

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        switch (e.key) {
            case 'ArrowLeft':
            case 'PageUp':
                goToPreviousSlide();
                break;
            case 'ArrowRight':
            case 'PageDown':
                goToNextSlide();
                break;
            case 'Escape':
                handleExit();
                break;
        }
    }, [goToPreviousSlide, goToNextSlide, handleExit]);

    const handleMouseDown = useCallback(() => {
        goToNextSlide();
    }, [goToNextSlide]);

    useEffect(() => {
        document.addEventListener('mousedown', handleMouseDown);
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('mousedown', handleMouseDown);
        };
    }, [handleKeyDown, handleMouseDown]);

    useEffect(() => {
        if (slides.length > 0 && !selectedSlideId) {
            dispatch(selectSlide(slides[0].id));
        }
    }, [slides, selectedSlideId, dispatch]);

    useEffect(() => {
        document.body.style.margin = '0';
        document.body.style.padding = '0';
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);

    useEffect(() => {
        if (document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen().catch(console.warn);
        }
    }, []);

    const getSlideWithObjects = useCallback(() => {
        if (!slide) return null;
        return {
            ...slide,
            slideObject: slideObjects[slide.id] || []
        };
    }, [slide, slideObjects]);

    const currentSlideWithObjects = getSlideWithObjects();

    return (
        <div className={styles.playerPage}>
            {currentSlideWithObjects ? (
                <div
                    ref={containerRef}
                    className={styles.slideZoomContainer}
                    style={{
                        width: '100vw',
                        height: '100vh',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        overflow: 'hidden',
                        position: 'relative',
                    }}
                >
                    <div
                        style={{
                            transform: `translate(${-OFFSET_X}px, ${-OFFSET_Y}px)`,
                            transformOrigin: 'top left',
                        }}
                    >
                        <div
                            style={{
                                width: `${SLIDE_WIDTH}px`,
                                height: `${SLIDE_HEIGHT}px`,
                                zoom: ZOOM,
                                MozTransform: `scale(${ZOOM})`,
                                WebkitTransform: `scale(${ZOOM})`,
                                msTransform: `scale(${ZOOM})`,
                                transform: `scale(${ZOOM})`,
                                transformOrigin: 'top left',
                                position: 'relative',
                            }}
                        >
                            <ShowSlide
                                slide={currentSlideWithObjects}
                                disableObjectClicks={true}
                                slideId={currentSlideWithObjects.id}
                                style={{
                                    width: `${SLIDE_WIDTH}px`,
                                    height: `${SLIDE_HEIGHT}px`,
                                }}
                            />
                        </div>
                    </div>
                </div>
            ) : (
                <div className={styles.noSlide}>
                    {slides.length === 0 ? "Нет слайдов" : "Загрузка..."}
                </div>
            )}
        </div>
    );
}